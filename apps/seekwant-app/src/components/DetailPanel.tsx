import { useCallback, useEffect, useRef, useState } from "react";
import type { GraphNode } from "../lib/ttl-parser";

const MIN_WIDTH = 280;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 380;
const PANEL_TRANSITION_MS = 180;
const SOURCE_LOCATION_KEYS = new Set(["relativePath", "startLine", "endLine"]);
const STRUCTURE_DIAGNOSTIC_KEYS = new Set([
  "contentEndLine",
  "contentStartLine",
  "headingLevel",
  "headingLine",
  "metadataEndLine",
  "metadataStartLine",
  "role",
]);
const NON_BUSINESS_KEYS = new Set([
  ...SOURCE_LOCATION_KEYS,
  ...STRUCTURE_DIAGNOSTIC_KEYS,
]);

interface DetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
  /** Called once when the panel's CSS width transition finishes. */
  onTransitionEnd?: () => void;
}

export function DetailPanel({
  node,
  onClose,
  onTransitionEnd,
}: DetailPanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isOpen = node !== null;

  // Drag resize
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startWidth: width };
      setDragging(true);
    },
    [width],
  );

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - e.clientX;
      const newWidth = Math.max(
        MIN_WIDTH,
        Math.min(MAX_WIDTH, dragRef.current.startWidth + delta),
      );
      setWidth(newWidth);
    }
    function handleMouseUp() {
      dragRef.current = null;
      setDragging(false);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Esc to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (node) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [node, onClose]);

  // The RDF payload keeps parser coordinates inside metadata, but the public
  // detail view treats source location, business attributes, and diagnostics as
  // separate reading surfaces so the same coordinates are not shown twice.
  const businessMeta = node
    ? Object.entries(node.metadata).filter(([k]) => !NON_BUSINESS_KEYS.has(k))
    : [];
  const structureDiagnostics = node
    ? Object.entries(node.metadata).filter(([k]) =>
        STRUCTURE_DIAGNOSTIC_KEYS.has(k),
      )
    : [];
  const sourceLocation = node
    ? [
        node.relativePath,
        node.startLine || node.endLine
          ? `行 ${node.startLine}-${node.endLine}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  return (
    <div
      ref={panelRef}
      className="relative flex-shrink-0 overflow-hidden border-l border-gray-200 bg-white"
      style={{
        width: isOpen ? width : 0,
        transition: dragging
          ? "none"
          : `width ${PANEL_TRANSITION_MS}ms ease-out`,
      }}
      onTransitionEnd={(e) => {
        if (e.target === panelRef.current && e.propertyName === "width") {
          onTransitionEnd?.();
        }
      }}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag resize handle */}
      <div
        className="absolute top-0 left-0 z-10 h-full w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-400"
        onMouseDown={handleMouseDown}
        onKeyDown={() => {}}
      />

      {node ? (
        <div className="flex h-full flex-col overflow-hidden" style={{ width }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <h2 className="truncate font-semibold text-gray-800 text-sm">
                <span data-testid="detail-panel-title">{node.headline}</span>
              </h2>
              {node.addressLabel ? (
                <span className="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-500 text-xs">
                  {node.addressLabel}
                </span>
              ) : null}
            </div>
            <button
              className="flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              onClick={onClose}
              type="button"
              aria-label="关闭"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Business metadata — compact badges */}
          {businessMeta.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 border-b border-gray-100 px-4 py-2">
              {businessMeta.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs"
                >
                  <span className="text-blue-500">{key}</span>
                  <span className="text-blue-700">{value}</span>
                </span>
              ))}
            </div>
          ) : null}

          {/* Structure diagnostics — parser coordinates, collapsed by default */}
          {structureDiagnostics.length > 0 ? (
            <details
              className="border-b border-gray-100 text-xs"
              data-testid="detail-structure-diagnostics"
            >
              <summary className="cursor-pointer px-4 py-1.5 text-gray-400 hover:text-gray-600">
                结构诊断 ({structureDiagnostics.length})
              </summary>
              <div className="border-t border-gray-100 px-4 py-2">
                {structureDiagnostics.map(([key, value]) => (
                  <div key={key} className="flex gap-2 py-0.5">
                    <span className="w-28 flex-shrink-0 text-gray-400">
                      {key}
                    </span>
                    <span className="min-w-0 break-all font-mono text-gray-500">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          ) : null}

          {/* Raw content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="font-medium text-gray-500 text-xs uppercase tracking-wide">
                AsciiDoc 源码
              </span>
              {sourceLocation ? (
                <span
                  className="min-w-0 break-all font-mono text-gray-400 text-xs"
                  data-testid="detail-source-location"
                >
                  {sourceLocation}
                </span>
              ) : null}
            </div>
            <pre
              className="overflow-x-auto rounded-lg bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap break-words"
              data-testid="detail-raw-source"
            >
              {node.raw ||
                "该 heading 在 RDF 投影中没有独立源码切片，请以上方源文件坐标定位。"}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
