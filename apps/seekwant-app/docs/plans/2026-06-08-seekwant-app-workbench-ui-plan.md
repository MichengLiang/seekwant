# seekwant-app Workbench UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the seekwant-app UI shell into a desktop/tablet workbench that follows `docs/design/seekwant-app 工作台 UI 正式设计方案.md`.

**Architecture:** Keep the existing document/graph/detail triad, but move global chrome, data selection, view settings, legend, and canvas actions into scoped workbench surfaces. The implementation should preserve current RDF parsing, Asciidoctor rendering, graph interaction, and detail behavior while changing where controls live and how they are tested.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, Cytoscape, Vitest, Testing Library, Playwright. Use `pnpm` from this app directory or the monorepo root. Add `lucide-react` only if icon buttons are implemented with library icons.

---

## Design Source

Primary design source:

- `docs/design/seekwant-app 工作台 UI 正式设计方案.md`

This plan references that design file and does not restate its full rationale. If this plan and the design file appear to conflict, stop and ask the coordinator before implementing.

## Required Reading

The worker must read these files before editing:

- `docs/design/seekwant-app 工作台 UI 正式设计方案.md`
- `src/pages/GraphPage.tsx`
- `src/components/DocumentPanel.tsx`
- `src/components/DetailPanel.tsx`
- `src/components/TtlGraph.tsx`
- `src/components/FileSelector.tsx`
- `src/components/LabelToggle.tsx`
- `src/components/Legend.tsx`
- `src/index.css`
- `src/App.test.tsx`
- `e2e/graph.spec.ts`
- `package.json`

Read only as needed after that:

- `src/lib/ttl-parser.ts` if label/data shape questions arise.
- `src/lib/predicate-i18n.ts` if edge label text questions arise.
- `src/components/ui/theme-provider.tsx` if theme state questions arise.

## Non-Goals

- Do not change TTL parsing semantics.
- Do not change Asciidoctor rendering semantics.
- Do not redesign the graph layout algorithm.
- Do not implement a complete mobile experience.
- Do not add plugin systems, draggable custom layouts, command palette infrastructure, or persisted settings storage unless required for the work packages below.
- Do not rewrite the whole application into a new framework.
- Do not remove existing document, graph, or detail capabilities.

## Dirty Worktree Rule

The workspace already contains unrelated changes. The worker must not revert unrelated files. The worker must report every changed path. Do not commit unless the coordinator explicitly requests a commit.

## Global Acceptance Metrics

The finished implementation is acceptable only when all metrics are true:

- Desktop header/title bar height is no more than 52px at `1440x900`.
- Narrow desktop/tablet header/title bar height is no more than 56px at `1024x768`.
- The full preset dataset list is not rendered as a horizontal top-level button group.
- Edge label language, structure-edge visibility, and node label mode are not permanently visible in the top title bar.
- Legend is not rendered as a permanent header row.
- Document render/source controls remain inside the document panel.
- Detail node/file source controls remain inside the detail panel.
- Fit/focus graph actions remain inside the graph canvas surface.
- Phone-width completeness is not a requirement, but the UI must not create a 200px top control stack at `390x844`.
- Existing tests are updated to the new surfaces and pass.
- Playwright screenshots show no overlapping controls at `1440x900` and `1024x768`.

## Work Package 1: Workbench Shell and Title Bar

**Purpose:** Replace the mixed header with a scoped title bar and explicit workbench layout surfaces.

**Files:**

- Modify: `src/pages/GraphPage.tsx`
- Create: `src/components/workbench/WorkbenchShell.tsx`
- Create: `src/components/workbench/TitleBar.tsx`
- Create: `src/components/workbench/StatusBar.tsx`
- Modify: `src/App.test.tsx`
- Modify: `e2e/graph.spec.ts`

**Required Behavior:**

- `GraphPage` delegates outer layout to `WorkbenchShell`.
- `TitleBar` shows app identity and current dataset context.
- `TitleBar` exposes settings and data source entry points, but does not expose view settings.
- `StatusBar` receives graph counts and interaction hint text.
- Existing document, graph, and detail panels still render.

