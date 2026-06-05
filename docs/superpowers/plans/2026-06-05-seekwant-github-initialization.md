# seekwant GitHub Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an independent private GitHub repository for seekwant with source-available governance, a minimal TypeScript CLI skeleton, CI, and no npm publishing path yet.

**Architecture:** The repository root is the Node package root so GitHub Actions and future npm publishing do not need nested working directories. The CLI has a small pure command module that returns stdout/stderr/exitCode results, and a thin process wrapper that performs actual I/O. Governance documents state source-available, noncommercial, CLA-backed project policy.

**Tech Stack:** Node.js 24, pnpm 10.33.0, TypeScript, tsx, tsup, Biome, Node built-in test runner, GitHub Actions.

---

### Task 1: Governance and Repository Policy

**Files:**
- Create: `LICENSE`
- Create: `NOTICE`
- Create: `COMMERCIAL.md`
- Create: `CLA.md`
- Create: `CONTRIBUTING.md`
- Create: `README.md`
- Create: `CHANGELOG.md`

- [x] **Step 1: Copy the PolyForm Noncommercial 1.0.0 license from inkrail**

Use `inkrail` as the source of truth for license text and keep the required notice:

```text
Required Notice: Copyright 2026 弥澄亮 (https://github.com/MichengLiang)
```

- [x] **Step 2: Add commercial-use policy**

`COMMERCIAL.md` states that noncommercial use is allowed, commercial use requires a separate license, and commercial use includes products, paid services, internal production workflows, customer delivery, consulting, SaaS, enterprise platforms, and other anticipated commercial applications.

- [x] **Step 3: Add contribution policy and CLA**

`CONTRIBUTING.md` and `CLA.md` state that seekwant is source-available, not community-governed open source, and substantive external contributions require prior maintainer approval.

### Task 2: Project Tooling and CI

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `biome.json`
- Create: `.gitignore`
- Create: `.github/workflows/ci.yml`

- [x] **Step 1: Define package metadata**

`package.json` uses package name `seekwant`, version `0.1.0`, license `PolyForm-Noncommercial-1.0.0`, repository `git+https://github.com/MichengLiang/seekwant.git`, and no npm publish workflow.

- [x] **Step 2: Add local scripts**

Scripts include `format`, `lint`, `typecheck`, `test`, `build`, `pack:check`, and `check`.

- [x] **Step 3: Add GitHub Actions CI**

CI runs on push to `main` and pull requests, installs pnpm 10.33.0 and Node 24, then executes `pnpm check`.

### Task 3: Minimal CLI Behavior

**Files:**
- Create: `test/cli.test.ts`
- Create: `src/cli.ts`

- [x] **Step 1: Write tests before implementation**

Tests assert help output, version output, default placeholder behavior, unknown option errors, and direct executable behavior after build.

- [x] **Step 2: Run tests and confirm red state**

Run:

```bash
pnpm test
```

Observed: the test command failed because `src/cli.ts` did not exist yet.

- [x] **Step 3: Implement minimal CLI**

`src/cli.ts` exports `runSeekwant(args, metadata)` and `main()`. `runSeekwant` returns an object with `stdout`, `stderr`, and `exitCode` so tests do not need to mock process I/O.

- [x] **Step 4: Run tests and confirm green state**

Run:

```bash
pnpm test
```

Observed: all CLI unit tests passed.

### Task 4: Verification, GitHub, and Push

**Files:**
- Modify: generated `pnpm-lock.yaml`

- [x] **Step 1: Install dependencies**

Run:

```bash
pnpm install
```

Observed: dependencies installed inside the seekwant workspace and
`pnpm-lock.yaml` was generated.

- [x] **Step 2: Run full local verification**

Run:

```bash
pnpm check
```

Observed: Biome, TypeScript, Node tests, tsup build, and npm pack dry-run all
passed.

- [ ] **Step 3: Initialize independent git repository**

Run:

```bash
git init
git branch -M main
git add .
git commit -m "Initialize seekwant source-available CLI repository"
```

Expected: one initial commit in `projects/seekwant`.

- [ ] **Step 4: Create private GitHub repository and push**

Run:

```bash
gh repo create MichengLiang/seekwant --private --source . --remote origin --push
```

Expected: private GitHub repository exists and `main` is pushed.

### Self-Review

- Spec coverage: The plan covers private GitHub initialization, independent repository layout, source-available governance, minimal CLI, CI, and no npm publishing path.
- Placeholder scan: No unfinished placeholder requirements remain; future product behavior is intentionally excluded from this initialization.
- Type consistency: The CLI test target, build entry, bin path, and package exports all use `src/cli.ts` and `dist/cli.js`.
