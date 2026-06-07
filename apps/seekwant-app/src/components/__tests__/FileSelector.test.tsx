import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DATA_FILES, FileSelector } from "../FileSelector";

describe("FileSelector", () => {
  it("renders all preset file buttons", () => {
    render(
      <FileSelector
        current="red-chamber"
        onChange={() => {}}
        onFileLoad={() => {}}
      />,
    );
    for (const file of DATA_FILES) {
      expect(
        screen.getByRole("button", { name: file.label }),
      ).toBeInTheDocument();
    }
  });

  it("renders open file button", () => {
    render(
      <FileSelector
        current="red-chamber"
        onChange={() => {}}
        onFileLoad={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "打开文件…" }),
    ).toBeInTheDocument();
  });

  it("calls onChange when preset button is clicked", async () => {
    const onChange = vi.fn();
    render(
      <FileSelector
        current="red-chamber"
        onChange={onChange}
        onFileLoad={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "中医辨证论治" }));
    expect(onChange).toHaveBeenCalledWith(DATA_FILES[1]);
  });

  it("highlights the current file button", () => {
    render(
      <FileSelector
        current="tcm-diagnosis"
        onChange={() => {}}
        onFileLoad={() => {}}
      />,
    );
    const btn = screen.getByRole("button", { name: "中医辨证论治" });
    expect(btn.className).toContain("bg-gray-800");
  });

  it("does not highlight non-current buttons", () => {
    render(
      <FileSelector
        current="tcm-diagnosis"
        onChange={() => {}}
        onFileLoad={() => {}}
      />,
    );
    const btn = screen.getByRole("button", { name: "红楼梦人物关系" });
    expect(btn.className).not.toContain("bg-gray-800");
  });

  it("has correct DATA_FILES entries", () => {
    expect(DATA_FILES).toHaveLength(6);
    expect(DATA_FILES.map((f) => f.name)).toEqual([
      "red-chamber",
      "tcm-diagnosis",
      "wwii-causal",
      "service-dependency",
      "book-entry-demo",
      "book-anatomy",
    ]);
  });
});
