import { DataFactory, Parser, Store } from "n3";

const { namedNode } = DataFactory;

const AAT = "https://micheng.dev/ns/asciidoc-abundant-tree#";
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

export interface GraphNode {
  id: string;
  headline: string;
  addressLabel: string | null;
  generatedAddressLabel: string | null;
  labels: string[];
  raw: string;
  relativePath: string | null;
  startLine: number;
  endLine: number;
  metadata: Record<string, string>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  rel: string;
  weight: number;
  displayLabel?: string;
  raw?: string;
  evidenceId?: string;
  officialHref?: string;
}

export interface SourceFile {
  relativePath: string;
  raw: string;
}

export interface SourceDocument {
  entryPath: string;
  files: SourceFile[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  documentRoot: DocumentNode | null;
  addressToNodeId: Map<string, string>;
  sourceDocument: SourceDocument;
}

export interface DocumentNode {
  id: string;
  headline: string;
  addressLabel: string | null;
  generatedAddressLabel: string | null;
  labels: string[];
  headingLevel: number;
  raw: string;
  startLine: number;
  endLine: number;
  relativePath: string | null;
  children: DocumentNode[];
}

function firstObjectValue(
  store: Store,
  subject: string,
  predicate: string,
): string | undefined {
  const iter = store.match(namedNode(subject), namedNode(predicate), null);
  for (const q of iter) {
    return q.object.value;
  }
  return undefined;
}

function collectQuads(
  store: Store,
  subject: string | null,
  predicate: string | null,
  object: string | null,
) {
  return [
    ...store.match(
      subject ? namedNode(subject) : null,
      predicate ? namedNode(predicate) : null,
      object ? namedNode(object) : null,
    ),
  ];
}

function numericObjectValue(
  store: Store,
  subject: string,
  predicate: string,
): number {
  return Number(firstObjectValue(store, subject, predicate) ?? "0");
}

function labelValues(...values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ];
}

function sortHeadingIdsBySourcePosition(store: Store, ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const pathA = firstObjectValue(store, a, `${AAT}relativePath`) ?? "";
    const pathB = firstObjectValue(store, b, `${AAT}relativePath`) ?? "";
    if (pathA !== pathB) return pathA.localeCompare(pathB);
    const lineA = numericObjectValue(store, a, `${AAT}startLine`);
    const lineB = numericObjectValue(store, b, `${AAT}startLine`);
    return lineA - lineB;
  });
}

function sortChildIds(store: Store, childIds: string[]): string[] {
  const remaining = new Set(childIds);
  const byPrevious = new Map<string, string>();
  for (const childId of childIds) {
    const previous = firstObjectValue(store, childId, `${AAT}previousSibling`);
    if (previous && remaining.has(previous)) {
      byPrevious.set(previous, childId);
    }
  }

  const ordered: string[] = [];
  let current = childIds.find((childId) => {
    const previous = firstObjectValue(store, childId, `${AAT}previousSibling`);
    return !previous || !remaining.has(previous);
  });

  while (current && remaining.has(current)) {
    ordered.push(current);
    remaining.delete(current);
    current = byPrevious.get(current);
  }

  if (remaining.size > 0) {
    ordered.push(...sortHeadingIdsBySourcePosition(store, [...remaining]));
  }

  return ordered;
}

function sourceDocumentFromStore(
  store: Store,
  headingIds: Set<string>,
): SourceDocument {
  const sourceDocs = collectQuads(
    store,
    null,
    RDF_TYPE,
    `${AAT}AsciiDocSourceDocument`,
  );
  const sourceDocId = sourceDocs[0]?.subject.value ?? null;
  const entryPath =
    (sourceDocId
      ? firstObjectValue(store, sourceDocId, `${AAT}relativePath`)
      : undefined) ??
    firstObjectValue(store, [...headingIds][0] ?? "", `${AAT}relativePath`) ??
    "document.adoc";

  const sourceFileIds = collectQuads(
    store,
    null,
    RDF_TYPE,
    `${AAT}SourceFile`,
  ).map((quad) => quad.subject.value);

  if (sourceFileIds.length > 0) {
    const files = sourceFileIds
      .map((id) => ({
        relativePath: firstObjectValue(store, id, `${AAT}relativePath`) ?? "",
        raw: firstObjectValue(store, id, `${AAT}raw`) ?? "",
      }))
      .filter((file) => file.relativePath)
      .sort((a, b) => {
        if (a.relativePath === entryPath) return -1;
        if (b.relativePath === entryPath) return 1;
        return a.relativePath.localeCompare(b.relativePath);
      });
    return { entryPath, files };
  }

  const raw = sortHeadingIdsBySourcePosition(store, [...headingIds])
    .map((id) => firstObjectValue(store, id, `${AAT}raw`) ?? "")
    .join("");
  return { entryPath, files: [{ relativePath: entryPath, raw }] };
}

