import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DATA_FILES, type DataFile } from "../FileSelector";

interface DatasetSwitcherProps {
  current: DataFile;
  onChange: (file: DataFile) => void;
  onFileLoad: (text: string, fileName: string) => void;
}

export function DatasetSwitcher({
  current,
  onChange,
  onFileLoad,
}: DatasetSwitcherProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onFileLoad(reader.result, file.name);
        setOpen(false);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-8 max-w-[220px] items-center gap-2 rounded border border-gray-200 bg-white px-2.5 text-gray-700 text-xs transition-colors hover:bg-gray-50"
        onClick={() => setOpen((value) => !value)}
        title={current.label}
        type="button"
      >
        <span className="text-gray-400">数据源</span>
        <span className="min-w-0 truncate font-medium">{current.label}</span>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open ? (
        <div
          className="absolute top-full right-0 z-50 mt-1 w-64 rounded border border-gray-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <div className="px-3 py-1.5 text-gray-400 text-xs">预置数据集</div>
          {DATA_FILES.map((file) => (
            <button
              className={`block w-full truncate px-3 py-1.5 text-left text-xs transition-colors ${
                current.name === file.name
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              key={file.name}
              onClick={() => {
                onChange(file);
                setOpen(false);
              }}
              title={file.label}
              type="button"
            >
              {file.label}
            </button>
          ))}
          <div className="my-1 border-gray-100 border-t" />
          <button
            className="block w-full px-3 py-1.5 text-left text-gray-600 text-xs transition-colors hover:bg-gray-50 hover:text-gray-900"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            打开文件...
          </button>
          <input
            ref={inputRef}
            accept=".ttl,.turtle"
            className="hidden"
            onChange={handleFileChange}
            type="file"
          />
        </div>
      ) : null}
    </div>
  );
}
