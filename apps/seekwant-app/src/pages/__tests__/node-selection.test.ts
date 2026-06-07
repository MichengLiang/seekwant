import { describe, expect, it } from "vitest";
import {
  initialNodeSelectionState,
  nodeSelectionReducer,
} from "../node-selection";

describe("nodeSelectionReducer", () => {
  it("opens detail and focuses the graph node selected from the graph", () => {
    const state = nodeSelectionReducer(initialNodeSelectionState, {
      type: "graph-node-open",
      nodeId: "node-a",
    });

    expect(state).toEqual({
      focusedNodeId: "node-a",
      inspectedNodeId: "node-a",
      isDetailOpen: true,
    });
  });

  it("focuses document clicks without opening a closed detail panel", () => {
    const state = nodeSelectionReducer(initialNodeSelectionState, {
      type: "document-node-focus",
      nodeId: "node-b",
    });

    expect(state).toEqual({
      focusedNodeId: "node-b",
      inspectedNodeId: null,
      isDetailOpen: false,
    });
  });

  it("syncs document clicks into an already open detail panel", () => {
    const openState = nodeSelectionReducer(initialNodeSelectionState, {
      type: "graph-node-open",
      nodeId: "node-a",
    });

    const state = nodeSelectionReducer(openState, {
      type: "document-node-focus",
      nodeId: "node-b",
    });

    expect(state).toEqual({
      focusedNodeId: "node-b",
      inspectedNodeId: "node-b",
      isDetailOpen: true,
    });
  });

  it("resets focus and detail state together", () => {
    const openState = nodeSelectionReducer(initialNodeSelectionState, {
      type: "graph-node-open",
      nodeId: "node-a",
    });

    expect(
      nodeSelectionReducer(openState, { type: "reset-node-context" }),
    ).toEqual(initialNodeSelectionState);
  });
});
