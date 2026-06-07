import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { DetailPanel, type DetailSourceMode } from "../components/DetailPanel";
import { DocumentPanel } from "../components/DocumentPanel";
import { DATA_FILES, type DataFile } from "../components/FileSelector";
import { TtlGraph } from "../components/TtlGraph";
import {
  ActivityRail,
  type WorkbenchView,
} from "../components/workbench/ActivityRail";
import { DatasetSwitcher } from "../components/workbench/DatasetSwitcher";
import { LegendPanel } from "../components/workbench/LegendPanel";
import { SettingsDrawer } from "../components/workbench/SettingsDrawer";
import { StatusBar } from "../components/workbench/StatusBar";
import { TitleBar } from "../components/workbench/TitleBar";
import { WorkbenchShell } from "../components/workbench/WorkbenchShell";
import {
  type GraphData,
  type GraphNode,
  type LabelMode,
  parseTtl,
  type SourceFile,
} from "../lib/ttl-parser";
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
  const [detailSourceMode, setDetailSourceMode] =
    useState<DetailSourceMode>("node");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<WorkbenchView>("document");
  const { focusedNodeId, inspectedNodeId, isDetailOpen } = nodeSelection;

  // Load preset file from server
  const loadPreset = useCallback((file: DataFile) => {
    setCurrentFile(file);
    setIsLoading(true);
    setError(null);
    setDetailSourceMode("node");
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
    setDetailSourceMode("node");
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

  const sourceFileByPath = useMemo(() => {
    const byPath = new Map<string, SourceFile>();
    for (const file of data?.sourceDocument.files ?? []) {
      byPath.set(file.relativePath, file);
    }
    return byPath;
  }, [data]);

  const fileRepresentativeNodeByPath = useMemo(() => {
    const byPath = new Map<string, GraphNode>();
    for (const node of data?.nodes ?? []) {
      if (!node.relativePath) continue;
      const current = byPath.get(node.relativePath);
      if (!current || node.startLine < current.startLine) {
        byPath.set(node.relativePath, node);
      }
    }
    return byPath;
  }, [data]);

  const detailSourceFile = detailNode?.relativePath
    ? (sourceFileByPath.get(detailNode.relativePath) ?? null)
    : null;

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
    setDetailSourceMode("node");
    dispatchNodeSelection({ type: "graph-node-open", nodeId });
  }, []);

  const handleDocumentNodeFocus = useCallback((nodeId: string) => {
    setDetailSourceMode("node");
    dispatchNodeSelection({ type: "document-node-focus", nodeId });
  }, []);

  const handleNodeContextReset = useCallback(() => {
    setDetailSourceMode("node");
    dispatchNodeSelection({ type: "reset-node-context" });
  }, []);

  const handleDetailSourceModeChange = useCallback(
    (mode: DetailSourceMode) => {
      if (mode === "node") {
        setDetailSourceMode("node");
        return;
      }
      if (!detailNode?.relativePath) return;
      const sourceFile = sourceFileByPath.get(detailNode.relativePath);
      const representativeNode = fileRepresentativeNodeByPath.get(
        detailNode.relativePath,
      );
      if (!sourceFile || !representativeNode) return;
      dispatchNodeSelection({
        type: "detail-node-replace",
        nodeId: representativeNode.id,
      });
      setDetailSourceMode("file");
    },
    [detailNode, fileRepresentativeNodeByPath, sourceFileByPath],
  );

  // Only trigger graph resize after detail panel CLOSE transition ends.
  const handlePanelTransitionEnd = useCallback(() => {
    if (!isDetailOpen) {
      setResizeKey((k) => k + 1);
    }
  }, [isDetailOpen]);

  return (
    <WorkbenchShell
      titleBar={
        <TitleBar
          datasetControl={
            <DatasetSwitcher
              current={currentFile}
              onChange={loadPreset}
              onFileLoad={handleFileLoad}
            />
          }
          onSettingsOpen={() => setSettingsOpen(true)}
        />
      }
      statusBar={
        <StatusBar
          leftText={
            graphData
              ? `${graphData.nodes.length} 节点 · ${graphData.edges.length} 关系`
              : ""
          }
          rightText="点击文档标题聚焦图谱 · 双击节点查看详情 · 点击空白重置"
        />
      }
    >
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
          <ActivityRail
            activeView={activeView}
            onActiveViewChange={setActiveView}
          />
          {activeView === "document" ? (
            <DocumentPanel
              documentRoot={data.documentRoot}
              sourceDocument={data.sourceDocument}
              focusedNodeId={focusedNodeId}
              addressToNodeId={data.addressToNodeId}
              onHeadingClick={handleDocumentNodeFocus}
              collapsed={docPanelCollapsed}
              onCollapsedChange={setDocPanelCollapsed}
            />
          ) : (
            <LegendPanel data={graphData} />
          )}
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
        sourceMode={detailSourceMode}
        sourceFile={detailSourceFile}
        onSourceModeChange={handleDetailSourceModeChange}
        onClose={handleNodeContextReset}
        onTransitionEnd={handlePanelTransitionEnd}
      />
      <SettingsDrawer
        labelMode={labelMode}
        onClose={() => setSettingsOpen(false)}
        onLabelModeChange={setLabelMode}
        onPredicateChineseChange={setPredicateChinese}
        onShowContainsChange={setShowContains}
        open={settingsOpen}
        predicateChinese={predicateChinese}
        showContains={showContains}
      />
    </WorkbenchShell>
  );
}
