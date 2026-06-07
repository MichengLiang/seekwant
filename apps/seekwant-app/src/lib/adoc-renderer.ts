import Asciidoctor from "@asciidoctor/core";
import { officialAsciidoctorDefaultCss } from "./asciidoctor-default-css";
import type { SourceDocument } from "./ttl-parser";

const processor = Asciidoctor();

export interface OfficialAsciiDocRenderResult {
  bodyHtml: string;
  styles: string;
  title: string;
}

function splitXrefFields(fields: string): string[] {
  if (!fields.trim()) return [];
  return fields.split(",").map((field) => field.trim());
}

function isNamedField(field: string): boolean {
  return /^[A-Za-z_][\w.-]*\s*=/.test(field);
}

export function stripXrefControlFields(raw: string): string {
  return raw.replace(
    /xref:([^\s[]+)\[([^\]]*)\]/g,
    (_match, target, fields) => {
      const displayFields = splitXrefFields(fields).filter(
        (field) => field && !isNamedField(field),
      );
      return `xref:${target}[${displayFields.join(", ")}]`;
    },
  );
}

function normalizePath(path: string): string {
  const parts: string[] = [];
  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function dirname(path: string): string {
  const normalized = normalizePath(path);
  const slash = normalized.lastIndexOf("/");
  return slash === -1 ? "" : normalized.slice(0, slash);
}

function createSourceFileMap(
  sourceDocument: SourceDocument,
): Map<string, string> {
  return new Map(
    sourceDocument.files.map((file) => [
      normalizePath(file.relativePath),
      stripXrefControlFields(file.raw),
    ]),
  );
}

function resolveVirtualInclude(
  files: Map<string, string>,
  target: string,
  currentPath?: string,
): string | null {
  const normalizedTarget = normalizePath(target);
  const currentDir = currentPath ? dirname(currentPath) : "";
  if (currentDir) {
    const relativeCandidate = normalizePath(`${currentDir}/${target}`);
    if (files.has(relativeCandidate)) return relativeCandidate;
  }
  if (files.has(normalizedTarget)) return normalizedTarget;

  const matches = [...files.keys()]
    .map((path) => normalizePath(`${dirname(path)}/${target}`))
    .filter((candidate) => files.has(candidate));
  const uniqueMatches = [...new Set(matches)];
  return uniqueMatches.length === 1 ? (uniqueMatches[0] ?? null) : null;
}

function currentReaderPath(reader: {
  getCursor?: () => unknown;
}): string | undefined {
  const cursor = reader.getCursor?.();
  const path =
    cursor && typeof cursor === "object" && "path" in cursor
      ? (cursor.path as unknown)
      : undefined;
  return typeof path === "string" && !path.startsWith("<")
    ? normalizePath(path)
    : undefined;
}

function createVirtualIncludeRegistry(sourceDocument: SourceDocument) {
  const files = createSourceFileMap(sourceDocument);
  const registry = processor.Extensions.create();

  registry.includeProcessor(function () {
    this.handles(
      (target: string) => resolveVirtualInclude(files, target) !== null,
    );
    this.process((_doc, reader, target: string, attrs) => {
      const resolved = resolveVirtualInclude(
        files,
        target,
        currentReaderPath(reader),
      );
      if (!resolved) return;
      reader.pushInclude(
        files.get(resolved) ?? "",
        resolved,
        resolved,
        1,
        attrs,
      );
    });
  });

  return registry;
}

function titleFromEntry(raw: string): string {
  const titleLine = raw
    .split(/\r?\n/)
    .find((line) => /^=\s+\S/.test(line.trim()));
  return titleLine?.replace(/^=\s+/, "").trim() ?? "";
}

export function renderOfficialAsciiDoc(
  sourceDocument: SourceDocument,
): OfficialAsciiDocRenderResult {
  const files = createSourceFileMap(sourceDocument);
  const entryPath = normalizePath(sourceDocument.entryPath);
  const entryRaw = files.get(entryPath) ?? sourceDocument.files[0]?.raw ?? "";
  const html = processor.convert(entryRaw, {
    safe: "safe",
    standalone: false,
    base_dir: dirname(entryPath) || ".",
    extension_registry: createVirtualIncludeRegistry(sourceDocument),
    attributes: { showtitle: "" },
  }) as string;

  return {
    bodyHtml: html,
    styles: officialAsciidoctorDefaultCss,
    title: titleFromEntry(entryRaw),
  };
}
