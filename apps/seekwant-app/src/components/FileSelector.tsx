import { useRef } from "react";

export interface DataFile {
  name: string;
  path: string;
  label: string;
}

export const DATA_FILES: DataFile[] = [
  {
    name: "red-chamber",
    path: "/data/red-chamber.ttl",
    label: "红楼梦人物关系",
  },
  {
    name: "tcm-diagnosis",
    path: "/data/tcm-diagnosis.ttl",
    label: "中医辨证论治",
  },
  { name: "wwii-causal", path: "/data/wwii-causal.ttl", label: "二战因果链" },
  {
    name: "service-dependency",
    path: "/data/service-dependency.ttl",
    label: "微服务依赖",
  },
  {
    name: "book-entry-demo",
    path: "/data/book-entry-demo.ttl",
    label: "Book Entry",
  },
  {
    name: "book-anatomy",
    path: "/data/book-anatomy.ttl",
    label: "Book Anatomy",
  },
];

interface FileSelectorProps {
  current: string;
  onChange: (file: DataFile) => void;
  onFileLoad: (text: string, fileName: string) => void;
}

export function FileSelector({
  current,
  onChange,
  onFileLoad,
}: FileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onFileLoad(reader.result, file.name);
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
      {DATA_FILES.map((file) => (
        <button
          key={file.name}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            current === file.name
              ? "bg-gray-800 text-white"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          }`}
          onClick={() => onChange(file)}
          type="button"
        >
          {file.label}
        </button>
      ))}
      <div className="h-4 w-px bg-gray-200" />
      <button
        className="rounded-md px-3 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        打开文件…
      </button>
      <input
        ref={inputRef}
        accept=".ttl,.turtle"
        className="hidden"
        onChange={handleFileChange}
        type="file"
      />
    </div>
  );
}
