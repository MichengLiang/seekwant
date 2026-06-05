# seekwant

Source-available command-line tool project for seekwant.

seekwant is maintained by its core team as a product project. Public source
access supports review, reproducibility, issue reporting, and noncommercial use;
it does not make the project open source or community-governed.

## Project State

seekwant is in private repository preparation. The initial repository contains
the project license, contribution boundaries, command-line entry point, tests,
and continuous integration. Product behavior will be added as the first working
version becomes ready.

## Development

```bash
pnpm install
pnpm check
```

Useful focused commands:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Command Surface

The initial CLI supports:

```bash
seekwant --help
seekwant --version
```

The default command currently reports that product behavior is not yet available.

## Repository Policy

seekwant is source-available, not open source. Noncommercial use is allowed under
the PolyForm Noncommercial License 1.0.0. Commercial use requires a separate
license from the copyright holder.

Substantive external contributions require prior maintainer approval and may
require a signed Contributor License Agreement. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CLA.md`](CLA.md).

## License

PolyForm Noncommercial License 1.0.0. See [`LICENSE`](LICENSE).

Commercial use is not permitted under this license. See
[`COMMERCIAL.md`](COMMERCIAL.md).
