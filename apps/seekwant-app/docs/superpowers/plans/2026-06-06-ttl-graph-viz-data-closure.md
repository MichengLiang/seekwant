# ttl-graph-viz Data Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `ttl-graph-viz` own its source document fixtures and regenerate `public/data/*.ttl` through the published `asciidoc-abundant-tree` package.

**Architecture:** Add a local dataset manifest, a TypeScript regeneration script, and tests that keep UI presets, source fixtures, and generated TTL files aligned. Use `parseAbundantTree` plus `rdf12` from the public npm package; do not call the neighboring source repository.

**Tech Stack:** pnpm workspace catalog, TypeScript, tsx, Vitest, `asciidoc-abundant-tree`, Vite public assets.

---

### Task 1: Dataset Contract Tests

**Files:**
- Create: `scripts/datasets.ts`
- Create: `scripts/regenerate-data.ts`
- Create: `scripts/__tests__/datasets.test.ts`
- Modify: `src/components/FileSelector.tsx`

- [ ] Write failing tests that import the dataset manifest and generation helper.
- [ ] Verify they fail because the modules do not exist.
- [ ] Implement manifest and generation helper.
- [ ] Verify the focused tests pass.

### Task 2: Source Fixture Ownership

**Files:**
- Create: `fixtures/source-documents/**`
- Modify: `scripts/datasets.ts`

- [ ] Copy all six preset source document sets into `fixtures/source-documents`.
- [ ] Preserve book-entry directory structure and include-relative paths.
- [ ] Verify dataset path tests pass.

### Task 3: Regeneration Command

**Files:**
- Delete: `regen.py`
- Modify: `package.json`
- Modify: root `pnpm-workspace.yaml`
- Modify: root `pnpm-lock.yaml`

- [ ] Add `asciidoc-abundant-tree` to the workspace catalog and experiment dev dependencies.
- [ ] Add `data:regen` and `data:check` scripts.
- [ ] Replace Python regeneration with the TypeScript script.
- [ ] Regenerate all TTL files and verify `data:check` passes.

### Task 4: Template Debt Cleanup

**Files:**
- Modify: `vite.config.ts`
- Delete: `src/api.ts`
- Modify: `package.json`

- [ ] Remove the template preview API and legacy template preview API dependency.
- [ ] Verify typecheck and build still pass.

### Task 5: Final Verification

**Commands:**
- `pnpm --filter seekwant-app data:check`
- `pnpm --filter seekwant-app typecheck`
- `pnpm --filter seekwant-app test`
- `pnpm --filter seekwant-app build`
- `pnpm --filter seekwant-app e2e`

- [ ] Run all commands fresh.
- [ ] Inspect failures and fix only scoped issues.
- [ ] Report exact verification evidence.
