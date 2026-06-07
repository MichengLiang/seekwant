import cytoscape from "cytoscape";
import { useCallback, useEffect, useRef } from "react";
import { getPredicateLabel } from "../lib/predicate-i18n";
import {
  type GraphData,
  getNodeLabel,
  type LabelMode,
} from "../lib/ttl-parser";

interface TtlGraphProps {
  data: GraphData;
  labelMode: LabelMode;
  /** Node the graph should focus/zoom to (from sidebar or double-click). */
  focusedNodeId: string | null;
  /** Node whose detail panel is open (only set by double-click). */
  detailNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  /** Increment this to trigger a one-shot cy.resize() + fit. */
  resizeKey: number;
  /** Show Chinese predicate labels on edges. */
  predicateChinese: boolean;
}

// Soft, warm palette — works well on light backgrounds
const PALETTE = [
  "#5b8db8", // steel blue
  "#e07b53", // warm orange
  "#7daf6c", // sage green
  "#c06090", // dusty rose
  "#8b7ec8", // lavender
  "#d4a84b", // golden
  "#5caea8", // teal
  "#b8805a", // camel
  "#7b9bb5", // slate blue
  "#a8a8a8", // warm gray
];

export function buildElements(
  data: GraphData,
  labelMode: LabelMode,
  predicateChinese: boolean,
) {
  const nodeDefs: cytoscape.NodeDefinition[] = data.nodes.map((n) => {
    const label = getNodeLabel(n, labelMode);
    // Compute node diameter: base 48, scale up for longer labels
    // Extra 4px buffer accounts for bold text being slightly wider
    const charCount = label.replace(/\n.*/, "").length;
    const size = Math.max(48, Math.min(80, 36 + charCount * 6));
    return {
      group: "nodes" as const,
      data: {
        id: n.id,
        label,
        headline: n.headline,
        addressLabel: n.addressLabel,
        faction:
          n.metadata.faction ??
          n.metadata["syndrome-type"] ??
          n.metadata.type ??
          "",
        nodeSize: size,
      },
    };
  });

  const edgeDefs: cytoscape.EdgeDefinition[] = data.edges.map((e) => ({
    group: "edges" as const,
    data: {
      id: e.id,
      source: e.source,
      target: e.target,
      label: getPredicateLabel(e.rel, predicateChinese),
      weight: e.weight,
    },
  }));

  return { nodes: nodeDefs, edges: edgeDefs };
}

export function buildColorMap(
  nodes: cytoscape.NodeDefinition[],
): Map<string, string> {
  const factions = [
    ...new Set(nodes.map((n) => n.data.faction as string).filter(Boolean)),
  ];
  const map = new Map<string, string>();
  factions.forEach((f, i) => {
    const color = PALETTE[i % PALETTE.length] ?? "#5b8db8";
    map.set(f, color);
  });
  return map;
}

