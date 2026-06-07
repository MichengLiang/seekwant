import assert from "node:assert/strict";
import { test } from "node:test";
import packageJson from "../package.json" with { type: "json" };
import { runSeekwant, type SeekwantDependencies } from "../src/cli.ts";

const metadata = {
  name: packageJson.name,
  version: packageJson.version,
};

function dependencies(
  exporter: SeekwantDependencies["exportAnimationYaml"],
): SeekwantDependencies {
  return { exportAnimationYaml: exporter };
}

test("prints help and exits successfully", () => {
  const result = runSeekwant(["--help"], metadata);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /Usage: seekwant/);
  assert.match(result.stdout, /--version/);
  assert.equal(result.stderr, "");
});

test("prints version and exits successfully", () => {
  const result = runSeekwant(["--version"], metadata);

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout.trim(), packageJson.version);
  assert.equal(result.stderr, "");
});

test("reports initial product behavior placeholder for the default command", () => {
  const result = runSeekwant([], metadata);

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /product behavior is not available yet/i);
  assert.equal(result.stderr, "");
});

test("rejects unknown options with usage guidance", () => {
  const result = runSeekwant(["--unknown"], metadata);

  assert.equal(result.exitCode, 2);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /Unknown option: --unknown/);
  assert.match(result.stderr, /Usage: seekwant/);
});

test("exports animation YAML through the seekwant CLI command surface", () => {
  const calls: Array<{ sourcePath: string; documentRoot?: string }> = [];
  const result = runSeekwant(
    [
      "export",
      "animation-yaml",
      "fixtures/book.adoc",
      "--document-root",
      "fixtures",
    ],
    metadata,
    dependencies((options) => {
      calls.push(options);
      return {
        yaml: 'schema_version: "1.0"\n',
        warnings: [],
      };
    }),
  );

  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, 'schema_version: "1.0"\n');
  assert.equal(result.stderr, "");
  assert.deepEqual(calls, [
    {
      sourcePath: "fixtures/book.adoc",
      documentRoot: "fixtures",
    },
  ]);
});

test("reports animation YAML export failures", () => {
  const result = runSeekwant(
    ["export", "animation-yaml", "missing.adoc"],
    metadata,
    dependencies(() => {
      throw new Error("missing input");
    }),
  );

  assert.equal(result.exitCode, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /missing input/);
});
