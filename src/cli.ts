import packageJson from "../package.json" with { type: "json" };

export type SeekwantMetadata = {
  name: string;
  version: string;
};

export type SeekwantResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

const helpText = `Usage: seekwant [options]

Options:
  --help       Show this help message.
  --version    Print the seekwant version.
`;

export function runSeekwant(
  args: readonly string[],
  metadata: SeekwantMetadata = packageJson,
): SeekwantResult {
  const unknownOption = args.find((arg) => arg.startsWith("-"));

  if (args.includes("--help") || args.includes("-h")) {
    return {
      stdout: helpText,
      stderr: "",
      exitCode: 0,
    };
  }

  if (args.includes("--version") || args.includes("-v")) {
    return {
      stdout: `${metadata.version}\n`,
      stderr: "",
      exitCode: 0,
    };
  }

  if (unknownOption !== undefined) {
    return {
      stdout: "",
      stderr: `Unknown option: ${unknownOption}\n\n${helpText}`,
      exitCode: 2,
    };
  }

  return {
    stdout:
      "seekwant product behavior is not available yet. Use --help for the current command surface.\n",
    stderr: "",
    exitCode: 0,
  };
}

export function main(args = process.argv.slice(2)): void {
  const result = runSeekwant(args);

  if (result.stdout.length > 0) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr.length > 0) {
    process.stderr.write(result.stderr);
  }

  process.exitCode = result.exitCode;
}

const entryPath = process.argv[1] ? new URL(process.argv[1], "file:") : null;

if (entryPath?.href === import.meta.url) {
  main();
}
