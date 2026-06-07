import { describe, expect, it } from "vitest";
import { getNodeLabel, parseTtl } from "../ttl-parser";

function expectDefined<T>(value: T | undefined): T {
  expect(value).toBeDefined();
  if (value === undefined) {
    throw new Error("Expected value to be defined");
  }
  return value;
}

const RDF12_SINGLE_FILE_TTL = `
@prefix aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>.
@prefix rel: <https://micheng.dev/ns/asciidoc-relation#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix prov: <http://www.w3.org/ns/prov#>.

<urn:doc#root> a aat:Heading;
    aat:containsDirectly <urn:doc#generated>, <urn:doc#policy>, <urn:doc#rule>;
    aat:endLine 4;
    aat:headingLevel 0;
    aat:headingLine 1;
    aat:headline "Root";
    aat:raw """= Root

Intro.

""";
    aat:relativePath "samples/base.adoc";
    aat:startLine 1.

<urn:doc#generated> a aat:Heading;
    aat:generatedAddressLabel "_生成标题";
    aat:endLine 8;
    aat:headingLevel 1;
    aat:headingLine 6;
    aat:headline "生成标题";
    aat:raw """== 生成标题

Generated section.

""";
    aat:relativePath "samples/base.adoc";
    aat:startLine 6.

<urn:doc#policy> a aat:Heading;
    aat:addressLabel "delivery-policy";
    aat:endLine 14;
    aat:headingLevel 1;
    aat:headingLine 10;
    aat:headline "配送策略";
    aat:owner "ops";
    aat:raw """[#delivery-policy.policy, owner=ops]
== 配送策略

配送策略依赖 xref:capacity-rule[运力规则, rel=depends-on, weight=0.8].

""";
    aat:relativePath "samples/base.adoc";
    aat:role "policy";
    aat:startLine 10.

<urn:doc#rule> a aat:Heading;
    aat:addressLabel "capacity-rule";
    aat:endLine 18;
    aat:headingLevel 1;
    aat:headingLine 16;
    aat:headline "运力规则";
    aat:raw """[#capacity-rule.rule]
== 运力规则

Rule body.

""";
    aat:relativePath "samples/base.adoc";
    aat:role "rule";
    aat:startLine 16.

<urn:doc#source> a prov:Entity, aat:AsciiDocSourceDocument;
    aat:relativePath "samples/base.adoc".

<urn:doc#xref-edge-l13-c8-o0> rdf:reifies <<(<urn:doc#policy> rel:depends-on <urn:doc#rule>)>>;
    a aat:XrefEdge;
    aat:displayLabel "运力规则";
    aat:endColumn 67;
    aat:endLine 13;
    aat:officialHref "#capacity-rule";
    aat:officialResolvedId "capacity-rule";
    aat:officialResolvedType "section";
    aat:raw "xref:capacity-rule[运力规则, rel=depends-on, weight=0.8]";
    aat:rel "depends-on";
    aat:relativePath "samples/base.adoc";
    aat:sourceHeading <urn:doc#policy>;
    aat:sourceSelector "delivery-policy";
    aat:startColumn 8;
    aat:startLine 13;
    aat:targetHeading <urn:doc#rule>;
    aat:targetSelector "capacity-rule";
    aat:weight "0.8".
`;

