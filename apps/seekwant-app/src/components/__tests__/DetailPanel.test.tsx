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

    expect(screen.getByTestId("detail-source-location")).toHaveTextContent(
      "chapters/02-operations.adoc · 行 6-9",
    );
    expect(screen.getByText(/=== Checklist/)).toBeInTheDocument();
    expect(screen.getByText(/Preserve source coordinates/)).toBeInTheDocument();
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
