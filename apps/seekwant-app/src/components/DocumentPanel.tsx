import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { renderOfficialAsciiDoc } from "../lib/adoc-renderer";
import type { DocumentNode, SourceDocument } from "../lib/ttl-parser";

const MIN_WIDTH = 360;
const DEFAULT_WIDTH = 520;
const PANEL_TRANSITION_MS = 180;
const SECTION_CLASS_RE = /^sect\d+$/;
type DocumentPanelMode = "rendered" | "source";

interface DocumentPanelProps {
  documentRoot: DocumentNode | null;
  sourceDocument: SourceDocument;
  focusedNodeId: string | null;
  addressToNodeId: Map<string, string>;
  onHeadingClick: (nodeId: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

function isSectionElement(element: Element): boolean {
  return [...element.classList].some((className) =>
    SECTION_CLASS_RE.test(className),
  );
}

function isHeadingElement(element: Element): boolean {
  return /^H[1-6]$/.test(element.tagName);
}

function headingLevel(element: Element): number {
  return Number(element.tagName.slice(1));
}

function createHeadingBlock(heading: Element, nodeId: string) {
  const parent = heading.parentElement;
  if (!parent) return;

  const block = document.createElement("div");
  block.className = "asciidoc-heading-block";
  block.setAttribute("data-node-id", nodeId);
  block.setAttribute("data-focus-node-id", nodeId);
  parent.insertBefore(block, heading);
  block.append(heading);

  const sectionBody = [...parent.children].find((child) =>
    child.classList.contains("sectionbody"),
  );
  if (sectionBody) {
    // Asciidoctor nests child sections inside `.sectionbody`; the graph node
    // represents only this heading's own prose/blocks, not descendant headings.
    for (const child of [...sectionBody.children]) {
      if (!isSectionElement(child)) {
        block.append(child);
      }
    }
    return;
  }

  const level = headingLevel(heading);
  let sibling = block.nextElementSibling;
  while (sibling) {
    if (
      isSectionElement(sibling) ||
      (isHeadingElement(sibling) && headingLevel(sibling) <= level)
    ) {
      break;
    }
    block.append(sibling);
    sibling = block.nextElementSibling;
  }
}

export function DocumentPanel({
  documentRoot,
  sourceDocument,
  focusedNodeId,
  addressToNodeId,
  onHeadingClick,
  collapsed,
  onCollapsedChange,
}: DocumentPanelProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [dragging, setDragging] = useState(false);
  const [viewMode, setViewMode] = useState<DocumentPanelMode>("rendered");
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRefPre = useRef<HTMLPreElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shadowHostRef = useRef<HTMLDivElement>(null);
  const effectiveWidth = collapsed ? 0 : width;
  const renderedDocument = useMemo(
    () => renderOfficialAsciiDoc(sourceDocument),
    [sourceDocument],
  );
  const panelTitle = renderedDocument.title || documentRoot?.headline || "";

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
      const delta = e.clientX - dragRef.current.startX;
      setWidth(
        Math.max(
          MIN_WIDTH,
          Math.min(window.innerWidth * 0.8, dragRef.current.startWidth + delta),
        ),
      );
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

  // Scroll to focused heading
  useEffect(() => {
    const container = scrollRef.current ?? scrollRefPre.current;
    const shadowRoot = shadowHostRef.current?.shadowRoot;
    if (!focusedNodeId || !container) return;
    const el =
      shadowRoot?.querySelector(`[data-node-id="${focusedNodeId}"]`) ??
      container.querySelector(`[data-node-id="${focusedNodeId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedNodeId]);

  useEffect(() => {
    const host = shadowHostRef.current;
    if (!host) return;
    const shadowRoot = host.shadowRoot ?? host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
			<style>${renderedDocument.styles}</style>
			<style>
				:host {
					display: block;
					color: #222;
					background: #fff;
				}
				.asciidoc-book-render {
					box-sizing: border-box;
					position: relative;
					padding: 0 2rem 2.75rem;
				}
				#content {
					box-sizing: border-box;
					max-width: none;
					margin-top: 0;
					padding: 0;
				}
				#header, #content, #footnotes, #footer {
					box-sizing: border-box;
					max-width: none;
					padding-left: 0;
					padding-right: 0;
				}
				#toc {
					max-width: none;
				}
				/* The app panel already frames the document; reset only the embedded
				   document's opening chrome so the official body rhythm starts cleanly. */
				#header > h1:first-child,
				.asciidoc-book-render > h1:first-child,
				.asciidoc-book-render > .asciidoc-heading-block:first-child > :is(h1,h2,h3,h4,h5,h6):first-child {
					margin-top: 0;
				}
				.asciidoc-heading-block {
					box-sizing: border-box;
					border-radius: 4px;
					cursor: pointer;
					padding: 0.125rem 0;
					transition: outline-color 160ms ease-out;
				}
				.asciidoc-heading-block:hover {
					background: #f8fafc;
				}
				.asciidoc-heading-block.asciidoc-focused-section {
					background: transparent;
					outline: 2px solid #bfdbfe;
					outline-offset: 8px;
				}
				a {
					cursor: pointer;
				}
			</style>
			<div class="asciidoc-book-render">
				${renderedDocument.bodyHtml}
			</div>
		`;
    shadowRoot
      .querySelector(".asciidoc-book-render")
      ?.setAttribute("data-asciidoc-title", renderedDocument.title);

    for (const heading of shadowRoot.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
      const id = heading.getAttribute("id");
      if (!id) continue;
      const nodeId = addressToNodeId.get(id) ?? addressToNodeId.get(`#${id}`);
      if (!nodeId) continue;
      createHeadingBlock(heading, nodeId);
    }

    // Keep document-link and heading-block clicks inside the shadow boundary;
    // React's delegated events are retargeted at the host and lose useful path detail.
    function handleShadowClick(event: Event) {
      if (!(event instanceof MouseEvent)) return;
      const path = event.composedPath();
      const link = path.find(
        (target): target is HTMLAnchorElement =>
          target instanceof HTMLAnchorElement,
      );
      const headingBlock = path.find(
        (target): target is HTMLElement =>
          target instanceof HTMLElement && target.hasAttribute("data-node-id"),
      );
      const href = link?.getAttribute("href");
      const key = href?.startsWith("#") ? href.slice(1) : href;
      const nodeId = key
        ? (addressToNodeId.get(key) ?? addressToNodeId.get(`#${key}`))
        : (headingBlock?.getAttribute("data-node-id") ?? undefined);
      if (nodeId) {
        event.preventDefault();
        onHeadingClick(nodeId);
      }
    }

    shadowRoot.addEventListener("click", handleShadowClick);
    return () => {
      shadowRoot.removeEventListener("click", handleShadowClick);
    };
  }, [addressToNodeId, onHeadingClick, renderedDocument]);

  useEffect(() => {
    const shadowRoot = shadowHostRef.current?.shadowRoot;
    if (!shadowRoot) return;
    for (const el of shadowRoot.querySelectorAll(".asciidoc-focused-section")) {
      el.classList.remove("asciidoc-focused-section");
    }
    if (!focusedNodeId) return;
    for (const el of shadowRoot.querySelectorAll(
      `[data-focus-node-id="${focusedNodeId}"]`,
    )) {
      el.classList.add("asciidoc-focused-section");
    }
  }, [focusedNodeId]);

  return (
    <div
      ref={panelRef}
      className="relative flex-shrink-0 border-r border-gray-200 bg-white"
      style={{
        width: effectiveWidth,
        transition: dragging
          ? "none"
          : `width ${PANEL_TRANSITION_MS}ms ease-out`,
      }}
    >
      {/* Drag handle on the RIGHT edge */}
      {!collapsed ? (
        // biome-ignore lint/a11y/noStaticElementInteractions: drag resize
        <div
          className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-400"
          onMouseDown={handleMouseDown}
          onKeyDown={() => {}}
        />
      ) : null}

      {!collapsed && documentRoot ? (
        <div className="flex h-full flex-col overflow-hidden" style={{ width }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
            <h2
              className="truncate font-semibold text-gray-800 text-sm"
              data-testid="document-panel-title"
            >
              {panelTitle}
            </h2>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
                <button
                  aria-pressed={viewMode === "rendered"}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    viewMode === "rendered"
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                  onClick={() => setViewMode("rendered")}
                  type="button"
                >
                  渲染
                </button>
                <button
                  aria-pressed={viewMode === "source"}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    viewMode === "source"
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                  onClick={() => setViewMode("source")}
                  type="button"
                >
                  源码
                </button>
              </div>
              <button
                className="flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                onClick={() => onCollapsedChange(true)}
                type="button"
                aria-label="折叠文档栏"
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
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Document content */}
          {viewMode === "source" ? (
            <pre
              ref={scrollRefPre}
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap break-words"
            >
              {sourceDocument.files
                .map(
                  (file) =>
                    `// ${file.relativePath}\n${file.raw.endsWith("\n") ? file.raw : `${file.raw}\n`}`,
                )
                .join("\n")}
            </pre>
          ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white">
              <div ref={shadowHostRef} data-testid="asciidoc-shadow-host" />
            </div>
          )}
        </div>
      ) : null}

      {/* Expand button when collapsed */}
      {collapsed ? (
        <button
          className="absolute top-1/2 left-0 z-20 -translate-y-1/2 rounded-r-md border border-l-0 border-gray-200 bg-white px-1 py-3 text-gray-400 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-600"
          onClick={() => onCollapsedChange(false)}
          type="button"
          aria-label="展开文档栏"
        >
          <svg
            aria-hidden="true"
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
