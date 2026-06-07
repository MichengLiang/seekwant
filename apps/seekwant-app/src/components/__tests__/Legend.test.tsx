import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GraphData, GraphNode } from "../../lib/ttl-parser";
import { Legend } from "../Legend";

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
    makeNode("a", "A", { faction: "荣国府" }),
    makeNode("b", "B", { faction: "薛家" }),
    makeNode("c", "C"),
  ],
  edges: [],
  documentRoot: null,
  addressToNodeId: new Map(),
  sourceDocument,
};

describe("Legend", () => {
  it("renders faction labels", () => {
    render(<Legend data={mockData} />);
    expect(screen.getByText("荣国府")).toBeInTheDocument();
    expect(screen.getByText("薛家")).toBeInTheDocument();
  });

  it("renders nothing when no factions exist", () => {
    const noFactionData: GraphData = {
      nodes: [makeNode("a", "A")],
      edges: [],
      documentRoot: null,
      addressToNodeId: new Map(),
      sourceDocument,
    };
    const { container } = render(<Legend data={noFactionData} />);
    expect(container.textContent).toBe("");
  });
});
