import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";

vi.mock("./components/TtlGraph", () => ({
  TtlGraph: () => (
    <div aria-label="图谱画布" role="img">
      <button type="button">适配视图</button>
    </div>
  ),
}));

describe("TTL 知识图谱 app", () => {
  it("renders the graph page with workbench title and status bars", async () => {
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "TTL 知识图谱" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("workbench-title-bar")).toBeInTheDocument();
    expect(screen.getByTestId("workbench-status-bar")).toBeInTheDocument();
  });

  it("keeps preset datasets inside the dataset selector", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });

    expect(screen.getByRole("button", { name: /数据源/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "中医辨证论治" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /数据源/ }));

    expect(
      screen.getByRole("button", { name: "红楼梦人物关系" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "中医辨证论治" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "二战因果链" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "微服务依赖" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Book Entry" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Book Anatomy" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "打开文件..." }),
    ).toBeInTheDocument();
  });

  it("moves graph view settings into the settings drawer", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });

    expect(screen.queryByText("节点标签")).not.toBeInTheDocument();
    expect(screen.queryByText("边标签")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "打开设置" }));

    expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();
    expect(screen.getByText("图谱显示")).toBeInTheDocument();
    expect(screen.getByText("图例与分组")).toBeInTheDocument();
    expect(screen.getByText("文档阅读")).toBeInTheDocument();
    expect(screen.getByText("详情面板")).toBeInTheDocument();
    expect(screen.getByText("工作台")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "标题名" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ID" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "两者" })).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "显示结构边" }),
    ).not.toBeChecked();
  });

  it("shows status bar with instructions", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });
    expect(
      screen.getByText(
        "点击文档标题聚焦图谱 · 双击节点查看详情 · 点击空白重置",
      ),
    ).toBeInTheDocument();
  });

  // Note: Cytoscape canvas tests require a real browser (Playwright e2e).
  // happy-dom cannot create a 2d canvas context.

  it("settings drawer structure edge checkbox can be checked and unchecked", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });
    await user.click(screen.getByRole("button", { name: "打开设置" }));

    const checkbox = screen.getByRole("checkbox", { name: "显示结构边" });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
