import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import process from "node:process";
import { parseAbundantTree, rdf12 } from "asciidoc-abundant-tree";
import { DATASETS, type Dataset } from "./datasets";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const PUBLIC_DATA_DIR = resolve(PROJECT_ROOT, "public/data");

export type RegenerateOptions = {
  check: boolean;
};

export type DatasetResult = {
  id: string;
  outputPath: string;
  bytes: number;
  changed: boolean;
};

function assertInside(base: string, target: string, label: string): void {
  const relativePath = relative(base, target);
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`${label} is outside ${base}: ${target}`);
  }
}

function outputAbsolutePath(dataset: Dataset): string {
  const outputPath = resolve(PROJECT_ROOT, dataset.outputPath);
  assertInside(PUBLIC_DATA_DIR, outputPath, `${dataset.id} outputPath`);
  return outputPath;
}

function documentRootFor(dataset: Dataset): string {
  return dataset.mode === "book-entry"
    ? dataset.documentRoot
    : dirname(dataset.sourcePath);
}

function validateDataset(dataset: Dataset): void {
  if (!existsSync(dataset.sourcePath)) {
    throw new Error(
      `${dataset.id} source file not found: ${dataset.sourcePath}`,
    );
  }
  if (dataset.mode === "book-entry" && !existsSync(dataset.documentRoot)) {
    throw new Error(
      `${dataset.id} document root not found: ${dataset.documentRoot}`,
    );
  }
  outputAbsolutePath(dataset);
}

export function generateDatasetTtl(dataset: Dataset): string {
  validateDataset(dataset);
  const documentRoot = documentRootFor(dataset);
  const document = parseAbundantTree(
    dataset.mode === "book-entry"
      ? {
          sourcePath: dataset.sourcePath,
          mode: "book-entry",
          documentRoot,
        }
      : {
          sourcePath: dataset.sourcePath,
          mode: "single-file",
        },
  );
  const ttl = rdf12(document, { documentRoot }).ttl;
  if (!ttl.trim()) {
    throw new Error(`${dataset.id} generated empty Turtle output`);
  }
  return ttl;
}

export async function regenerateDatasets(
  datasets: readonly Dataset[] = DATASETS,
  options: RegenerateOptions = { check: false },
): Promise<DatasetResult[]> {
  const ids = new Set<string>();
  const results: DatasetResult[] = [];

  for (const dataset of datasets) {
    if (ids.has(dataset.id)) {
      throw new Error(`Duplicate dataset id: ${dataset.id}`);
    }
    ids.add(dataset.id);

    const outputPath = outputAbsolutePath(dataset);
    const ttl = generateDatasetTtl(dataset);
    const existing = existsSync(outputPath)
      ? await readFile(outputPath, "utf8")
      : "";
    const changed = existing !== ttl;

    if (!options.check && changed) {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, ttl, "utf8");
    }

    results.push({
      id: dataset.id,
      outputPath: relative(PROJECT_ROOT, outputPath),
      bytes: Buffer.byteLength(ttl, "utf8"),
      changed,
    });
  }

  return results;
}

function formatResults(
  results: readonly DatasetResult[],
  check: boolean,
): string {
  const lines = results.map((result) => {
    const status = check
      ? result.changed
        ? "stale"
        : "fresh"
      : result.changed
        ? "wrote"
        : "same";
    return `[${status}] ${result.id} -> ${result.outputPath} (${result.bytes} bytes)`;
  });
  return `${lines.join("\n")}\n`;
}

async function main(args: string[]): Promise<number> {
  const check = args.includes("--check");
  const unknown = args.find((arg) => arg !== "--check");
  if (unknown) {
    process.stderr.write(`Unknown argument: ${unknown}\n`);
    return 1;
  }

  const results = await regenerateDatasets(DATASETS, { check });
  process.stdout.write(formatResults(results, check));

  const stale = results.filter((result) => result.changed);
  if (check && stale.length > 0) {
    process.stderr.write(
      `Generated data is stale: ${stale.map((result) => result.id).join(", ")}\nRun pnpm data:regen to update public/data.\n`,
    );
    return 1;
  }

  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      process.stderr.write(
        error instanceof Error ? `${error.message}\n` : "Unknown error\n",
      );
      process.exitCode = 1;
    });
}
