import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
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
