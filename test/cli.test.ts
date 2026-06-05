import assert from "node:assert/strict";
import { test } from "node:test";
import packageJson from "../package.json" with { type: "json" };
import { runSeekwant } from "../src/cli.ts";

const metadata = {
  name: packageJson.name,
  version: packageJson.version,
};

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