**Definition of Excellent:**

- The shell reads as an IDE/workbench surface, not as a webpage header.
- `GraphPage` becomes easier to scan because layout chrome is extracted from graph state logic.
- The title bar has stable height and does not wrap controls at 1024px.

**Definition of Done:**

- Unit test confirms the app heading/title is present.
- E2E test confirms title bar exists and old permanent top controls are absent.
- Screenshot at `1440x900` shows title bar at or below 52px.

**Steps:**

- [ ] Create `src/components/workbench/WorkbenchShell.tsx` with a flex column root, title slot, body slot, and status slot.
- [ ] Create `src/components/workbench/TitleBar.tsx` with app label, current dataset label, data-source button, and settings button.
- [ ] Create `src/components/workbench/StatusBar.tsx` with left and right text regions.
- [ ] Replace the existing `header` and `footer` in `GraphPage.tsx` with the new shell components.
- [ ] Move existing graph count text into `StatusBar`.
- [ ] Remove permanent top-row controls for edge label, structure edges, node labels, and legend from the title bar.
- [ ] Update `src/App.test.tsx` to assert the new title bar and status bar labels.
- [ ] Update `e2e/graph.spec.ts` to stop expecting old top-level controls.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm e2e`.

## Work Package 2: Dataset Switcher

**Purpose:** Replace the horizontal preset file button group with a compact data source selector.

**Files:**

- Modify: `src/components/FileSelector.tsx` or replace it with `src/components/workbench/DatasetSwitcher.tsx`
- Modify: `src/pages/GraphPage.tsx`
- Modify: `src/App.test.tsx`
- Modify: `e2e/graph.spec.ts`

**Required Behavior:**

- Current dataset remains visible in the title bar.
- Clicking the dataset selector opens a list of preset datasets.
- The list contains the existing preset files from `DATA_FILES`.
- The list contains an `打开文件...` action wired to the existing local TTL load behavior.
- Selecting a preset uses the existing `loadPreset` path.
- Loading a local file uses the existing `handleFileLoad` path.

**Definition of Excellent:**

- Dataset selection is discoverable without rendering six persistent buttons.
- The selector has keyboard-accessible button semantics and closes after selection.
- The current dataset label is never ambiguous.

**Definition of Done:**

- E2E can switch to `Book Entry` through the dataset selector.
- E2E can still find the hidden file input through the open-file action path.
- The title bar does not grow when preset names are long.

**Steps:**

- [ ] Build a controlled popover/dropdown using React state and plain buttons.
- [ ] Keep the existing `DATA_FILES` export available for tests and graph loading.
- [ ] Use a single trigger button in the title bar showing `currentFile.label`.
- [ ] Render preset options in a bounded menu with each option as a button.
- [ ] Add a separator and `打开文件...` menu item that triggers the hidden file input.
- [ ] Ensure choosing an option closes the menu.
- [ ] Ensure pressing `Escape` closes the menu when it is open.
- [ ] Update tests that previously clicked top-level preset buttons.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm e2e`.

## Work Package 3: Settings Drawer

**Purpose:** Move low-frequency view settings into a right-side settings drawer.

**Files:**

- Create: `src/components/workbench/SettingsDrawer.tsx`
- Create: `src/components/workbench/SettingsSection.tsx`
- Modify: `src/pages/GraphPage.tsx`
- Modify: `src/components/LabelToggle.tsx` if reusable segmented control extraction is needed
- Modify: `src/App.test.tsx`
- Modify: `e2e/graph.spec.ts`

**Required Behavior:**

- Settings opens from a title bar settings button.
- Drawer width is between 360px and 420px on desktop.
- Drawer contains a visible title and close button.
- Drawer contains sections:
  - `图谱显示`
  - `图例与分组`
  - `文档阅读`
  - `详情面板`
  - `工作台`
- `图谱显示` contains node label mode, edge label language, and structure-edge visibility.
- Existing state variables remain functional:
  - `labelMode`
  - `predicateChinese`
  - `showContains`
- Settings changes are immediate and do not require an Apply button.

**Definition of Excellent:**

