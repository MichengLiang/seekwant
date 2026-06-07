import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import packageJson from "../package.json" with { type: "json" };

test("built CLI executes directly with the node runtime", () => {
  const cliPath = fileURLToPath(new URL("../dist/cli.js", import.meta.url));

  if (!existsSync(cliPath)) {
    assert.fail("dist/cli.js is missing; run pnpm build before this test");
  }

  const result = spawnSync(process.execPath, [cliPath, "--version"], {
    encoding: "utf8",
  });

  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), packageJson.version);
  assert.equal(result.stderr, "");
});

test("built CLI exports animation YAML from an AsciiDoc book", () => {
  const cliPath = fileURLToPath(new URL("../dist/cli.js", import.meta.url));
  const fixtureRoot = join(process.cwd(), "test/fixtures/animation-yaml");
  const fixtureBook = join(fixtureRoot, "book.adoc");

  if (!existsSync(cliPath)) {
    assert.fail("dist/cli.js is missing; run pnpm build before this test");
  }

  const result = spawnSync(
    process.execPath,
    [
      cliPath,
      "export",
      "animation-yaml",
      fixtureBook,
      "--document-root",
      fixtureRoot,
    ],
    {
      encoding: "utf8",
    },
  );
  const yaml = parse(result.stdout);

  assert.equal(result.status, 0);
  assert.equal(result.stderr, "");
  assert.equal(yaml.adaptation_profile.id, "profile-animation-main");
  assert.equal(yaml.script.scenes[0].id, "scene-riverbank-rabbit");
  assert.equal(yaml.exports.mappings[0].id, "mapping-animation-yaml");
});
