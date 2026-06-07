import { describe, expect, it } from "vitest";
import { getPredicateLabel, PREDICATE_ZH } from "../predicate-i18n";

describe("PREDICATE_ZH", () => {
  it("contains all expected predicates", () => {
    expect(PREDICATE_ZH.loves).toBe("深爱");
    expect(PREDICATE_ZH["married-to"]).toBe("结为夫妻");
    expect(PREDICATE_ZH["depends-on"]).toBe("依赖");
    expect(PREDICATE_ZH.references).toBe("引用");
    expect(PREDICATE_ZH.containsDirectly).toBe("包含");
  });
});

describe("getPredicateLabel", () => {
  it("returns original rel when useChinese is false", () => {
    expect(getPredicateLabel("depends-on", false)).toBe("depends-on");
    expect(getPredicateLabel("references", false)).toBe("references");
  });

  it("returns Chinese label when useChinese is true", () => {
    expect(getPredicateLabel("depends-on", true)).toBe("依赖");
    expect(getPredicateLabel("loves", true)).toBe("深爱");
    expect(getPredicateLabel("references", true)).toBe("引用");
    expect(getPredicateLabel("containsDirectly", true)).toBe("包含");
  });

  it("falls back to original rel when no Chinese translation exists", () => {
    expect(getPredicateLabel("unknown-rel", true)).toBe("unknown-rel");
  });

  it("returns original rel for empty string", () => {
    expect(getPredicateLabel("", false)).toBe("");
    expect(getPredicateLabel("", true)).toBe("");
  });
});
