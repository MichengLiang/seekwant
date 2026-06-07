import { exportAnimationYaml } from "asciidoc-abundant-tree";
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

export type SeekwantDependencies = {
  readonly exportAnimationYaml: (options: {
    readonly sourcePath: string;
    readonly documentRoot?: string;
  }) => {
    readonly yaml: string;
    readonly warnings: readonly unknown[];
  };
};

const defaultDependencies: SeekwantDependencies = {
  exportAnimationYaml,
};

const helpText = `Usage: seekwant [options]
       seekwant export animation-yaml <book.adoc> [--document-root <root>]

Options:
  --help       Show this help message.
  --version    Print the seekwant version.
`;

export function runSeekwant(
  args: readonly string[],
  metadata: SeekwantMetadata = packageJson,
  dependencies: SeekwantDependencies = defaultDependencies,
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

  if (args[0] === "export") {
    return runExportCommand(args.slice(1), dependencies);
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

function runExportCommand(
  args: readonly string[],
  dependencies: SeekwantDependencies,
): SeekwantResult {
  if (args[0] !== "animation-yaml") {
    return {
      stdout: "",
      stderr: `Unknown export target: ${args[0] ?? ""}\n\n${helpText}`,
      exitCode: 2,
    };
  }

  let sourcePath: string | undefined;
  let documentRoot: string | undefined;

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) {
      continue;
    }
    if (arg === "--document-root") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("-")) {
        return {
          stdout: "",
          stderr: "--document-root requires a value\n",
          exitCode: 2,
        };
      }
      documentRoot = value;
      index += 1;
      continue;
    }
    if (arg.startsWith("-")) {
      return {
        stdout: "",
        stderr: `Unknown option: ${arg}\n\n${helpText}`,
        exitCode: 2,
      };
    }
    if (sourcePath === undefined) {
      sourcePath = arg;
      continue;
    }
    return {
      stdout: "",
      stderr: `Unexpected extra argument: ${arg}\n\n${helpText}`,
      exitCode: 2,
    };
  }

  if (sourcePath === undefined) {
    return {
      stdout: "",
      stderr: `Missing input file.\n\n${helpText}`,
      exitCode: 2,
    };
  }

  try {
    const result = dependencies.exportAnimationYaml({
      sourcePath,
      ...(documentRoot === undefined ? {} : { documentRoot }),
    });

    return {
      stdout: result.yaml,
      stderr: "",
      exitCode: 0,
    };
  } catch (error) {
    return {
      stdout: "",
      stderr: `${formatError(error)}\n`,
      exitCode: 1,
    };
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
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
