import type { LabelMode } from "../lib/ttl-parser";

interface LabelToggleProps {
  mode: LabelMode;
  onChange: (mode: LabelMode) => void;
}

const OPTIONS: { value: LabelMode; label: string }[] = [
  { value: "headline", label: "标题名" },
  { value: "addressLabel", label: "ID" },
  { value: "both", label: "两者" },
];

export function LabelToggle({ mode, onChange }: LabelToggleProps) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            mode === opt.value
              ? "bg-gray-800 text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