- The drawer feels like a configuration surface, not a modal interruption.
- Settings are grouped by the object they affect.
- The drawer can remain open while the graph updates behind it.
- No setting description is longer than needed to explain effect.

**Definition of Done:**

- The old top-level `边标签`, `包含关系`, and `节点标签` controls are gone.
- Opening settings exposes those controls.
- E2E toggles structure edges from the drawer and verifies relationship count changes.
- E2E changes label mode from the drawer.

**Steps:**

- [ ] Create `SettingsDrawer` with `open`, `onClose`, and controlled settings props.
- [ ] Add a title, close button, and optional search field placeholder for settings search.
- [ ] Implement `图谱显示` controls first because they have existing state.
- [ ] Add `图例与分组`, `文档阅读`, `详情面板`, and `工作台` as visible sections with only currently supported controls or reset actions.
- [ ] Do not add nonfunctional controls unless clearly disabled and explained.
- [ ] Wire the title bar settings button to drawer open state in `GraphPage`.
- [ ] Remove old top-level settings controls from `GraphPage`.
- [ ] Update unit tests to open settings before querying moved controls.
- [ ] Update e2e tests to use the settings drawer for moved controls.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm e2e`.

## Work Package 4: Legend Relocation and Activity Rail

**Purpose:** Remove the permanent header legend row and give legend/data surfaces a proper workbench location.

**Files:**

- Create: `src/components/workbench/ActivityRail.tsx`
- Create: `src/components/workbench/LegendPanel.tsx`
- Modify: `src/components/Legend.tsx`
- Modify: `src/pages/GraphPage.tsx`
- Modify: `src/App.test.tsx`
- Modify: `e2e/graph.spec.ts`

**Required Behavior:**

- An activity rail appears on the left edge of the workbench body.
- Activity rail has at least document and legend entries.
- Document entry shows the document panel.
- Legend entry shows a legend panel using existing `Legend` data.
- The permanent header legend row is removed.
- Document panel can still collapse/expand.

**Definition of Excellent:**

- Activity rail is narrow and icon-first.
- Legend becomes discoverable without consuming top vertical space.
- The document panel remains the default left content.
- The rail does not add visual noise greater than the header row it replaces.

**Definition of Done:**

- E2E confirms legend is not in the title bar.
- E2E opens the legend view and sees current group names/counts.
- Document view remains default after page load.
- Header height remains within global metrics.

**Steps:**

- [ ] Create `ActivityRail` with `activeView` and `onActiveViewChange`.
- [ ] Provide accessible labels for rail buttons.
- [ ] Create `LegendPanel` that wraps existing `Legend` with a panel title.
- [ ] Move legend rendering out of the old header area.
- [ ] Add left workbench composition in `GraphPage`: rail plus selected left view.
- [ ] Preserve `DocumentPanel` resize/collapse behavior when document view is active.
- [ ] Decide and implement behavior for collapsed document panel while legend view is active; default should keep rail visible.
- [ ] Update tests for legend access.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm e2e`.

## Work Package 5: Canvas Toolbar

**Purpose:** Make graph actions visually and semantically local to the graph canvas.

**Files:**

- Modify: `src/components/TtlGraph.tsx`
- Create: `src/components/workbench/CanvasToolbar.tsx`
- Modify: `e2e/graph.spec.ts`

**Required Behavior:**

- `适配视图` remains available.
- `退出聚焦` appears only when a node is focused.
- Toolbar is compact, stable, and located inside the graph canvas.
- Toolbar buttons have accessible labels and tooltips or visible short labels.

**Definition of Excellent:**

- Canvas controls look like graph controls, not page buttons.
- Buttons do not cover important graph content more than necessary.
- Control layout is stable across focus/unfocus.

**Definition of Done:**

- Existing fit-view behavior still works.
- Existing focus reset behavior still works.
- E2E can locate and use the fit-view button.
- Screenshot shows controls inside canvas, not title bar.

**Steps:**

