import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LabelToggle } from "../LabelToggle";

describe("LabelToggle", () => {
  it("renders all three mode buttons", () => {
    render(<LabelToggle mode="headline" onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "标题名" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ID" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "两者" })).toBeInTheDocument();
  });

  it("highlights the current mode button", () => {
    render(<LabelToggle mode="addressLabel" onChange={() => {}} />);
    const btn = screen.getByRole("button", { name: "ID" });
    expect(btn.className).toContain("bg-gray-800");
  });

  it("calls onChange with correct mode", async () => {
    const onChange = vi.fn();
    render(<LabelToggle mode="headline" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "ID" }));
    expect(onChange).toHaveBeenCalledWith("addressLabel");
  });

  it("calls onChange for both mode", async () => {
    const onChange = vi.fn();
    render(<LabelToggle mode="headline" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "两者" }));
    expect(onChange).toHaveBeenCalledWith("both");
  });
});
