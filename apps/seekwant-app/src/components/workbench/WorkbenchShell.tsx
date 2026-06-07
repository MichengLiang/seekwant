import type { ReactNode } from "react";

interface WorkbenchShellProps {
  titleBar: ReactNode;
  children: ReactNode;
  statusBar: ReactNode;
}

export function WorkbenchShell({
  titleBar,
  children,
  statusBar,
}: WorkbenchShellProps) {
  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ background: "#f5f3ef" }}
    >
      {titleBar}
      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {children}
      </main>
      {statusBar}
    </div>
  );
}
