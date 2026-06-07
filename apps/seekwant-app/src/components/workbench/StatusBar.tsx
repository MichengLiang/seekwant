interface StatusBarProps {
  leftText: string;
  rightText: string;
}

export function StatusBar({ leftText, rightText }: StatusBarProps) {
  return (
    <footer
      className="flex h-7 flex-shrink-0 items-center justify-between gap-4 border-t border-gray-200 bg-white px-4"
      data-testid="workbench-status-bar"
    >
      <span className="min-w-0 truncate text-gray-500 text-xs">{leftText}</span>
      <span className="hidden min-w-0 truncate text-gray-400 text-xs md:inline">
        {rightText}
      </span>
    </footer>
  );
}
