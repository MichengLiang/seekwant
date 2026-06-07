import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GraphNode } from "../../lib/ttl-parser";
import { DetailPanel } from "../DetailPanel";

function makeNode(overrides: Partial<GraphNode> = {}): GraphNode {
  return {
    id: "urn:book#heading-l25-o0",
    headline: "Checklist",
    addressLabel: "demo-checklist",
    generatedAddressLabel: null,
    labels: ["demo-checklist", "Checklist"],
    raw: "[#demo-checklist]\n=== Checklist\n\n* Preserve source coordinates.\n",
    relativePath: "chapters/02-operations.adoc",
    startLine: 6,
    endLine: 9,
    metadata: {},
    ...overrides,
  };
}

describe("DetailPanel", () => {
  it("shows upstream heading raw with origin file coordinates", () => {
    render(<DetailPanel node={makeNode()} onClose={() => {}} />);

    expect(screen.getByText("源文件")).toBeInTheDocument();
    expect(screen.getByText("chapters/02-operations.adoc")).toBeInTheDocument();
    expect(screen.getByText("起始行")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("结束行")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText(/=== Checklist/)).toBeInTheDocument();
    expect(screen.getByText(/Preserve source coordinates/)).toBeInTheDocument();
  });
});
