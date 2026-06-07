export interface NodeSelectionState {
  focusedNodeId: string | null;
  inspectedNodeId: string | null;
  isDetailOpen: boolean;
}

export type NodeSelectionAction =
  | { type: "graph-node-open"; nodeId: string }
  | { type: "document-node-focus"; nodeId: string }
  | { type: "detail-node-replace"; nodeId: string }
  | { type: "reset-node-context" };

export const initialNodeSelectionState: NodeSelectionState = {
  focusedNodeId: null,
  inspectedNodeId: null,
  isDetailOpen: false,
};

export function nodeSelectionReducer(
  state: NodeSelectionState,
  action: NodeSelectionAction,
): NodeSelectionState {
  switch (action.type) {
    case "graph-node-open":
      return {
        focusedNodeId: action.nodeId,
        inspectedNodeId: action.nodeId,
        isDetailOpen: true,
      };
    case "document-node-focus":
      return {
        focusedNodeId: action.nodeId,
        inspectedNodeId: state.isDetailOpen
          ? action.nodeId
          : state.inspectedNodeId,
        isDetailOpen: state.isDetailOpen,
      };
    case "detail-node-replace":
      return {
        focusedNodeId: action.nodeId,
        inspectedNodeId: action.nodeId,
        isDetailOpen: true,
      };
    case "reset-node-context":
      return initialNodeSelectionState;
  }
}
