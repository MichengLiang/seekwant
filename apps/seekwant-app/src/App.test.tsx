import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("TTL 知识图谱 app", () => {
  it("renders the graph page with header", async () => {
    render(<App />);
    expect(
      await screen.findByRole("heading", { name: "TTL 知识图谱" }),
    ).toBeInTheDocument();
  });

  it("shows preset file selector buttons", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });
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
  });

  it("shows label toggle controls", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });
    expect(screen.getByRole("button", { name: "标题名" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ID" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "两者" })).toBeInTheDocument();
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

  it("shows contains toggle checkbox", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    expect(screen.getByText("包含关系")).toBeInTheDocument();
  });

  it("contains toggle can be checked and unchecked", async () => {
    render(<App />);
    await screen.findByRole("heading", { name: "TTL 知识图谱" });
    const checkbox = screen.getByRole("checkbox");
    await checkbox.click();
    expect(checkbox).toBeChecked();
    await checkbox.click();
    expect(checkbox).not.toBeChecked();
  });
});
