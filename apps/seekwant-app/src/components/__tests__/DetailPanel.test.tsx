import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GraphNode, SourceFile } from "../../lib/ttl-parser";
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

function makeSourceFile(overrides: Partial<SourceFile> = {}): SourceFile {
  return {
    relativePath: "chapters/02-operations.adoc",
    raw: "[#demo-operations]\n== Operations\n\nThe operations chapter.\n\n[#demo-checklist]\n=== Checklist\n\n* Preserve source coordinates.\n",
    ...overrides,
  };
}

describe("DetailPanel", () => {
  it("shows upstream heading raw with origin file coordinates", () => {
    render(
      <DetailPanel
        node={makeNode()}
        onClose={() => {}}
        onSourceModeChange={() => {}}
        sourceFile={makeSourceFile()}
        sourceMode="node"
      />,
    );

    expect(screen.getByTestId("detail-source-location")).toHaveTextContent(
      "chapters/02-operations.adoc · 行 6-9",
    );
    expect(screen.getByText(/=== Checklist/)).toBeInTheDocument();
    expect(screen.getByText(/Preserve source coordinates/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "节点片段" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("shows the complete source file in file source mode", () => {
    render(
      <DetailPanel
        node={makeNode({ headline: "Operations", startLine: 1, endLine: 4 })}
        onClose={() => {}}
        onSourceModeChange={() => {}}
        sourceFile={makeSourceFile()}
        sourceMode="file"
      />,
    );

    expect(screen.getByTestId("detail-source-location")).toHaveTextContent(
      "chapters/02-operations.adoc · 全文件 · 9 行",
    );
    expect(screen.getByTestId("detail-raw-source")).toHaveTextContent(
      "== Operations",
    );
    expect(screen.getByTestId("detail-raw-source")).toHaveTextContent(
      "=== Checklist",
    );
    expect(screen.getByRole("button", { name: "所在文件" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("emits source mode changes from the range control", async () => {
    const user = userEvent.setup();
    const onSourceModeChange = vi.fn();
    render(
      <DetailPanel
        node={makeNode()}
        onClose={() => {}}
        onSourceModeChange={onSourceModeChange}
        sourceFile={makeSourceFile()}
        sourceMode="node"
      />,
    );

    await user.click(screen.getByRole("button", { name: "所在文件" }));
    await user.click(screen.getByRole("button", { name: "节点片段" }));

    expect(onSourceModeChange).toHaveBeenNthCalledWith(1, "file");
    expect(onSourceModeChange).toHaveBeenNthCalledWith(2, "node");
  });

  it("keeps business metadata separate from structure diagnostics", () => {
    render(
      <DetailPanel
        node={makeNode({
          metadata: {
            contentEndLine: "9",
            contentStartLine: "8",
            endLine: "9",
            faction: "Demo",
            headingLevel: "2",
            relativePath: "chapters/02-operations.adoc",
            role: "section",
            startLine: "6",
          },
        })}
        onClose={() => {}}
        onSourceModeChange={() => {}}
        sourceFile={makeSourceFile()}
        sourceMode="node"
      />,
    );

    expect(screen.getByText("faction")).toBeInTheDocument();
    expect(screen.getByText("Demo")).toBeInTheDocument();

    const diagnostics = screen.getByTestId("detail-structure-diagnostics");
    expect(diagnostics).toHaveTextContent("headingLevel");
    expect(diagnostics).toHaveTextContent("contentStartLine");
    expect(diagnostics).toHaveTextContent("role");
    expect(diagnostics).not.toHaveTextContent("relativePath");
    expect(diagnostics).not.toHaveTextContent("startLine");
    expect(diagnostics).not.toHaveTextContent("endLine");
  });
});
