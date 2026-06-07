import { describe, expect, it } from "vitest";
import {
  renderOfficialAsciiDoc,
  stripXrefControlFields,
} from "../adoc-renderer";
import type { SourceDocument } from "../ttl-parser";

const BOOK_SOURCE: SourceDocument = {
  entryPath: "book.adoc",
  files: [
    {
      relativePath: "book.adoc",
      raw: `= Book Entry Demo
Micheng Liang
:doctype: book
:toc:

include::chapters/01-overview.adoc[]

include::chapters/02-operations.adoc[]
`,
    },
    {
      relativePath: "chapters/01-overview.adoc",
      raw: `[#demo-overview]
== Overview

This sample starts in the overview chapter and links to xref:demo-qa-checklist[the QA checklist, rel=mentions].
`,
    },
    {
      relativePath: "chapters/02-operations.adoc",
      raw: `[#demo-operations]
== Operations

The operations chapter links back to xref:demo-overview[the overview section].

[#demo-qa-checklist]
=== QA Checklist

* Parse the entry file in explicit book-entry mode.

[cols="1,2", options="header"]
|===
|Surface |Expected source
|Overview section |chapters/01-overview.adoc
|===
`,
    },
  ],
};

describe("stripXrefControlFields", () => {
  it("keeps display labels while removing named xref control fields", () => {
    const source =
      "See xref:capacity-rule[运力规则, rel=depends-on, weight=0.8, payload=edge-data].";

    expect(stripXrefControlFields(source)).toBe(
      "See xref:capacity-rule[运力规则].",
    );
  });

  it("keeps empty-label xrefs empty when only control fields are present", () => {
    const source = "See xref:delivery-policy[rel=implementation].";

    expect(stripXrefControlFields(source)).toBe("See xref:delivery-policy[].");
  });

  it("does not damage xrefs that already have no control fields", () => {
    const source = "See xref:demo-overview[the overview section].";

    expect(stripXrefControlFields(source)).toBe(source);
  });
});

describe("renderOfficialAsciiDoc", () => {
  it("renders a SourceFile-backed book through Asciidoctor include expansion", () => {
    const result = renderOfficialAsciiDoc(BOOK_SOURCE);

    expect(result.bodyHtml).toContain("Book Entry Demo");
    expect(result.bodyHtml).toContain("Overview");
    expect(result.bodyHtml).toContain("Operations");
    expect(result.bodyHtml).toContain("QA Checklist");
    expect(result.bodyHtml).toContain("<table");
    expect(result.bodyHtml).toContain("the QA checklist");
    expect(result.bodyHtml).not.toContain("rel=mentions");
  });

  it("extracts the official default stylesheet from standalone HTML", () => {
    const result = renderOfficialAsciiDoc(BOOK_SOURCE);

    expect(result.styles).toContain("Asciidoctor default stylesheet");
    expect(result.styles).toContain(".sect1");
    expect(result.bodyHtml).not.toContain("<html");
    expect(result.bodyHtml).not.toContain("<style");
  });

  it("resolves nested includes relative to the current virtual source file", () => {
    const result = renderOfficialAsciiDoc({
      entryPath: "book.adoc",
      files: [
        {
          relativePath: "book.adoc",
          raw: `= Nested Includes

include::chapters/intro.adoc[]
`,
        },
        {
          relativePath: "chapters/intro.adoc",
          raw: `== Intro

include::partials/note.adoc[]
`,
        },
        {
          relativePath: "chapters/partials/note.adoc",
          raw: `Nested include resolved from chapter directory.
`,
        },
        {
          relativePath: "partials/note.adoc",
          raw: `Wrong root-level partial.
`,
        },
      ],
    });

    expect(result.bodyHtml).toContain(
      "Nested include resolved from chapter directory.",
    );
    expect(result.bodyHtml).not.toContain("Wrong root-level partial.");
    expect(result.bodyHtml).not.toContain("Unresolved directive");
  });
});
