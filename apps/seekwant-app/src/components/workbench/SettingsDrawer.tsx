import { X } from "lucide-react";
import type { LabelMode } from "../../lib/ttl-parser";
import { LabelToggle } from "../LabelToggle";
import { SettingsSection } from "./SettingsSection";

interface SettingsDrawerProps {
  open: boolean;
  labelMode: LabelMode;
  predicateChinese: boolean;
  showContains: boolean;
  onClose: () => void;
  onLabelModeChange: (mode: LabelMode) => void;
  onPredicateChineseChange: (value: boolean) => void;
  onShowContainsChange: (value: boolean) => void;
}

export function SettingsDrawer({
  open,
  labelMode,
  predicateChinese,
  showContains,
  onClose,
  onLabelModeChange,
  onPredicateChineseChange,
  onShowContainsChange,
}: SettingsDrawerProps) {
  if (!open) return null;

  return (
    <aside
      aria-label="设置"
      className="absolute top-0 right-0 bottom-0 z-40 flex w-[380px] max-w-[calc(100vw-48px)] flex-col border-gray-200 border-l bg-white shadow-xl"
    >
      <div className="flex h-12 flex-shrink-0 items-center justify-between border-gray-100 border-b px-4">
        <h2 className="font-semibold text-gray-800 text-sm">设置</h2>
        <button
          aria-label="关闭设置"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
      <div className="border-gray-100 border-b px-4 py-3">
        <input
          className="h-8 w-full rounded border border-gray-200 bg-gray-50 px-2 text-gray-500 text-xs outline-none transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
          placeholder="搜索设置"
          type="search"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <SettingsSection title="图谱显示">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-gray-500 text-xs">节点标签</div>
              <LabelToggle mode={labelMode} onChange={onLabelModeChange} />
            </div>
            <div>
              <div className="mb-1.5 text-gray-500 text-xs">边标签语言</div>
              <div className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
                <button
                  aria-pressed={!predicateChinese}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    !predicateChinese
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                  onClick={() => onPredicateChineseChange(false)}
                  type="button"
                >
                  原文
                </button>
                <button
                  aria-pressed={predicateChinese}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    predicateChinese
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                  onClick={() => onPredicateChineseChange(true)}
                  type="button"
                >
                  中文
                </button>
              </div>
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-xs">
              <input
                aria-label="显示结构边"
                checked={showContains}
                className="mt-0.5 rounded border-gray-300"
                onChange={(event) => onShowContainsChange(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block text-gray-700">显示结构边</span>
                <span className="mt-0.5 block text-gray-400">
                  结构边表示文档层级，开启后关系数量会增加。
                </span>
              </span>
            </label>
          </div>
        </SettingsSection>
        <SettingsSection title="图例与分组">
          <p className="text-gray-400 text-xs">
            分组来自 faction、syndrome-type、type 的首个可用字段。
          </p>
        </SettingsSection>
        <SettingsSection title="文档阅读">
          <p className="text-gray-400 text-xs">
            渲染/源码即时切换位于文档面板顶部。
          </p>
        </SettingsSection>
        <SettingsSection title="详情面板">
          <p className="text-gray-400 text-xs">
            节点片段/所在文件切换位于详情面板源码区。
          </p>
        </SettingsSection>
        <SettingsSection title="工作台">
          <p className="text-gray-400 text-xs">
            数据源入口位于标题栏，视图入口位于左侧活动栏，状态信息位于底栏。
          </p>
        </SettingsSection>
      </div>
    </aside>
  );
}
