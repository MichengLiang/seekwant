import { BookOpen, type LucideIcon, Tags } from "lucide-react";

export type WorkbenchView = "document" | "legend";

interface ActivityRailProps {
  activeView: WorkbenchView;
  onActiveViewChange: (view: WorkbenchView) => void;
}

const ITEMS: { view: WorkbenchView; label: string; Icon: LucideIcon }[] = [
  { view: "document", label: "文档", Icon: BookOpen },
  { view: "legend", label: "图例", Icon: Tags },
];

export function ActivityRail({
  activeView,
  onActiveViewChange,
}: ActivityRailProps) {
  return (
    <nav
      aria-label="工作台视图"
      className="flex w-11 flex-shrink-0 flex-col items-center gap-1 border-gray-200 border-r bg-white py-2"
    >
      {ITEMS.map(({ Icon, ...item }) => (
        <button
          aria-label={item.label}
          aria-pressed={activeView === item.view}
          className={`flex h-8 w-8 items-center justify-center rounded text-xs transition-colors ${
            activeView === item.view
              ? "bg-gray-900 text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          }`}
          key={item.view}
          onClick={() => onActiveViewChange(item.view)}
          title={item.label}
          type="button"
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </button>
      ))}
    </nav>
  );
}
