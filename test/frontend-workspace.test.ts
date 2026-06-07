import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));

function readText(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

test("seekwant-app is maintained as an internal workspace app", () => {
  const workspace = readText("pnpm-workspace.yaml");
  const appPackageText = readText("apps/seekwant-app/package.json");
  const appPackage = JSON.parse(appPackageText) as {
    name?: string;
    private?: boolean;
  };

  assert.match(workspace, /apps\/\*/);
  assert.equal(appPackage.name, "seekwant-app");
  assert.equal(appPackage.private, true);
});

test("seekwant-app does not depend on the outer micheng-ts workspace", () => {
  const packageText = readText("apps/seekwant-app/package.json");
  const appText = readText("apps/seekwant-app/src/App.tsx");
  const cssText = readText("apps/seekwant-app/src/index.css");
  const combined = [packageText, appText, cssText].join("\n");

  assert.doesNotMatch(combined, /catalog:/);
  assert.doesNotMatch(combined, /workspace:\*/);
  assert.doesNotMatch(combined, /@micheng-ts/);
});

test("frontend workspace guard resolves paths from the seekwant repository", () => {
  const rootPackage = JSON.parse(readText("package.json")) as {
    name?: string;
  };

  assert.equal(rootPackage.name, "seekwant");
  assert.match(repositoryRoot, /seekwant\/?$/);
});
