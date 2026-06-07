import { describe, expect, it } from "vitest";
import type { GraphData, GraphNode } from "../../lib/ttl-parser";
import { buildColorMap, buildElements, darken } from "../TtlGraph";

function expectDefined<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  if (value === undefined) {
    throw new Error("Expected value to be defined");
  }
  return value;
}

function makeNode(
  id: string,
  headline: string,
  metadata: Record<string, string> = {},
): GraphNode {
  return {
    id,
    headline,
    addressLabel: id,
    generatedAddressLabel: null,
    labels: [id, headline],
    raw: "",
    relativePath: "test.adoc",
    startLine: 1,
    endLine: 1,
    metadata,
  };
}

const sourceDocument = {
  entryPath: "test.adoc",
  files: [{ relativePath: "test.adoc", raw: "" }],
};

const mockData: GraphData = {
  nodes: [
    makeNode("node-a", "Node A", { faction: "red" }),
    makeNode("node-b", "Node B", { faction: "blue" }),
    makeNode("node-c", "Node C"),
  ],
  edges: [
    {
      id: "e1",
      source: "node-a",
      target: "node-b",
      rel: "depends-on",
      weight: 0.8,
    },
    {
      id: "e2",
      source: "node-b",
      target: "node-c",
      rel: "references",
      weight: 0.3,
    },
  ],
  documentRoot: null,
  addressToNodeId: new Map(),
  sourceDocument,
};

describe("buildElements", () => {
  it("creates node definitions from graph data", () => {
    const { nodes } = buildElements(mockData, "headline", false);
    expect(nodes).toHaveLength(3);
    const firstNode = expectDefined(nodes[0]);
    expect(firstNode.data.id).toBe("node-a");
    expect(firstNode.data.label).toBe("Node A");
    expect(firstNode.group).toBe("nodes");
  });

  it("uses addressLabel mode", () => {
    const { nodes } = buildElements(mockData, "addressLabel", false);
    expect(expectDefined(nodes[0]).data.label).toBe("node-a");
  });

  it("uses both mode", () => {
    const { nodes } = buildElements(mockData, "both", false);
    const firstNode = expectDefined(nodes[0]);
    expect(firstNode.data.label).toContain("Node A");
    expect(firstNode.data.label).toContain("node-a");
  });

  it("creates edge definitions from graph data", () => {
    const { edges } = buildElements(mockData, "headline", false);
    expect(edges).toHaveLength(2);
    const firstEdge = expectDefined(edges[0]);
    expect(firstEdge.data.source).toBe("node-a");
    expect(firstEdge.data.target).toBe("node-b");
    expect(firstEdge.data.label).toBe("depends-on");
    expect(firstEdge.data.weight).toBe(0.8);
    expect(firstEdge.group).toBe("edges");
  });

  it("uses Chinese predicate labels when enabled", () => {
    const { edges } = buildElements(mockData, "headline", true);
    expect(expectDefined(edges[0]).data.label).toBe("依赖");
    expect(expectDefined(edges[1]).data.label).toBe("引用");
  });

  it("computes node size based on label length", () => {
    const shortLabel: GraphData = {
      nodes: [makeNode("ab", "AB")],
      edges: [],
      documentRoot: null,
      addressToNodeId: new Map(),
      sourceDocument,
    };
    const { nodes } = buildElements(shortLabel, "headline", false);
    expect(expectDefined(nodes[0]).data.nodeSize).toBe(48); // min size
  });

  it("uses faction metadata for coloring", () => {
    const { nodes } = buildElements(mockData, "headline", false);
    expect(expectDefined(nodes[0]).data.faction).toBe("red");
    expect(expectDefined(nodes[1]).data.faction).toBe("blue");
    expect(expectDefined(nodes[2]).data.faction).toBe("");
  });

  it("falls back to syndrome-type and type metadata", () => {
    const data: GraphData = {
      nodes: [
        makeNode("x", "X", { "syndrome-type": "cold" }),
        makeNode("y", "Y", { type: "service" }),
      ],
      edges: [],
      documentRoot: null,
      addressToNodeId: new Map(),
      sourceDocument,
    };
    const { nodes } = buildElements(data, "headline", false);
    expect(expectDefined(nodes[0]).data.faction).toBe("cold");
    expect(expectDefined(nodes[1]).data.faction).toBe("service");
  });
});

describe("buildColorMap", () => {
  it("assigns colors to factions", () => {
    const { nodes } = buildElements(mockData, "headline", false);
    const map = buildColorMap(nodes);
    expect(map.get("red")).toBeDefined();
    expect(map.get("blue")).toBeDefined();
    expect(map.get("red")).not.toBe(map.get("blue"));
  });

  it("wraps around palette for many factions", () => {
    const manyFactions = Array.from({ length: 15 }, (_, i) => ({
      group: "nodes" as const,
      data: {
        id: `n${i}`,
        label: `N${i}`,
        headline: `N${i}`,
        addressLabel: `n${i}`,
        faction: `faction-${i}`,
        nodeSize: 48,
      },
    }));
    const map = buildColorMap(manyFactions);
    expect(map.size).toBe(15);
    // faction-10 should wrap around to PALETTE[0]
    expect(map.get("faction-10")).toBe(map.get("faction-0"));
  });

  it("returns empty map when no factions", () => {
    const noFactions = [
      {
        group: "nodes" as const,
        data: {
          id: "n1",
          label: "N1",
          headline: "N1",
          addressLabel: "n1",
          faction: "",
          nodeSize: 48,
        },
      },
    ];
    const map = buildColorMap(noFactions);
    expect(map.size).toBe(0);
  });
});

describe("darken", () => {
  it("darkens a hex color by a fraction", () => {
    expect(darken("#ff0000", 0.5)).toBe("rgb(128, 0, 0)");
    expect(darken("#00ff00", 0.5)).toBe("rgb(0, 128, 0)");
    expect(darken("#0000ff", 0.5)).toBe("rgb(0, 0, 128)");
  });

  it("returns original color when fraction is 0", () => {
    expect(darken("#ffffff", 0)).toBe("rgb(255, 255, 255)");
  });

  it("returns black when fraction is 1", () => {
    expect(darken("#ffffff", 1)).toBe("rgb(0, 0, 0)");
  });

  it("handles partial darkening", () => {
    const result = darken("#808080", 0.25);
    expect(result).toBe("rgb(96, 96, 96)");
  });
});
