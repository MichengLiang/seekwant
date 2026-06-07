import { Focus, Maximize2 } from "lucide-react";

interface CanvasToolbarProps {
  focused: boolean;
  onFit: () => void;
}

export function CanvasToolbar({ focused, onFit }: CanvasToolbarProps) {
  return (
    <div className="absolute right-4 bottom-4 flex flex-col items-end gap-2">
      {focused ? (
        <button
          aria-label="退出聚焦"
          className="rounded border border-blue-200 bg-white/95 px-3 py-1.5 text-blue-600 text-xs shadow-sm transition-colors hover:bg-blue-50"
          onClick={onFit}
          title="退出聚焦"
          type="button"
        >
          <Focus aria-hidden="true" className="mr-1.5 inline h-3.5 w-3.5" />
          退出聚焦
        </button>
      ) : null}
      <button
        aria-label="适配视图"
        className="rounded border border-gray-200 bg-white/95 px-3 py-1.5 text-gray-600 text-xs shadow-sm transition-colors hover:bg-gray-50"
        onClick={onFit}
        title="适配视图"
        type="button"
      >
        <Maximize2 aria-hidden="true" className="mr-1.5 inline h-3.5 w-3.5" />
        适配视图
      </button>
    </div>
  );
}
