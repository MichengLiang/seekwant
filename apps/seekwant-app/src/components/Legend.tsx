import { useMemo } from "react";
import type { GraphData } from "../lib/ttl-parser";

interface LegendProps {
  data: GraphData;
}

const PALETTE = [
  "#5b8db8",
  "#e07b53",
  "#7daf6c",
  "#c06090",
  "#8b7ec8",
  "#d4a84b",
  "#5caea8",
  "#b8805a",
  "#7b9bb5",
  "#a8a8a8",
];

export function Legend({ data }: LegendProps) {
  const entries = useMemo(() => {
    const groups = new Map<string, number>();
    for (const node of data.nodes) {
      const group =
        node.metadata.faction ??
        node.metadata["syndrome-type"] ??
        node.metadata.type ??
        "";
      if (group) {
        groups.set(group, (groups.get(group) ?? 0) + 1);
      }
    }
    return [...groups.entries()].map(([name, count], i) => ({
      name,
      count,
      color: PALETTE[i % PALETTE.length] ?? "#a8a8a8",
    }));
  }, [data.nodes]);

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {entries.map((e) => (
        <div key={e.name} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: e.color, opacity: 0.85 }}
          />
          <span className="text-gray-600 text-xs">
            {e.name}
            <span className="ml-0.5 text-gray-400">({e.count})</span>
          </span>
        </div>
      ))}
    </div>
  );
}