/** Darken a hex color by a fraction (0–1). */
export function darken(hex: string, fraction: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - fraction))}, ${Math.round(g * (1 - fraction))}, ${Math.round(b * (1 - fraction))})`;
}

function focusNeighborhood(cy: cytoscape.Core, nodeId: string) {
  const node = cy.getElementById(nodeId);
  if (node.length === 0) return;
  const neighborhood = node.closedNeighborhood();

  cy.batch(() => {
    cy.elements().removeClass("faded focused neighbor neighbor-edge");
    cy.elements().addClass("faded");
    neighborhood.removeClass("faded");
    node.addClass("focused");
    neighborhood.nodes().not(node).addClass("neighbor");
    neighborhood.edges().addClass("neighbor-edge");
  });

  animateFit(cy, neighborhood, 80, 500);
}

function resetFocus(cy: cytoscape.Core, animate = false) {
  cy.elements().removeClass("faded focused neighbor neighbor-edge");
  if (animate) {
    animateFit(cy, cy.elements(), 50, 400);
  }
}

function isLiveCore(cy: cytoscape.Core | null): cy is cytoscape.Core {
  return cy !== null && !cy.destroyed();
}

function animateFit(
  cy: cytoscape.Core,
  eles: cytoscape.CollectionReturnValue,
  padding: number,
  duration: number,
) {
  if (!isLiveCore(cy)) return;
  cy.stop(true);
  cy.animate(
    { fit: { eles, padding } },
    { duration, easing: "ease-out-cubic" },
  );
}

export function TtlGraph({
  data,
  labelMode,
  focusedNodeId,
  detailNodeId: _detailNodeId,
  onNodeSelect,
  resizeKey,
  predicateChinese,
}: TtlGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const colorMapRef = useRef<Map<string, string>>(new Map());
  const prevSelectedRef = useRef<string | null>(null);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const { nodes, edges } = buildElements(data, labelMode, predicateChinese);
    const colorMap = buildColorMap(nodes);
    colorMapRef.current = colorMap;

    const cy = cytoscape({
      container: containerRef.current,
      elements: { nodes, edges },
      layout: {
        name: "cose",
        animate: false,
        nodeRepulsion: () => 8000,
        idealEdgeLength: () => 150,
        edgeElasticity: () => 100,
        padding: 60,
        randomize: false,
        componentSpacing: 80,
        nestingFactor: 1.2,
        gravity: 0.2,
        numIter: 1500,
      },
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-wrap": "wrap",
            "text-max-width": "100px",
            "text-valign": "center",
            "text-halign": "center",
            "text-margin-y": 0,
            "font-size": "11px",
            "font-weight": 500,
            "font-family":
              '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
            "background-color": (ele: cytoscape.NodeSingular) => {
              const faction = ele.data("faction") as string;
              return colorMap.get(faction) ?? "#5b8db8";
            },
            width: "data(nodeSize)",
            height: "data(nodeSize)",
            "border-width": "2.5px",
            "border-color": (ele: cytoscape.NodeSingular) => {
              const faction = ele.data("faction") as string;
              const base = colorMap.get(faction) ?? "#5b8db8";
              return darken(base, 0.15);
            },
            color: "#374151",
            "text-outline-width": 0,
            "background-opacity": 0.88,
          } as cytoscape.Css.Node,
        },
        {
          selector: "node:selected",
          style: {
            "border-width": "3.5px",
            "border-color": "#ef4444",
            "background-opacity": 1,
            "font-weight": 700,
          } as cytoscape.Css.Node,
        },
        {
          selector: "node.faded",
          style: {
            opacity: 0.12,
            "text-opacity": 0.08,
          } as cytoscape.Css.Node,
        },
        {
          selector: "node.focused",
          style: {
            "border-width": "3.5px",
            "border-color": "#2563eb",
            "background-opacity": 1,
            "font-weight": 700,
          } as cytoscape.Css.Node,
        },
        {
          selector: "node.neighbor",
          style: {
            "background-opacity": 1,
            "border-width": "2.5px",
          } as cytoscape.Css.Node,
        },
        {
          selector: "edge",
          style: {
            label: "data(label)",
            "font-size": "10px",
            "font-weight": 400,
            "font-family":
              '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif',
            color: "#6b7280",
            "text-outline-width": 2.5,
            "text-outline-color": "#f5f3ef",
            "text-rotation": "autorotate",
            "text-margin-y": -10,
            width: "mapData(weight, 0, 1, 1, 3.5)",
            "line-color": "#c9cdd4",
            "target-arrow-color": "#b0b7c0",
            "target-arrow-shape": "triangle",
            "arrow-scale": 0.8,
            "curve-style": "bezier",
            opacity: 0.7,
          } as cytoscape.Css.Edge,
        },
        {
          selector: "edge:selected",
          style: {
            "line-color": "#ef4444",
            "target-arrow-color": "#ef4444",
            color: "#ef4444",
            opacity: 1,
            width: 3,
          } as cytoscape.Css.Edge,
        },
        {
          selector: "edge.faded",
          style: {
            opacity: 0.06,
            "text-opacity": 0.04,
          } as cytoscape.Css.Edge,
        },
        {
          selector: "edge.neighbor-edge",
          style: {
            opacity: 1,
            "line-color": "#93c5fd",
            "target-arrow-color": "#93c5fd",
            width: 2.5,
          } as cytoscape.Css.Edge,
        },
      ],
    });

    cyRef.current = cy;
    prevSelectedRef.current = null;

    // --- Double-click: notify parent (animation handled by useEffect) ---
    cy.on("dblclick", "node", (evt) => {
      onNodeSelect(evt.target.id());
    });

    // --- Click background: reset focus ---
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        resetFocus(cy, false);
        onNodeSelect(null);
      }
    });

    // --- Single click on a faded node: refocus ---
    cy.on("tap", "node.faded", (evt) => {
      onNodeSelect(evt.target.id());
    });

    return () => {
      cy.removeAllListeners();
      cy.stop(true);
      cy.elements().stop(true);
      cy.destroy();
      cyRef.current = null;
    };
  }, [data, labelMode, onNodeSelect, predicateChinese]);

  // Update labels when labelMode changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      for (const node of data.nodes) {
        const ele = cy.getElementById(node.id);
        if (ele.length > 0) {
          ele.data("label", getNodeLabel(node, labelMode));
        }
      }
    });
  }, [labelMode, data.nodes]);

  // Update edge labels when predicateChinese changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      for (const edge of data.edges) {
        const ele = cy.getElementById(edge.id);
        if (ele.length > 0) {
          ele.data("label", getPredicateLabel(edge.rel, predicateChinese));
        }
      }
    });
  }, [predicateChinese, data.edges]);

  // Focus/unfocus: only CSS classes + animate on focus.
  // On un-focus (→null), just clear classes — NO animation here,
  // because the resizeKey effect will handle the fit after panel transition.
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const prev = prevSelectedRef.current;
    if (focusedNodeId === prev) return;
    prevSelectedRef.current = focusedNodeId;

    if (focusedNodeId) {
      focusNeighborhood(cy, focusedNodeId);
    } else if (prev !== null) {
      cy.elements().removeClass("faded focused neighbor neighbor-edge");
    }
  }, [focusedNodeId]);

  // After panel transition ends: resize container + fit to viewport.
  // This is the ONLY place that calls cy.resize() + fit animation,
  // so there's never a second competing animate().
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || resizeKey === 0) return;
    requestAnimationFrame(() => {
      if (cyRef.current !== cy || !isLiveCore(cy)) return;
      cy.resize();
      animateFit(cy, cy.elements(), 50, 400);
    });
  }, [resizeKey]);

  const handleFit = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().removeClass("faded focused neighbor neighbor-edge");
    prevSelectedRef.current = null;
    if (focusedNodeId) {
      // Panel is open — just close it; resizeKey effect will animate after transition
      onNodeSelect(null);
    } else {
      // Panel closed — fit directly
      animateFit(cy, cy.elements(), 50, 400);
    }
  }, [onNodeSelect, focusedNodeId]);

  return (
    <div className="relative h-full w-full" style={{ background: "#faf9f6" }}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        {focusedNodeId ? (
          <button
            className="rounded-lg border border-blue-200 bg-white/90 px-3.5 py-2 text-sm text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
            onClick={handleFit}
            type="button"
          >
            退出聚焦
          </button>
        ) : null}
        <button
          className="rounded-lg border border-gray-200 bg-white/90 px-3.5 py-2 text-sm text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          onClick={handleFit}
          type="button"
        >
          适配视图
        </button>
      </div>
    </div>
  );
}
