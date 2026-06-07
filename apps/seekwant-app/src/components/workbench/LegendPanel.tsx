import type { GraphData } from "../../lib/ttl-parser";
import { Legend } from "../Legend";

interface LegendPanelProps {
  data: GraphData;
}

export function LegendPanel({ data }: LegendPanelProps) {
  return (
    <aside className="w-72 flex-shrink-0 border-gray-200 border-r bg-white">
      <div className="border-gray-100 border-b px-4 py-2.5">
        <h2 className="font-semibold text-gray-800 text-sm">图例</h2>
        <p className="mt-1 text-gray-400 text-xs">当前图谱分组和节点数量。</p>
      </div>
      <div className="p-4">
        <Legend data={data} />
      </div>
    </aside>
  );
}
