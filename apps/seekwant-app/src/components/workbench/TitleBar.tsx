import { Settings } from "lucide-react";
import type { ReactNode } from "react";

interface TitleBarProps {
  datasetControl: ReactNode;
  onSettingsOpen: () => void;
}

export function TitleBar({ datasetControl, onSettingsOpen }: TitleBarProps) {
  return (
    <header
      className="flex h-12 flex-shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4"
      data-testid="workbench-title-bar"
    >
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="flex-shrink-0 font-semibold text-gray-800 text-sm tracking-normal">
          TTL 知识图谱
        </h1>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        {datasetControl}
        <button
          aria-label="打开设置"
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-gray-200 bg-white font-medium text-gray-500 text-sm transition-colors hover:bg-gray-50 hover:text-gray-800"
          onClick={onSettingsOpen}
          title="设置"
          type="button"
        >
          <Settings aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
