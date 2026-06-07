# seekwant-app

Frontend workspace app for seekwant's Turtle knowledge graph viewer.

The app keeps generated Turtle files in `public/data`, but the source of truth is
the AsciiDoc fixture set under `fixtures/source-documents`. Run `pnpm data:check`
before committing data or parser changes; run `pnpm data:regen` when fixture
changes intentionally update generated graph data.

## Development

From the repository root:

```bash
pnpm app:dev
pnpm app:test
pnpm app:build
pnpm app:e2e
```

From this app directory:

```bash
pnpm dev
pnpm test
pnpm build
pnpm e2e
```
