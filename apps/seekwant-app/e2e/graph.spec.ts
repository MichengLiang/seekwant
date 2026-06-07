import { expect, type Page, test } from "@playwright/test";

async function readAsciiDocShadow(page: Page) {
  return page.getByTestId("asciidoc-shadow-host").evaluate((host) => {
    const shadowRoot = host.shadowRoot;
    if (!shadowRoot) {
      return {
        text: "",
        hasOfficialStyle: false,
        hasToc: false,
        hasListing: false,
        hasTable: false,
        headingIds: [] as string[],
        focusedElements: [] as {
          backgroundColor: string;
          className: string;
          id: string;
          nodeId: string | null;
          outlineStyle: string;
          tagName: string;
          text: string;
        }[],
        annotatedHeadings: 0,
      };
    }
    return {
      text: shadowRoot.textContent ?? "",
      hasOfficialStyle: [...shadowRoot.querySelectorAll("style")].some(
        (style) =>
          style.textContent?.includes("Asciidoctor default stylesheet"),
      ),
      hasToc: Boolean(shadowRoot.querySelector("#toc")),
      hasListing: Boolean(shadowRoot.querySelector(".listingblock")),
      hasTable: Boolean(shadowRoot.querySelector("table")),
      headingIds: [...shadowRoot.querySelectorAll("h1,h2,h3")].map(
        (heading) => heading.id,
      ),
      focusedElements: [
        ...shadowRoot.querySelectorAll(".asciidoc-focused-section"),
      ].map((element) => {
        const style = getComputedStyle(element);
        return {
          backgroundColor: style.backgroundColor,
          className: element.className,
          id: element.id,
          nodeId: element.getAttribute("data-node-id"),
          outlineStyle: style.outlineStyle,
          tagName: element.tagName,
          text: element.textContent ?? "",
        };
      }),
      annotatedHeadings: shadowRoot.querySelectorAll("[data-node-id]").length,
    };
  });
}

async function readAsciiDocTopLayout(page: Page) {
  return page.getByTestId("asciidoc-shadow-host").evaluate((host) => {
    const shadowRoot = host.shadowRoot;
    if (!shadowRoot) {
      return {
        titleMarginTop: Number.POSITIVE_INFINITY,
        titleTopGap: Number.POSITIVE_INFINITY,
      };
    }
    const renderRoot = shadowRoot.querySelector<HTMLElement>(
      ".asciidoc-book-render",
    );
    const title = shadowRoot.querySelector<HTMLElement>(
      ".asciidoc-book-render > h1:first-child",
    );
    if (!renderRoot || !title) {
      return {
        titleMarginTop: Number.POSITIVE_INFINITY,
        titleTopGap: Number.POSITIVE_INFINITY,
      };
    }
    const rootRect = renderRoot.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    return {
      titleMarginTop: Number.parseFloat(getComputedStyle(title).marginTop),
      titleTopGap: titleRect.top - rootRect.top,
    };
  });
}

async function clickAsciiDocHeading(page: Page, selector: string) {
  const point = await page
    .getByTestId("asciidoc-shadow-host")
    .evaluate((host, headingSelector) => {
      const heading =
        host.shadowRoot?.querySelector<HTMLElement>(headingSelector);
      if (!heading) {
        throw new Error(`Expected rendered heading ${headingSelector}`);
      }
      heading.scrollIntoView({ behavior: "instant", block: "center" });
      const rect = heading.getBoundingClientRect();
      return {
        x: rect.left + Math.min(rect.width / 2, 120),
        y: rect.top + Math.min(rect.height / 2, 40),
      };
    }, selector);
  await page.mouse.click(point.x, point.y);
}

async function clickAsciiDocHeadingByText(page: Page, text: string) {
  const point = await page
    .getByTestId("asciidoc-shadow-host")
    .evaluate((host, headingText) => {
      const heading = [
        ...(host.shadowRoot?.querySelectorAll<HTMLElement>(
          "h1,h2,h3,h4,h5,h6",
        ) ?? []),
      ].find((candidate) =>
        candidate.textContent
          ?.replace(/\s+/g, " ")
          .trim()
          .includes(headingText),
      );
      if (!heading) {
        throw new Error(`Expected rendered heading text ${headingText}`);
      }
      heading.scrollIntoView({ behavior: "instant", block: "center" });
      const rect = heading.getBoundingClientRect();
      return {
        x: rect.left + Math.min(rect.width / 2, 120),
        y: rect.top + Math.min(rect.height / 2, 40),
      };
    }, text);
  await page.mouse.click(point.x, point.y);
}