const RDF12_BOOK_ENTRY_TTL = `
@prefix aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix prov: <http://www.w3.org/ns/prov#>.

<urn:book#root> a aat:Heading;
    aat:containsDirectly <urn:book#operations>, <urn:book#overview>;
    aat:headingLevel 0;
    aat:headline "Book Entry Demo";
    aat:raw """= Book Entry Demo
""";
    aat:relativePath "book.adoc";
    aat:startLine 1.

<urn:book#overview> a aat:Heading;
    aat:addressLabel "demo-overview";
    aat:contentEndLine 4;
    aat:contentStartLine 4;
    aat:endLine 5;
    aat:headingLevel 1;
    aat:headingLine 2;
    aat:headline "Overview";
    aat:previousSibling <urn:book#root>;
    aat:raw """[#demo-overview]
== Overview

This sample starts in the overview chapter.

""";
    aat:relativePath "chapters/01-overview.adoc";
    aat:startLine 1.

<urn:book#operations> a aat:Heading;
    aat:addressLabel "demo-operations";
    aat:contentEndLine 4;
    aat:contentStartLine 4;
    aat:endLine 5;
    aat:headingLevel 1;
    aat:headingLine 2;
    aat:headline "Operations";
    aat:previousSibling <urn:book#overview>;
    aat:raw """[#demo-operations]
== Operations

The operations chapter links back to xref:demo-overview[the overview section].

""";
    aat:relativePath "chapters/02-operations.adoc";
    aat:startLine 1.

<urn:book#source-file-book.adoc> a aat:SourceFile;
    aat:raw """= Book Entry Demo
Micheng Liang
:doctype: book
:toc:

include::chapters/01-overview.adoc[]

include::chapters/02-operations.adoc[]
""";
    aat:relativePath "book.adoc".

<urn:book#source-file-chapters%2F01-overview.adoc> a aat:SourceFile;
    aat:raw """[#demo-overview]
== Overview

This sample starts in the overview chapter.
""";
    aat:relativePath "chapters/01-overview.adoc".

<urn:book#source-file-chapters%2F02-operations.adoc> a aat:SourceFile;
    aat:raw """[#demo-operations]
== Operations

The operations chapter links back to xref:demo-overview[the overview section].
""";
    aat:relativePath "chapters/02-operations.adoc".

<urn:book#source> a prov:Entity, aat:AsciiDocSourceDocument;
    aat:relativePath "book.adoc";
    aat:sourceFile <urn:book#source-file-book.adoc>,
        <urn:book#source-file-chapters%2F01-overview.adoc>,
        <urn:book#source-file-chapters%2F02-operations.adoc>.

<urn:book#xref-edge-l4-c38-o0> rdf:reifies <<(<urn:book#operations> aat:references <urn:book#overview>)>>;
    a aat:XrefEdge;
    aat:displayLabel "the overview section";
    aat:officialHref "#demo-overview";
    aat:raw "xref:demo-overview[the overview section]";
    aat:relativePath "chapters/02-operations.adoc";
    aat:sourceHeading <urn:book#operations>;
    aat:targetHeading <urn:book#overview>.
`;

const RDF12_BOOK_WITH_PARTS_TTL = `
@prefix aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix prov: <http://www.w3.org/ns/prov#>.

<urn:book-parts#book> a aat:Heading;
    aat:containsDirectly <urn:book-parts#part-one>;
    aat:headingLevel 0;
    aat:headline "完整书籍结构标本";
    aat:raw """= 完整书籍结构标本
""";
    aat:relativePath "books/00-book-anatomy/book.adoc";
    aat:startLine 1.

<urn:book-parts#part-one> a aat:Heading;
    aat:headingLevel 0;
    aat:headline "第一部：前置结构";
    aat:raw """= 第一部：前置结构
""";
    aat:relativePath "books/00-book-anatomy/book.adoc";
    aat:startLine 30.

<urn:book-parts#source-file-book> a aat:SourceFile;
    aat:raw """= 完整书籍结构标本
:doctype: book

= 第一部：前置结构
""";
    aat:relativePath "books/00-book-anatomy/book.adoc".

<urn:book-parts#source> a prov:Entity, aat:AsciiDocSourceDocument;
    aat:relativePath "books/00-book-anatomy/book.adoc";
    aat:sourceFile <urn:book-parts#source-file-book>.
`;