- [ ] Extract the bottom-right graph button group into `CanvasToolbar`.
- [ ] Keep callbacks and behavior identical.
- [ ] Use icon buttons if `lucide-react` is available; otherwise use concise text buttons with `aria-label`.
- [ ] Ensure focused/unfocused toolbar states do not shift canvas layout.
- [ ] Update e2e selectors if button names change.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm e2e`.

## Work Package 6: Visual Verification and Regression Gates

**Purpose:** Prove the redesign meets density, layout, and no-overlap requirements.

**Files:**

- Modify: `e2e/graph.spec.ts`
- Optional create: `e2e/workbench-layout.spec.ts`
- Optional create: `scripts/capture-workbench-screenshots.ts`

**Required Behavior:**

- Automated checks cover desktop and tablet-width layouts.
- Header/title bar height is measured.
- Settings drawer and dataset switcher are tested.
- Graph, document, and detail panels remain usable after relocation.

**Definition of Excellent:**

- Verification catches the exact failure that motivated the redesign: top control stack height.
- E2E tests assert behavior, not implementation details.
- Screenshots are available for human review.

**Definition of Done:**

- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm e2e` passes.
- Playwright screenshots are captured for `1440x900`, `1024x768`, and `390x844`.
- The `390x844` screenshot is used only to verify that the top control stack no longer reaches roughly 200px; it is not a full mobile acceptance target.

**Steps:**

- [ ] Add or update Playwright tests to measure title bar height.
- [ ] Add or update Playwright tests for settings drawer open/close.
- [ ] Add or update Playwright tests for dataset switching through the new selector.
- [ ] Add or update Playwright tests for legend view access.
- [ ] Capture screenshots after tests or through a script.
- [ ] Run `pnpm typecheck`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm e2e`.

## Engineering Quality Gate

Before reporting completion, the worker must provide:

- Changed file list.
- Summary of behavior changes.
- Test commands run and their exact pass/fail result.
- Screenshot paths.
- Any known residual risks.
- Confirmation that no unrelated files were reverted.

The coordinator will review:

- Spec compliance against `docs/design/seekwant-app 工作台 UI 正式设计方案.md`.
- Work package completion against this plan.
- Code quality, component boundaries, accessibility, and test coverage.
- Screenshots for visual density and overlap.

## Subagent Execution Prompt

When starting implementation, give the worker this prompt:

```text
You are implementing the seekwant-app workbench UI redesign.

Workspace:
/home/t103o/workbench/micheng-ts/projects/seekwant/apps/seekwant-app

Model requested by user: gpt-5.5, high reasoning, no forked conversation context.

You are not alone in this repository. There are existing unrelated changes. Do not revert unrelated files. Do not commit unless explicitly instructed by the coordinator. Report every changed path.

Required skill:
- Use test-driven-development before implementation changes.

Required reading before edits:
- docs/design/seekwant-app 工作台 UI 正式设计方案.md
- docs/plans/2026-06-08-seekwant-app-workbench-ui-plan.md
- src/pages/GraphPage.tsx
- src/components/DocumentPanel.tsx
- src/components/DetailPanel.tsx
- src/components/TtlGraph.tsx
- src/components/FileSelector.tsx
- src/components/LabelToggle.tsx
- src/components/Legend.tsx
- src/index.css
- src/App.test.tsx
- e2e/graph.spec.ts
- package.json

Implement the plan in order by work package. Keep changes scoped. Preserve existing RDF parsing, Asciidoctor rendering, graph behavior, and detail behavior. Do not implement a full mobile experience.

Quality requirements:
- Use existing React/Tailwind patterns.
- Prefer small focused components under src/components/workbench.
- Keep title bar height <= 52px at 1440x900 and <= 56px at 1024x768.
- Move low-frequency view settings into a settings drawer.
- Move dataset buttons into a compact dataset selector.
- Remove the permanent header legend row.
- Keep document controls local to DocumentPanel.
- Keep detail controls local to DetailPanel.
- Keep graph fit/focus controls local to the graph canvas.

Verification required before reporting DONE:
- pnpm typecheck
- pnpm test
- pnpm e2e
- Playwright screenshots for 1440x900, 1024x768, and 390x844

Final report format:
- Status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED
- Changed files
- Work packages completed
- Verification commands and results
- Screenshot paths
- Concerns or residual risks
```