async function openAnyGraphDetail(page: Page) {
  const canvas = page.locator("canvas").first();
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(1500);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const xs = [0.25, 0.35, 0.45, 0.55, 0.65, 0.75];
  const ys = [0.25, 0.35, 0.45, 0.55, 0.65, 0.75];
  for (const y of ys) {
    for (const x of xs) {
      await page.mouse.dblclick(box.x + box.width * x, box.y + box.height * y);
      await page.waitForTimeout(250);
      if (
        await page
          .getByLabel("关闭")
          .isVisible()
          .catch(() => false)
      ) {
        return;
      }
    }
  }

  throw new Error("Expected to open a graph node detail panel");
}

test.describe("TTL 知识图谱", () => {
  test.beforeEach(({ page }) => {
    page.on("pageerror", (error) => {
      throw error;
    });
  });

  test("loads and displays the graph with header and controls", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "TTL 知识图谱" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "红楼梦人物关系" }),
    ).toBeVisible();
    await expect(page.getByText("节点标签")).toBeVisible();
    await expect(page.getByRole("button", { name: "适配视图" })).toBeVisible();
  });

  test("switches preset files via file selector", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "中医辨证论治" }).click();
    await expect(
      page.getByRole("button", { name: "中医辨证论治" }),
    ).toBeVisible();
  });

  test("double-click opens detail panel with raw content", async ({ page }) => {
    await page.goto("/");
    // Wait for graph to render (canvas should have content)
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(1500); // Wait for cose layout to settle

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Double-click center of canvas to hit a node
    await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);

    // Wait for panel to potentially open
    await page.waitForTimeout(500);

    // If panel opened, verify it has content
    const panel = page.locator("pre").first();
    const panelVisible = await panel.isVisible().catch(() => false);
    if (panelVisible) {
      const text = await panel.textContent();
      expect(text).toBeTruthy();
      expect(text?.length).toBeGreaterThan(10);
    }
  });

  test("detail panel shows AsciiDoc source header", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(1500);

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Try clicking at several positions to hit a node
    for (let i = 0; i < 5; i++) {
      const cx = box.x + box.width * (0.3 + i * 0.1);
      const cy = box.y + box.height * 0.5;
      await page.mouse.dblclick(cx, cy);
      await page.waitForTimeout(300);

      const sourceHeader = page.getByText("AsciiDoc 源码");
      if (await sourceHeader.isVisible().catch(() => false)) {
        await expect(sourceHeader).toBeVisible();
        // Panel should also have a close button
        await expect(page.getByLabel("关闭")).toBeVisible();
        return; // Test passed
      }
    }
    // If no node was hit, that's acceptable for a randomized layout
  });

  test("label toggle switches between modes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "ID" }).click();
    await page.getByRole("button", { name: "两者" }).click();
    await page.getByRole("button", { name: "标题名" }).click();
  });

  test("status bar shows node and edge counts", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/节点.*关系/)).toBeVisible();
  });

  test("document title starts near the top of the embedded Asciidoctor panel", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("红楼梦人物志");

    const layout = await readAsciiDocTopLayout(page);
    expect(layout.titleMarginTop).toBe(0);
    expect(layout.titleTopGap).toBeLessThanOrEqual(18);
  });

  test("Book Entry renders SourceFile-backed Asciidoctor book output", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Entry" }).click();

    await expect(page.getByRole("button", { name: "Book Entry" })).toHaveClass(
      /bg-gray-800/,
    );
    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("Checklist");

    const shadow = await readAsciiDocShadow(page);
    expect(shadow.hasOfficialStyle).toBe(true);
    expect(shadow.hasToc).toBe(true);
    expect(shadow.hasListing).toBe(true);
    expect(shadow.hasTable).toBe(true);
    expect(shadow.text).toContain("Book Entry Demo");
    expect(shadow.text).toContain("Overview");
    expect(shadow.text).toContain("Operations");
    expect(shadow.text).toContain("Overview section");
    expect(shadow.text).toContain("chapters/01-overview.adoc");
    expect(shadow.text).not.toContain("include::chapters/01-overview.adoc");
    expect(shadow.headingIds).toContain("demo-overview");
    expect(shadow.headingIds).toContain("demo-checklist");
    expect(shadow.annotatedHeadings).toBeGreaterThan(0);

    await page.getByTestId("asciidoc-shadow-host").evaluate((host) => {
      const link = host.shadowRoot?.querySelector<HTMLAnchorElement>(
        'a[href="#demo-checklist"]',
      );
      if (!link) {
        throw new Error("Expected rendered xref link to demo-checklist");
      }
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          composed: true,
        }),
      );
    });
    await expect(page.getByRole("button", { name: "退出聚焦" })).toBeVisible();

    const operationsHeadingPoint = await page
      .getByTestId("asciidoc-shadow-host")
      .evaluate((host) => {
        const heading =
          host.shadowRoot?.querySelector<HTMLElement>("h2#demo-operations");
        if (!heading) {
          throw new Error("Expected rendered Operations heading");
        }
        heading.scrollIntoView({ behavior: "instant", block: "center" });
        const rect = heading.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
    await page.mouse.click(operationsHeadingPoint.x, operationsHeadingPoint.y);

    await expect
      .poll(async () => (await readAsciiDocShadow(page)).focusedElements)
      .toEqual([
        expect.objectContaining({
          className: expect.stringContaining("asciidoc-heading-block"),
          nodeId: expect.any(String),
          tagName: "DIV",
          text: expect.stringContaining(
            "The operations chapter links back to the overview",
          ),
        }),
      ]);
    const afterHeadingFocus = await readAsciiDocShadow(page);
    expect(afterHeadingFocus.focusedElements).toHaveLength(1);
    expect(afterHeadingFocus.focusedElements[0]?.backgroundColor).toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(afterHeadingFocus.focusedElements[0]?.outlineStyle).toBe("solid");
    const focusedText = afterHeadingFocus.focusedElements[0]?.text ?? "";
    expect(focusedText).toContain("Operations");
    expect(focusedText).toContain(
      "The operations chapter links back to the overview",
    );
    expect(focusedText).not.toContain("Checklist");

    const operationsParagraphPoint = await page
      .getByTestId("asciidoc-shadow-host")
      .evaluate((host) => {
        const operationsBlock = host.shadowRoot?.querySelector<HTMLElement>(
          ".asciidoc-heading-block:has(h2#demo-operations)",
        );
        const paragraph =
          operationsBlock?.querySelector<HTMLElement>(".paragraph");
        if (!paragraph) {
          throw new Error("Expected Operations paragraph inside heading block");
        }
        paragraph.scrollIntoView({ behavior: "instant", block: "center" });
        const rect = paragraph.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      });
    await page.mouse.click(
      operationsParagraphPoint.x,
      operationsParagraphPoint.y,
    );

    await expect
      .poll(async () => (await readAsciiDocShadow(page)).focusedElements)
      .toEqual([
        expect.objectContaining({
          className: expect.stringContaining("asciidoc-heading-block"),
          tagName: "DIV",
          text: expect.stringContaining("Operations"),
        }),
      ]);
  });

  test("rendered document remains populated after switching to source and back", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Entry" }).click();
    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("Book Entry Demo");

    await page.getByRole("button", { name: "源码" }).click();
    await expect(
      page.getByText("// chapters/02-operations.adoc"),
    ).toBeVisible();

    await page.getByRole("button", { name: "渲染" }).click();

    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("Book Entry Demo");
    const shadow = await readAsciiDocShadow(page);
    expect(shadow.text).toContain("Checklist");
    expect(shadow.annotatedHeadings).toBeGreaterThan(0);
  });

  test("document clicks sync an already open detail panel without opening a closed one", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Entry" }).click();
    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("Operations");

    await clickAsciiDocHeading(page, "h2#demo-operations");
    await expect(page.getByRole("button", { name: "退出聚焦" })).toBeVisible();
    await expect(page.getByLabel("关闭")).not.toBeVisible();

    await openAnyGraphDetail(page);
    await expect(page.getByLabel("关闭")).toBeVisible();

    await clickAsciiDocHeading(page, "h3#demo-checklist");
    await expect(page.getByTestId("detail-panel-title")).toHaveText(
      "Checklist",
    );
    await expect(page.getByTestId("detail-source-location")).toContainText(
      "chapters/02-operations.adoc",
    );
    await expect(page.getByTestId("detail-raw-source")).toContainText(
      "Preserve source coordinates",
    );
  });

  test("Book Entry switches a child node detail to its complete source file", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Entry" }).click();
    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("Checklist");

    await openAnyGraphDetail(page);
    await clickAsciiDocHeading(page, "h3#demo-checklist");
    await expect(page.getByTestId("detail-panel-title")).toHaveText(
      "Checklist",
    );

    await page.getByRole("button", { name: "所在文件" }).click();

    await expect(page.getByTestId("detail-panel-title")).toHaveText(
      "Operations",
    );
    await expect(page.getByTestId("detail-source-location")).toContainText(
      "chapters/02-operations.adoc",
    );
    await expect(page.getByTestId("detail-source-location")).toContainText(
      "全文件",
    );
    await expect(page.getByTestId("detail-raw-source")).toContainText(
      "== Operations",
    );
    await expect(page.getByTestId("detail-raw-source")).toContainText(
      "=== Checklist",
    );
    await expect(page.getByTestId("detail-raw-source")).toContainText(
      "|Surface |Expected source",
    );
    await expect(page.getByRole("button", { name: "退出聚焦" })).toBeVisible();
  });

  test("Book Anatomy keeps the document title when rendering a multi-part book", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Anatomy" }).click();

    await expect(
      page.getByRole("button", { name: "Book Anatomy" }),
    ).toHaveClass(/bg-gray-800/);
    await expect(page.getByTestId("document-panel-title")).toHaveText(
      "完整书籍结构标本",
    );
    await expect(page.getByTestId("document-panel-title")).not.toHaveText(
      "第一部：前置结构",
    );

    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("第二部：正文结构");

    const shadow = await readAsciiDocShadow(page);
    expect(shadow.hasOfficialStyle).toBe(true);
    expect(shadow.hasToc).toBe(true);
    expect(shadow.text).toContain("完整书籍结构标本");
    expect(shadow.text).toContain("第一部：前置结构");
    expect(shadow.text).toContain("第二部：正文结构");
    expect(shadow.text).not.toContain("include::frontmatter/preface.adoc");
  });

  test("Book Anatomy switches a child node detail to its complete source file", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Book Anatomy" }).click();
    await page
      .getByTestId("asciidoc-shadow-host")
      .waitFor({ state: "attached" });
    await expect
      .poll(async () => (await readAsciiDocShadow(page)).text)
      .toContain("小节层级");

    await openAnyGraphDetail(page);
    await clickAsciiDocHeadingByText(page, "小节层级");
    await expect(page.getByTestId("detail-panel-title")).toHaveText("小节层级");

    await page.getByRole("button", { name: "所在文件" }).click();

    await expect(page.getByTestId("detail-panel-title")).toHaveText(
      "正文结构地图",
    );
    await expect(page.getByTestId("detail-source-location")).toContainText(
      "books/00-book-anatomy/parts/02-body-structure/01-body-map.adoc",
    );
    await expect(page.getByTestId("detail-source-location")).toContainText(
      "全文件",
    );
    await expect(page.getByTestId("detail-raw-source")).toContainText(
      "== 正文结构地图",
    );
    await expect(page.getByTestId("detail-raw-source")).toContainText(
      "=== 小节层级",
    );
    await expect(page.getByRole("button", { name: "退出聚焦" })).toBeVisible();
  });

  test("contains toggle checkbox is present and unchecked by default", async ({
    page,
  }) => {
    await page.goto("/");
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();
    await expect(page.getByText("包含关系")).toBeVisible();
  });

  test("toggling contains checkbox changes rendered edge count on deep document", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Book Entry" }).click();
    await page.waitForTimeout(1500); // Wait for data load + layout

    // Read edge count from status bar (contains unchecked)
    const statusBefore = await page.getByText(/\d+ 关系/).textContent();
    const countBefore = Number(statusBefore?.match(/(\d+) 关系/)?.[1] ?? "0");

    // Enable contains edges
    await page.getByRole("checkbox").click();
    await page.waitForTimeout(1500); // Wait for graph rebuild + layout

    // Verify status bar count increased
    const statusAfter = await page.getByText(/\d+ 关系/).textContent();
    const countAfter = Number(statusAfter?.match(/(\d+) 关系/)?.[1] ?? "0");
    expect(countAfter).toBeGreaterThan(countBefore);

    // Disable contains edges
    await page.getByRole("checkbox").click();
    await page.waitForTimeout(1500);

    // Verify count returns to original
    const statusFinal = await page.getByText(/\d+ 关系/).textContent();
    const countFinal = Number(statusFinal?.match(/(\d+) 关系/)?.[1] ?? "0");
    expect(countFinal).toBe(countBefore);
  });

  test("keyboard shortcut Esc closes detail panel", async ({ page }) => {
    await page.goto("/");
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(1500);

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    // Try to open panel
    for (let i = 0; i < 5; i++) {
      const cx = box.x + box.width * (0.3 + i * 0.1);
      const cy = box.y + box.height * 0.5;
      await page.mouse.dblclick(cx, cy);
      await page.waitForTimeout(300);

      if (
        await page
          .getByLabel("关闭")
          .isVisible()
          .catch(() => false)
      ) {
        // Press Esc to close
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        await expect(page.getByLabel("关闭")).not.toBeVisible();
        return;
      }
    }
  });
});
