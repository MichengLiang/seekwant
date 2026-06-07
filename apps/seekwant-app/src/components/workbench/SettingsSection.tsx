import type { ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  children?: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <section className="border-gray-100 border-b px-4 py-3">
      <h3 className="mb-2 font-semibold text-gray-700 text-xs">{title}</h3>
      {children ?? (
        <p className="text-gray-400 text-xs">
          此分组由对应工作台区域的局部控制承担。
        </p>
      )}
    </section>
  );
}