describe("parseTtl", () => {
  it("reads heading label space, raw long strings, and metadata from RDF12 headings", () => {
    const data = parseTtl(RDF12_SINGLE_FILE_TTL);

    const policy = expectDefined(
      data.nodes.find((node) => node.headline === "配送策略"),
    );
    expect(policy.addressLabel).toBe("delivery-policy");
    expect(policy.generatedAddressLabel).toBeNull();
    expect(policy.labels).toEqual(["delivery-policy", "配送策略"]);
    expect(policy.raw).toContain("xref:capacity-rule");
    expect(policy.relativePath).toBe("samples/base.adoc");
    expect(policy.startLine).toBe(10);
    expect(policy.endLine).toBe(14);
    expect(policy.metadata.owner).toBe("ops");
    expect(policy.metadata.role).toBe("policy");

    const generated = expectDefined(
      data.nodes.find((node) => node.headline === "生成标题"),
    );
    expect(generated.addressLabel).toBeNull();
    expect(generated.generatedAddressLabel).toBe("_生成标题");
    expect(generated.labels).toEqual(["_生成标题", "生成标题"]);
    expect(data.addressToNodeId.get("_生成标题")).toBe(generated.id);
  });

  it("uses aat:XrefEdge evidence as the relationship edge source", () => {
    const data = parseTtl(RDF12_SINGLE_FILE_TTL);

    const xrefEdge = expectDefined(
      data.edges.find((edge) => edge.rel === "depends-on"),
    );
    expect(xrefEdge.source).toBe("urn:doc#policy");
    expect(xrefEdge.target).toBe("urn:doc#rule");
    expect(xrefEdge.weight).toBe(0.8);
    expect(xrefEdge.displayLabel).toBe("运力规则");
    expect(xrefEdge.raw).toBe(
      "xref:capacity-rule[运力规则, rel=depends-on, weight=0.8]",
    );
    expect(xrefEdge.officialHref).toBe("#capacity-rule");
    expect(xrefEdge.evidenceId).toBe("urn:doc#xref-edge-l13-c8-o0");
  });

  it("keeps containsDirectly as structure edges separate from xref evidence", () => {
    const data = parseTtl(RDF12_SINGLE_FILE_TTL);
    const contains = data.edges.filter(
      (edge) => edge.rel === "containsDirectly",
    );

    expect(contains).toHaveLength(3);
    expect(
      contains.some(
        (edge) =>
          edge.source === "urn:doc#root" && edge.target === "urn:doc#policy",
      ),
    ).toBe(true);
  });

  it("builds sourceDocument from SourceFile resources for book-entry graphs", () => {
    const data = parseTtl(RDF12_BOOK_ENTRY_TTL);

    expect(data.sourceDocument.entryPath).toBe("book.adoc");
    expect(data.sourceDocument.files.map((file) => file.relativePath)).toEqual([
      "book.adoc",
      "chapters/01-overview.adoc",
      "chapters/02-operations.adoc",
    ]);
    expect(data.sourceDocument.files[0]?.raw).toContain(
      "include::chapters/01-overview.adoc[]",
    );
  });

  it("reads book-entry heading source slices from upstream aat:raw", () => {
    const data = parseTtl(RDF12_BOOK_ENTRY_TTL);

    const overview = expectDefined(
      data.nodes.find((node) => node.headline === "Overview"),
    );
    expect(overview.raw).toContain("[#demo-overview]\n== Overview");
    expect(overview.raw).toContain(
      "This sample starts in the overview chapter.",
    );
    expect(overview.raw).not.toContain("== Operations");

    const operations = expectDefined(
      data.nodes.find((node) => node.headline === "Operations"),
    );
    expect(operations.raw).toContain("[#demo-operations]\n== Operations");
    expect(operations.raw).toContain(
      "xref:demo-overview[the overview section]",
    );
  });

  it("reconstructs a single source file when RDF12 graph has no SourceFile resources", () => {
    const data = parseTtl(RDF12_SINGLE_FILE_TTL);

    expect(data.sourceDocument.entryPath).toBe("samples/base.adoc");
    expect(data.sourceDocument.files).toHaveLength(1);
    expect(data.sourceDocument.files[0]?.raw).toContain("= Root");
    expect(data.sourceDocument.files[0]?.raw).toContain("== 配送策略");
    expect(data.sourceDocument.files[0]?.raw).toContain("== 运力规则");
  });

  it("orders document children by previousSibling evidence", () => {
    const data = parseTtl(RDF12_BOOK_ENTRY_TTL);

    expect(data.documentRoot?.children.map((child) => child.headline)).toEqual([
      "Overview",
      "Operations",
    ]);
  });

  it("selects the entry document title instead of a later book part as document root", () => {
    const data = parseTtl(RDF12_BOOK_WITH_PARTS_TTL);

    expect(data.documentRoot?.headline).toBe("完整书籍结构标本");
    expect(data.documentRoot?.children.map((child) => child.headline)).toEqual([
      "第一部：前置结构",
    ]);
  });
});

describe("addressToNodeId", () => {
  it("maps every RDF12 heading label and IRI fragment to node ids", () => {
    const data = parseTtl(RDF12_SINGLE_FILE_TTL);
    const policy = expectDefined(
      data.nodes.find((node) => node.headline === "配送策略"),
    );
    const generated = expectDefined(
      data.nodes.find((node) => node.headline === "生成标题"),
    );

    expect(data.addressToNodeId.get("delivery-policy")).toBe(policy.id);
    expect(data.addressToNodeId.get("配送策略")).toBe(policy.id);
    expect(data.addressToNodeId.get("_生成标题")).toBe(generated.id);
    expect(data.addressToNodeId.get("generated")).toBe(generated.id);
  });
});

describe("getNodeLabel", () => {
  const node = {
    id: "test",
    headline: "标题",
    addressLabel: null,
    generatedAddressLabel: "_标题",
    labels: ["_标题", "标题"],
    raw: "",
    relativePath: "demo.adoc",
    startLine: 1,
    endLine: 2,
    metadata: {},
  };

  it("returns headline in headline mode", () => {
    expect(getNodeLabel(node, "headline")).toBe("标题");
  });

  it("returns the best available id label in addressLabel mode", () => {
    expect(getNodeLabel(node, "addressLabel")).toBe("_标题");
  });

  it("returns both in both mode", () => {
    const label = getNodeLabel(node, "both");
    expect(label).toContain("标题");
    expect(label).toContain("_标题");
  });
});
