import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { DetailPanel } from "../components/DetailPanel";
import { DocumentPanel } from "../components/DocumentPanel";
import {
  DATA_FILES,
  type DataFile,
  FileSelector,
} from "../components/FileSelector";
import { LabelToggle } from "../components/LabelToggle";
import { Legend } from "../components/Legend";
import { TtlGraph } from "../components/TtlGraph";
import { type GraphData, type LabelMode, parseTtl } from "../lib/ttl-parser";
import {
  initialNodeSelectionState,
  nodeSelectionReducer,
} from "./node-selection";

export function GraphPage() {
  const initialFile = useMemo(
    () =>
      DATA_FILES[0] ?? {
        name: "red-chamber",
        path: "/data/red-chamber.ttl",
        label: "红楼梦",
      },
    [],
  );
  const [labelMode, setLabelMode] = useState<LabelMode>("headline");
  const [currentFile, setCurrentFile] = useState<DataFile>(initialFile);
  const [data, setData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodeSelection, dispatchNodeSelection] = useReducer(
    nodeSelectionReducer,
    initialNodeSelectionState,
  );
  const [resizeKey, setResizeKey] = useState(0);
  const [docPanelCollapsed, setDocPanelCollapsed] = useState(false);
  const [predicateChinese, setPredicateChinese] = useState(false);
  const [showContains, setShowContains] = useState(false);
  const { focusedNodeId, inspectedNodeId, isDetailOpen } = nodeSelection;

  // Load preset file from server
  const loadPreset = useCallback((file: DataFile) => {
    setCurrentFile(file);
    setIsLoading(true);
    setError(null);
    dispatchNodeSelection({ type: "reset-node-context" });
    fetch(file.path)
      .then((res) => {
        if (!res.ok) throw new Error(`加载失败: ${res.status}`);
        return res.text();
      })
      .then((text) => {
        setData(parseTtl(text));
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "未知错误");
        setIsLoading(false);
      });
  }, []);

  // Load user-selected file
  function handleFileLoad(text: string, fileName: string) {
    setCurrentFile({ name: "custom", path: "", label: fileName });
    setError(null);
    dispatchNodeSelection({ type: "reset-node-context" });
    try {
      setData(parseTtl(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败");
    }
  }

  // Load default file on mount
  useEffect(() => {
    loadPreset(initialFile);
  }, [initialFile, loadPreset]);

  // Look up the node whose detail content is being inspected.
  const inspectedNode = useMemo(() => {
    if (!inspectedNodeId || !data) return null;
    return data.nodes.find((n) => n.id === inspectedNodeId) ?? null;
  }, [inspectedNodeId, data]);
  const detailNode = isDetailOpen ? inspectedNode : null;

  // Filter edges based on showContains toggle
  const graphData = useMemo(() => {
    if (!data) return null;
    if (showContains) return data;
    return {
      ...data,
      edges: data.edges.filter((e) => e.rel !== "containsDirectly"),
    };
  }, [data, showContains]);

  const handleGraphNodeOpen = useCallback((nodeId: string) => {
    dispatchNodeSelection({ type: "graph-node-open", nodeId });
  }, []);

  const handleDocumentNodeFocus = useCallback((nodeId: string) => {
    dispatchNodeSelection({ type: "document-node-focus", nodeId });
  }, []);

  const handleNodeContextReset = useCallback(() => {
    dispatchNodeSelection({ type: "reset-node-context" });
  }, []);

  // Only trigger graph resize after detail panel CLOSE transition ends.
  const handlePanelTransitionEnd = useCallback(() => {
    if (!isDetailOpen) {
      setResizeKey((k) => k + 1);
    }
  }, [isDetailOpen]);

  return (
    <div className="flex h-screen flex-col" style={{ background: "#f5f3ef" }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-gray-800 text-base tracking-tight">
              TTL 知识图谱
            </h1>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-400 text-xs">
              {currentFile.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <FileSelector
              current={currentFile.name}
              onChange={loadPreset}
              onFileLoad={handleFileLoad}
            />
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-gray-400 text-xs">边标签</span>
            <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  !predicateChinese
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                onClick={() => setPredicateChinese(false)}
                type="button"
              >
                原文
              </button>
              <button
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  predicateChinese
                    ? "bg-gray-800 text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
                onClick={() => setPredicateChinese(true)}
                type="button"
              >
                中文
              </button>
            </div>
            <div className="h-4 w-px bg-gray-200" />
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showContains}
                onChange={(e) => setShowContains(e.target.checked)}
                className="rounded border-gray-300"
              />
              包含关系
            </label>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-gray-400 text-xs">节点标签</span>
            <LabelToggle mode={labelMode} onChange={setLabelMode} />
          </div>
        </div>
        {/* Legend row */}
        {graphData ? (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <Legend data={graphData} />
          </div>
        ) : null}
      </header>

      {/* Document Panel + Graph + Detail Panel */}
      <main className="relative flex flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full flex-1 flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
            <span className="text-gray-400 text-sm">加载中...</span>
          </div>
        ) : null}
        {error ? (
          <div className="flex h-full flex-1 items-center justify-center text-red-500 text-sm">
            加载失败: {error}
          </div>
        ) : null}
        {data && graphData ? (
          <>
            <DocumentPanel
              documentRoot={data.documentRoot}
              sourceDocument={data.sourceDocument}
              focusedNodeId={focusedNodeId}
              addressToNodeId={data.addressToNodeId}
              onHeadingClick={handleDocumentNodeFocus}
              collapsed={docPanelCollapsed}
              onCollapsedChange={setDocPanelCollapsed}
            />
            <div className="flex-1 overflow-hidden">
              <TtlGraph
                data={graphData}
                labelMode={labelMode}
                focusedNodeId={focusedNodeId}
                onNodeOpen={handleGraphNodeOpen}
                onResetNodeContext={handleNodeContextReset}
                resizeKey={resizeKey}
                predicateChinese={predicateChinese}
              />
            </div>
          </>
        ) : null}
        <DetailPanel
          node={detailNode}
          onClose={handleNodeContextReset}
          onTransitionEnd={handlePanelTransitionEnd}
        />
      </main>

      {/* Status bar */}
      <footer className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-1.5">
        <span className="text-gray-400 text-xs">
          {graphData
            ? `${graphData.nodes.length} 节点 · ${graphData.edges.length} 关系`
            : ""}
        </span>
        <span className="text-gray-400 text-xs">
          点击文档标题聚焦图谱 · 双击节点查看详情 · 点击空白重置
        </span>
      </footer>
    </div>
  );
}
