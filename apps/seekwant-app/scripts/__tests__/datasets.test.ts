import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DATA_FILES } from "../../src/components/FileSelector";
import { DATASETS } from "../datasets";
import { generateDatasetTtl } from "../regenerate-data";

describe("dataset manifest", () => {
  it("keeps generator datasets aligned with UI presets", () => {
    expect(DATASETS.map((dataset) => dataset.id)).toEqual(
      DATA_FILES.map((file) => file.name),
    );
    expect(DATASETS.map((dataset) => dataset.label)).toEqual(
      DATA_FILES.map((file) => file.label),
    );
    expect(DATASETS.map((dataset) => dataset.outputPath)).toEqual(
      DATA_FILES.map((file) => file.path.replace(/^\//, "public/")),
    );
  });

  it("uses unique ids and existing local source fixtures", () => {
    const ids = new Set(DATASETS.map((dataset) => dataset.id));
    expect(ids.size).toBe(DATASETS.length);

    for (const dataset of DATASETS) {
      expect(
        existsSync(dataset.sourcePath),
        `${dataset.id} sourcePath missing: ${dataset.sourcePath}`,
      ).toBe(true);
      if (dataset.mode === "book-entry") {
        expect(
          existsSync(dataset.documentRoot),
          `${dataset.id} documentRoot missing: ${dataset.documentRoot}`,
        ).toBe(true);
      }
    }
  });
});

describe("generateDatasetTtl", () => {
  it("generates RDF12 Turtle for a single-file source fixture", () => {
    const dataset = DATASETS.find((item) => item.id === "tcm-diagnosis");

    expect(dataset).toBeDefined();
    if (!dataset) throw new Error("Missing tcm-diagnosis dataset");

    const ttl = generateDatasetTtl(dataset);

    expect(ttl).toContain("aat:Heading");
    expect(ttl).toContain('aat:headline "中医辨证论治图谱"');
    expect(ttl).toContain("rdf:reifies");
  });

  it("generates SourceFile-backed RDF12 Turtle for a book-entry fixture", () => {
    const dataset = DATASETS.find((item) => item.id === "book-entry-demo");

    expect(dataset).toBeDefined();
    if (!dataset) throw new Error("Missing book-entry-demo dataset");

    const ttl = generateDatasetTtl(dataset);

    expect(ttl).toContain("aat:SourceFile");
    expect(ttl).toContain('aat:relativePath "book.adoc"');
    expect(ttl).toContain('aat:relativePath "chapters/01-overview.adoc"');
    expect(ttl).toContain("rdf:reifies");
  });
});