function selectDocumentRootId(
  store: Store,
  headingIds: Set<string>,
  entryPath: string,
): string | null {
  const levelZeroIds = [...headingIds].filter(
    (id) => firstObjectValue(store, id, `${AAT}headingLevel`) === "0",
  );
  if (levelZeroIds.length === 0) return null;

  const entryHeadings = levelZeroIds.filter(
    (id) => firstObjectValue(store, id, `${AAT}relativePath`) === entryPath,
  );
  const candidates = entryHeadings.length > 0 ? entryHeadings : levelZeroIds;
  // Book doctype uses additional level-0 headings for parts; the document root
  // is the earliest level-0 heading in the entry source, not the last part.
  return sortHeadingIdsBySourcePosition(store, candidates)[0] ?? null;
}

export function parseTtl(ttlText: string): GraphData {
  const parser = new Parser();
  const quads = parser.parse(ttlText);
  const store = new Store();
  store.addQuads(quads);

  // Find all Heading subjects
  const headingQuads = collectQuads(store, null, RDF_TYPE, `${AAT}Heading`);
  const headingIds = new Set<string>();

  for (const q of headingQuads) {
    headingIds.add(q.subject.value);
  }

  const sourceDocument = sourceDocumentFromStore(store, headingIds);

  // Collect all headings including document root (headingLevel 0)
  const nodes: GraphNode[] = [];

  for (const id of headingIds) {
    const headline = firstObjectValue(store, id, `${AAT}headline`) ?? "";
    const addressLabel =
      firstObjectValue(store, id, `${AAT}addressLabel`) ?? null;
    const generatedAddressLabel =
      firstObjectValue(store, id, `${AAT}generatedAddressLabel`) ?? null;
    const raw = firstObjectValue(store, id, `${AAT}raw`) ?? "";
    const relativePath =
      firstObjectValue(store, id, `${AAT}relativePath`) ?? null;
    const startLine = numericObjectValue(store, id, `${AAT}startLine`);
    const endLine = numericObjectValue(store, id, `${AAT}endLine`);
    const labels = labelValues(addressLabel, generatedAddressLabel, headline);

    // Collect extra metadata attributes (faction, gender, generation, etc.)
    const metadata: Record<string, string> = {};
    const allPreds = collectQuads(store, id, null, null);
    for (const q of allPreds) {
      const predIri = q.predicate.value;
      if (predIri.startsWith(AAT) && q.object.termType === "Literal") {
        const key = predIri.slice(AAT.length);
        if (
          key !== "headline" &&
          key !== "addressLabel" &&
          key !== "generatedAddressLabel" &&
          key !== "raw"
        ) {
          metadata[key] = q.object.value;
        }
      }
    }

    nodes.push({
      id,
      headline,
      addressLabel,
      generatedAddressLabel,
      labels,
      raw,
      relativePath,
      startLine,
      endLine,
      metadata,
    });
  }

  // Build a set of heading node IDs for fast lookup
  const headingNodeIds = new Set(nodes.map((n) => n.id));

  const edges: GraphEdge[] = [];
  let edgeIdx = 0;

  const xrefEdgeIds = collectQuads(store, null, RDF_TYPE, `${AAT}XrefEdge`).map(
    (q) => q.subject.value,
  );
  for (const xrefId of xrefEdgeIds) {
    const source = firstObjectValue(store, xrefId, `${AAT}sourceHeading`);
    const target = firstObjectValue(store, xrefId, `${AAT}targetHeading`);
    if (!source || !target) continue;
    if (!headingNodeIds.has(source) || !headingNodeIds.has(target)) continue;
    if (source === target) continue;
    const rel = firstObjectValue(store, xrefId, `${AAT}rel`) ?? "references";
    const weightValue = firstObjectValue(store, xrefId, `${AAT}weight`);
    const weight = weightValue
      ? Number.parseFloat(weightValue)
      : rel === "references"
        ? 0.3
        : 0.5;
    const displayLabel = firstObjectValue(store, xrefId, `${AAT}displayLabel`);
    const raw = firstObjectValue(store, xrefId, `${AAT}raw`);
    const officialHref = firstObjectValue(store, xrefId, `${AAT}officialHref`);
    edges.push({
      id: `edge-${edgeIdx++}`,
      source,
      target,
      rel,
      weight,
      evidenceId: xrefId,
      ...(displayLabel ? { displayLabel } : {}),
      ...(raw ? { raw } : {}),
      ...(officialHref ? { officialHref } : {}),
    });
  }

  // Build containsDirectly map for document tree structure
  const containsMap = new Map<string, string[]>();
  for (const id of headingIds) {
    const childQuads = collectQuads(store, id, `${AAT}containsDirectly`, null);
    if (childQuads.length > 0) {
      containsMap.set(
        id,
        sortChildIds(
          store,
          childQuads.map((q) => q.object.value),
        ),
      );
    }
  }

  // Build document tree recursively
  function buildDocTree(id: string): DocumentNode {
    const level = Number(
      firstObjectValue(store, id, `${AAT}headingLevel`) ?? "0",
    );
    const headline = firstObjectValue(store, id, `${AAT}headline`) ?? "";
    const addressLabel =
      firstObjectValue(store, id, `${AAT}addressLabel`) ?? null;
    const generatedAddressLabel =
      firstObjectValue(store, id, `${AAT}generatedAddressLabel`) ?? null;
    const raw = firstObjectValue(store, id, `${AAT}raw`) ?? "";
    const startLine = numericObjectValue(store, id, `${AAT}startLine`);
    const endLine = numericObjectValue(store, id, `${AAT}endLine`);
    const relativePath =
      firstObjectValue(store, id, `${AAT}relativePath`) ?? null;
    const labels = labelValues(addressLabel, generatedAddressLabel, headline);
    const childIds = containsMap.get(id) ?? [];
    const children = childIds.map((cid) => buildDocTree(cid));
    return {
      id,
      headline,
      addressLabel,
      generatedAddressLabel,
      labels,
      headingLevel: level,
      raw,
      startLine,
      endLine,
      relativePath,
      children,
    };
  }

  const docRootId = selectDocumentRootId(
    store,
    headingIds,
    sourceDocument.entryPath,
  );
  const documentRoot = docRootId ? buildDocTree(docRootId) : null;

  // Build link-target → node ID mapping (addressLabel, headline, generated IDs)
  const addressToNodeId = new Map<string, string>();
  for (const node of nodes) {
    for (const label of node.labels) {
      addressToNodeId.set(label, node.id);
      addressToNodeId.set(`#${label}`, node.id);
    }
    const hashIdx = node.id.indexOf("#");
    if (hashIdx !== -1) {
      addressToNodeId.set(node.id.slice(hashIdx + 1), node.id);
    }
  }

  // Extract containsDirectly edges between ALL heading nodes (including document root)
  for (const [parentId, childIds] of containsMap) {
    for (const childId of childIds) {
      if (headingNodeIds.has(parentId) && headingNodeIds.has(childId)) {
        edges.push({
          id: `edge-${edgeIdx++}`,
          source: parentId,
          target: childId,
          rel: "containsDirectly",
          weight: 0.1,
        });
      }
    }
  }

  return { nodes, edges, documentRoot, addressToNodeId, sourceDocument };
}

export type LabelMode = "headline" | "addressLabel" | "both";

export function getNodeLabel(node: GraphNode, mode: LabelMode): string {
  const idLabel =
    node.addressLabel ?? node.generatedAddressLabel ?? node.headline;
  switch (mode) {
    case "headline":
      return node.headline;
    case "addressLabel":
      return idLabel;
    case "both":
      return `${node.headline}\n(${idLabel})`;
  }
}
