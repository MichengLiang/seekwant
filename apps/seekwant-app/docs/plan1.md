<Assistant id="1">
# ttl-graph-viz 适配新版 RDF12 TTL 与 Asciidoctor 书籍化左栏的设计判断

我已经把范围收敛在两个地方看了一轮：`micheng-ts/experiments/ttl-graph-viz` 作为前端消费端，`micheng-ts/projects/asciidoc-abundant-tree/samples/base.md` 作为新版解析器输出形状的说明样例。下面是我现在的判断、方案和注意事项。先说明：我还没有动代码。因为这次不是一个单点 bug，而是数据契约和左侧阅读界面的共同升级，直接动会容易把“能跑”做成“以后不好维护”。

## 1. 我看到的现状

`ttl-graph-viz` 现在是一个 Vite + React + Cytoscape 的实验项目。它的核心入口在 `src/pages/GraphPage.tsx`，数据解析在 `src/lib/ttl-parser.ts`，左侧文档面板在 `src/components/DocumentPanel.tsx`，AsciiDoc 片段渲染在 `src/lib/adoc-renderer.ts`。当前的工作流是：加载 `public/data/*.ttl`，用 `n3` 解析成 quads，然后从 RDF 里抽取 `aat:Heading`、`aat:containsDirectly`、`rel:*`、`aat:references` 等关系，最后同时喂给图谱和左侧文档栏。

左侧文档栏现在并不是一个真正的 Asciidoctor 书籍页面。它的做法是：从 RDF 的 `aat:raw` 拿每个 heading 的原始切片，递归拉平成 sections，然后每个 section 单独调用一次 `renderRawToHtml(section.raw)`。这个函数会先删掉 attribute list，再从标题行开始转成 HTML，并且会把 `xref:target[label, rel=..., weight=...]` 里的控制字段删掉，避免 Asciidoctor 把这些控制字段当普通链接文本渲染出来。最后 UI 用 `github-markdown.css` 给这些片段套 Markdown/GitHub 风格。也就是说，现在左栏是“自建的片段阅读器”，不是“官方 Asciidoctor 文档阅读器”。

我实际启动页面看了一眼，当前新版 `red-chamber.ttl` 是能被 N3 解析、页面也能显示的。测试命令 `pnpm --filter seekwant-app test` 通过了，结果是 9 个 test files、67 个 tests 全部通过。但 `typecheck` 当前失败，错误集中在一些测试文件里数组元素可能为 `undefined` 的 TypeScript 严格检查上，这看起来是既存测试代码质量问题，不是新版 TTL 直接造成的业务失败。实际页面控制台还有一个 `Cannot read properties of null (reading 'notify')`，这个更像 Cytoscape/布局更新期间的现有交互问题，后续如果我们改 UI，最好顺手确认但不一定把它纳入本轮主线。

## 2. 上游数据真正变了什么

你说“解析器更新了，上游数据源变了”，这个判断是对的，而且变化不止一个。

第一，`aat:raw` 的 Turtle 序列化从单行转义字符串变成了 Turtle long string literal。旧数据类似：

```ttl
aat:raw "== 标题\n\n正文\n";
```

新数据类似：

```ttl
aat:raw """== 标题

正文

""";
```

这在 RDF 图语义上还是 literal，`n3` 解析后 `q.object.value` 仍然是正常字符串，所以当前代码“碰巧能跑”。但测试里还全是旧式字符串，没有覆盖新版 long string 的输入样例。我们应该补测试，避免以后别人以为前端只支持旧样式。

第二，没有显式 ID 的标题现在会出现 `aat:generatedAddressLabel`。比如 `red-chamber.ttl` 里 `贾府概况` 没有 `aat:addressLabel`，但有 `aat:generatedAddressLabel "贾府概况"`。`base.md` 也展示了类似情况，比如 `_细分规则a`、`_细分规则a_a`、`_其他东西`。上游 README 也明确说 heading label space 由 `aat:addressLabel`、`aat:generatedAddressLabel`、`aat:headline` 构成。当前前端只把 `addressLabel` 作为节点字段，又额外把 `headline` 和 `_${headline}` 猜进去。这能覆盖一部分，但不是尊重新契约的写法。尤其是 `generatedAddressLabel` 可能带 Asciidoctor 官方生成 ID 的规范化结果，不应该靠前端自己猜。

第三，xref 边证据已经是 RDF 1.2 reifier 形状。新版数据里有 `aat:XrefEdge`，并且 `rdf:reifies <<(source predicate target)>>`，同时保留 `aat:sourceHeading`、`aat:targetHeading`、`aat:rel`、`aat:weight`、`aat:displayLabel`、`aat:officialHref` 等证据。当前 `ttl-parser.ts` 仍然主要靠 heading 节点上的 `rel:*` 直接三元组抽边，然后再扫描全部 `aat:rel` 找对应 XrefEdge 取权重。它在 `red-chamber.ttl` 上还能拿到关系，是因为上游同时输出了主 relation triple。但从设计上说，前端已经错过了“边证据对象”这一层，它不能稳定读取 display label、官方 resolved id、raw xref、source/target selector，也没有很好地支持未来只从 edge evidence 读边的可能。

第四，`aat:raw` 的契约已经明确：它是标题自身切片，不是整个子树。`asciidoc-abundant-tree` 文档里说，读取完整子树时，要先拿当前标题自身 `aat:raw`，再沿 `aat:containsDirectly` 递归读取后代并按文档顺序组合。现在 `DocumentPanel` 的 raw 模式是 `[documentRoot.raw, ...sections.map((s) => s.raw)].join("")`，渲染模式则是每个 section 分段转换。它对简单文档能显示，但它没有真正把“整本书”作为一个 AsciiDoc document 去转换。

## 3. 关于“换成 Asciidoc book 自带样式”的调查结论

官方确实有默认 HTML stylesheet，而且它不是纯装饰。Asciidoctor 文档说，生成 standalone HTML 时，默认 stylesheet 会被带进 HTML，提供开箱即用的排版；很多 AsciiDoc 特性需要 stylesheet 支持，比如内置 role、标题 anchor、表格边框、列表 marker，以及 `toc: left/right` 这种侧边目录布局。官方文档还明确说，左/右 TOC 位置需要 stylesheet 帮助才能像侧栏一样显示。

但这里有一个关键点：stylesheet 只会在 standalone HTML 里进入 `<head>`。如果像当前代码这样把字符串转成 HTML 片段，返回的只是 `<div class="sect1">...`，不会自动带 CSS。我本地用 Asciidoctor.js 验证过：`standalone: false` 时，有 TOC HTML 但没有 `<style>`；`standalone: true` 时，会得到完整 `<!DOCTYPE html><html><head>...<style>/*! Asciidoctor default stylesheet ...`。这和官方说明一致。

另外，`book` doctype 并不等于“另一个更像书的主题”。官方 doctype 文档说，默认 `article` 是基础结构；`book` 允许多个 level-0 section 作为 part，并支持 appendix、preface、bibliography、glossary、index、colophon 等书籍结构。换句话说，book 是文档结构语义，不是单独的视觉主题。真正让它“像官方书”的，是 Asciidoctor 默认 HTML stylesheet + 合理的 `toc`、`sectnums`、`showtitle`、doctype 和整篇文档转换方式。

参考资料：

- Asciidoctor Default Stylesheet: https://docs.asciidoctor.org/asciidoctor/latest/html-backend/default-stylesheet/
- Stylesheet Modes: https://docs.asciidoctor.org/asciidoctor/latest/html-backend/stylesheet-modes/
- Document Type / book doctype: https://docs.asciidoctor.org/asciidoc/latest/document/doctype/
- Book Parts: https://docs.asciidoctor.org/asciidoc/latest/sections/parts/
- Asciidoctor.js convert options: https://docs.asciidoctor.org/asciidoctor.js/latest/processor/convert-options/
- Convert strings / standalone output: https://docs.asciidoctor.org/asciidoctor/latest/api/convert-strings/

## 4. 我建议的主方案

我建议把本轮拆成两个相互配合但边界清晰的改造：

第一部分是“新版 RDF12 消费契约适配”。也就是让 `ttl-parser.ts` 正式理解新版 projection：标题 label 空间支持 `addressLabel`、`generatedAddressLabel`、`headline`；边优先从 `aat:XrefEdge` evidence 构造，关系谓词、source、target、weight、displayLabel、raw、officialHref 等证据都从 evidence 上读；如果 evidence 缺失，再回退到 heading 上的直接 `rel:*` / `aat:references` 三元组。这样做的好处是前端跟上上游模型，同时仍兼容旧 TTL 或简化 TTL。

第二部分是“左侧文档栏改为整篇 Asciidoctor document 渲染，并套官方默认样式”。我们不再对每个 section 单独 convert，而是从 `documentRoot` 按 `containsDirectly` 递归拼出完整 AsciiDoc 源文本，然后调用 Asciidoctor.js 一次，把它当完整 document 转换。这里有两种实现路线：

- 路线 A：`standalone: true`，拿完整 HTML，从里面提取 `<style>` 和 `<body>` 可用内容，注入到左侧容器。这最接近官方默认样式，但要小心 `<html>`、`<head>`、全局 body/html CSS 影响整个 React app。我们需要把样式包在 `.asciidoc-book-panel` 作用域里，或者把 iframe 作为隔离容器。
- 路线 B：把 Asciidoctor 默认 CSS 保存成项目内 CSS 文件，例如 `src/asciidoctor-default.css` 或 `src/asciidoc-book.css`，然后用 `standalone: false` 只渲染正文片段，在容器里套官方 stylesheet。这更适合 React app，不需要解析完整 HTML，也更容易控制不污染外层布局。缺点是要维护一份 CSS 或通过包内资源/生成脚本同步。
- 路线 C：使用 iframe 直接承载 `standalone: true` 的完整 HTML。这隔离最好，官方样式最完整，但 React 与 iframe 之间的点击、聚焦、滚动、高亮、xref 拦截都要走 postMessage 或 iframe DOM 操作，复杂度明显上升。

我的推荐是路线 B：项目内引入/生成 Asciidoctor 默认 stylesheet 的“受控副本”，左栏渲染完整 document body，不使用 iframe。理由是这个实验的核心仍然是图谱联动，不是静态站点预览器。我们要保留“点击文档标题聚焦图谱、点击图谱节点滚动文档、点击 xref 聚焦目标节点”的交互。iframe 会让这些联动变麻烦；而直接注入 standalone 全 HTML 又容易污染全局样式。路线 B 是工程上最稳的折中。

## 5. 左侧 UI 的具体设计

左栏可以继续保留可拖拽宽度、折叠按钮、源码/渲染切换，但渲染模式里的内容从 `markdown-body` 换成类似：

```tsx
<div className="asciidoc-book-panel" onClick={handleContentClick}>
  <div className="asciidoctor" dangerouslySetInnerHTML={{ __html: renderedBookHtml }} />
</div>
```

实际 class 命名可以再斟酌。重点是：不再叫 `markdown-body`，不再引 GitHub Markdown CSS 作为主要阅读样式。

文档 HTML 的生成应该下沉到 `src/lib/adoc-renderer.ts`，新增类似 `renderDocumentToHtml(documentRoot)` 或 `buildDocumentSource(documentRoot)` + `renderBookToHtml(source)` 的函数。这个函数负责：

1. 按文档顺序拼出完整源文档。这里不能简单使用当前 `flattenSections` 的 DFS 插入顺序，因为 `containsDirectly` 在 Turtle 里如果对象列表顺序被 parser/store 打散，可能不稳定。新版节点有 `startLine`、`headingLine`、`previousSibling` 等字段。至少应该在同级 children 上按 `startLine` 排序，避免目录顺序错乱。
2. 清洗 xref 控制字段。当前正则只处理 `rel|weight|delay`，新版还有 `payload`、以及普通属性如 `banana=true`。更稳妥的做法是只保留 xref 的 target 和 display label，把 `rel=...` 等 named control fields 从显示层删除。要注意 `xref:capacity-rule[]` 空 label 的情况，不能把它洗坏。
3. 设置 Asciidoctor 属性。建议默认使用 `doctype=article`，除非源文档明确有 `:doctype: book` 或我们给用户一个“书籍模式”开关。原因是当前 `red-chamber.ttl` 自己写的是 `:doctype: article`，强行改成 `book` 可能触发结构语义差异。视觉上我们可以使用官方 stylesheet + TOC，而不是强行把所有源都转成 book doctype。
4. 让 TOC 出现在左栏内部。当前整页已经有一个应用左栏，如果 Asciidoctor 的 `:toc: left` 也在这个窄栏里再做左侧固定目录，可能会形成“左栏里的左栏”，很拥挤。我的建议是：在这个 app 的左侧文档面板里使用 `:toc: macro` 或 `:toc: auto` 的嵌入式目录，或者在面板宽度足够时才启用 `toc=left`。如果用户明确想要“官方 book 的左侧目录”，可以把 DocumentPanel 默认宽度从 300 提高到 420-520，否则官方 TOC 的侧栏布局会挤坏正文。
5. 建立 HTML heading 到 graph node 的映射。整篇转换后，标题元素会有 `id`，比如显式 ID、generated ID、或 `_标题`。我们要通过 `addressToNodeId` 把点击的 `h1/h2/h3` 或其容器映射回 node id。这里必须纳入 `generatedAddressLabel`，否则没有显式 ID 的标题会失联。

高亮也要改。现在每个 section 外面包了一个 `data-node-id` 容器，整篇渲染后不会天然有这个容器。我建议渲染后用 DOM 查询 heading id，找到最近的 `.sect1/.sect2/.sect3` 容器，给它加 `data-node-id` 或 class。React 里可以在 `useEffect` 中基于 `documentRoot` 和 `addressToNodeId` 做一次 annotation。这样保留官方 HTML 结构，又能加图谱联动所需的少量 app 标记。

## 6. 数据模型的具体调整

`GraphNode` 现在只有 `addressLabel` 一个 label 字段。我建议改为：

```ts
interface GraphNode {
  id: string;
  headline: string;
  addressLabel: string;
  generatedAddressLabel: string;
  labels: string[];
  raw: string;
  metadata: Record<string, string>;
}
```

如果不想影响太大，也可以先只加 `generatedAddressLabel`，并让 `addressLabel` 的显示逻辑回退为 `addressLabel || generatedAddressLabel || headline`。但长期看 `labels` 更清晰，因为上游模型说的是 label space，不是单一 ID。

`GraphEdge` 也建议扩展：

```ts
interface GraphEdge {
  id: string;
  source: string;
  target: string;
  rel: string;
  weight: number;
  displayLabel?: string;
  raw?: string;
  evidenceId?: string;
  officialHref?: string;
}
```

构边策略应改成：优先遍历所有 `aat:XrefEdge`。对每个 edge evidence，读 `aat:sourceHeading`、`aat:targetHeading`、`aat:rel`、`aat:weight`。如果 `aat:rel` 缺失，关系名就是 `references`。如果 `aat:weight` 缺失，使用默认权重。这样比当前“先读主 relation triple，再倒查 XrefEdge”更贴近新版数据。然后再用 direct relation triples 补遗漏，避免旧数据断掉。

`addressToNodeId` 要登记这些键：

- `aat:addressLabel`
- `aat:generatedAddressLabel`
- `aat:headline`
- 当前 IRI fragment，如 `heading-l13-o0`
- Asciidoctor HTML 可能出现的 `#id` 形式和去掉 `#` 的形式

当前的 `_${headline}` 猜测可以保留作为兼容，但不要再把它当主机制。

## 7. 测试计划

我建议先写失败测试再实现，避免 UI 改完以后只是肉眼觉得可以。

解析器测试：

1. 加一个新版 RDF12 fixture，至少包含 long string `aat:raw """..."""`、`aat:generatedAddressLabel`、`aat:XrefEdge`、`rdf:reifies`、`aat:sourceHeading`、`aat:targetHeading`、`aat:weight`。
2. 断言 `parseTtl` 能读取 generated label，并把它加入 `addressToNodeId`。
3. 断言边从 `aat:XrefEdge` evidence 获得 weight、displayLabel、raw，而不是只靠 direct `rel:*`。
4. 断言旧式最小 TTL 仍然能解析，尤其是当前 mock 和测试里的旧格式不能断。

渲染器测试：

1. `buildDocumentSource` 能按 startLine 拼接 root + children + nested children。
2. xref 清洗能处理 `rel`、`weight`、`payload`、未知普通 named field、空 label、中文 display label。
3. `renderBookToHtml` 能输出 `#toc` 或 section HTML，并且不包含 `rel=depends-on` 这种控制字段。

组件测试：

1. `DocumentPanel` 渲染完整书籍 HTML，不再出现逐段独立 `.sect1` 包装导致的重复结构问题。
2. 点击渲染出来的 xref 链接能聚焦对应 node。
3. `focusedNodeId` 变化时能滚动到官方 HTML 中对应 section。
4. 源码模式仍然能显示完整原始文档。

端到端/视觉验证：

1. 用 Playwright 打开默认 `red-chamber.ttl`，确认没有页面错误。
2. 截图检查左栏是否应用 Asciidoctor 风格，而不是 GitHub Markdown 风格。
3. 在桌面宽度和较窄宽度下检查 TOC 不把正文挤坏。
4. 双击图谱节点后，左栏滚动到对应标题，详情面板仍然工作。

另外，根据这个仓库的约定，TS 项目改完要跑 biome 检查。如果 `ttl-graph-viz` 没有自己的 biome script，就需要在 `micheng-ts` 根部找可用命令；至少要跑 `pnpm --filter seekwant-app test`、`typecheck`、必要时 `e2e`。现有 `typecheck` 会失败，所以本轮如果要宣称通过，就要一起修掉测试里的 `possibly undefined`，否则只能明确说明“业务测试通过，typecheck 有既存失败”。我更建议顺手修掉，因为这类失败会影响后续构建信心。

## 8. 风险和边界

最大风险是“官方样式污染整个 app”。Asciidoctor 默认 CSS 里有很多全局 selector，例如 body、h1、h2、table、code、a 等。如果直接 import，全应用都会变样，包括顶部 toolbar、按钮、Cytoscape 容器和详情面板。所以必须作用域隔离。路线 B 也不是简单 `@import asciidoctor.css`，而是要么做 CSS scope 包裹，要么只把左栏内部需要的样式挑出来。考虑你说的是“换成官方自带样式”，我倾向于尽量保留完整默认 CSS，但用 `.asciidoc-book-panel` 控制影响范围。

第二个风险是 TOC 位置。官方 `:toc: left` 是面向整个 HTML 页面设计的，不是面向一个 300px app sidebar 设计的。我们现在已经有一个左侧 DocumentPanel，如果再在里面放官方左侧 TOC，会像套娃一样局促。这里我建议先使用官方 stylesheet 的正文排版和内嵌 TOC；如果你特别想要“书籍网页那种左侧目录 + 右侧正文”，那就应该把 DocumentPanel 设计成一个更宽的阅读区，甚至变成可切换的“阅读模式”，而不是硬塞在 300px 的辅助栏里。

第三个风险是 `book` doctype。当前红楼梦源文档声明的是 `:doctype: article`。如果我们强行覆盖成 `book`，可能得到结构警告或章节语义变化。官方文档也说 book 允许 level-0 parts，真正的 multi-part book 要按 parts 结构组织。因此我的建议是：默认尊重源文档 doctype；如果源文档没有 doctype，或者用户打开“book view”，再注入 `doctype=book`。视觉目标通过 stylesheet 达成，不把 doctype 当主题按钮。

第四个风险是 RDF 1.2 reifier 的 N3 支持。当前项目的 `n3` 已经能 parse 新版 `red-chamber.ttl`，这点实际验证过。但不同版本的 N3 对 RDF-star / RDF 1.2 triple term 表面语法支持可能有边界。前端解析器最好不要依赖直接读取 `rdf:reifies` 的 triple term 内容来构边，而是优先读同一个 `aat:XrefEdge` 上显式的 `sourceHeading`、`targetHeading`、`rel`。这样更稳。

第五个风险是当前数据源已经是未提交变更。`micheng-ts` 大仓库里 `public/data/*.ttl` 都是 modified，`asciidoc-abundant-tree` 是独立仓库。后续如果提交，要遵守你的同仓多人规则，用 `git commit --only -m "..." -- <paths>`，并且新增文件要先 `git add`。不要把别的实验、别的项目、或已经 staged 的内容混进来。

## 9. 我建议的实施顺序

如果你同意这个方向，我建议实施时按这个顺序：

1. 先给 `ttl-parser.ts` 加新版 RDF12 fixture 测试。测试覆盖 `generatedAddressLabel`、long string raw、xref evidence 边权重。
2. 修改 parser 的数据模型和构边逻辑，保持旧测试通过。
3. 给文档源拼接和整书渲染写测试。这里先不碰 UI，只把纯函数做稳。
4. 改 `DocumentPanel`：从分段渲染切到整篇 HTML，去掉 `markdown-body` 依赖，保留源码切换、折叠、拖拽。
5. 引入/隔离 Asciidoctor 默认 stylesheet。先保证不污染 toolbar 和图谱，再微调左栏宽度、内边距、字体尺寸。
6. 修复当前 typecheck 测试错误。这个不是主功能，但会影响验收。
7. 跑单元测试、typecheck、biome、Playwright 页面检查和截图。
8. 如果需要提交，只提交本项目相关路径，数据文件是否一起提交再按你的意图决定。

## 10. 我的推荐结论

我不建议只做“让当前 parser 不报错”的小补丁，因为现在其实已经能显示；真正的问题是前端仍在用旧契约理解新版 RDF12 数据。也不建议直接把 Asciidoctor standalone HTML 整个塞进 React，因为 CSS 和 DOM 会污染应用。最稳的方案是：解析层正式适配新版 RDF12 evidence/label space；渲染层改为整篇 Asciidoctor document 渲染；样式层引入官方默认 stylesheet 的受控、作用域版本；交互层用 DOM annotation 保留图谱与文档联动。

这样做完之后，`ttl-graph-viz` 会从“把 TTL 里的 raw 片段拼凑显示”升级成“消费 asciidoc-abundant-tree RDF12 投影并提供官方风格文档阅读 + 图谱联动”的实验。它仍然是轻量实验，不会变成完整静态站点生成器，也不会反过来复制 `asciidoc-abundant-tree` 的职责。

我现在需要你确认一个关键产品取向：左侧文档栏要不要仍然保持现在这种“窄辅助栏”定位？如果要，我会采用官方 stylesheet + 内嵌 TOC/正文排版的方案；如果你想要的是官方 book 页面那种真正的左侧目录 + 右侧正文阅读体验，那我会把它设计成一个更宽的阅读模式，而不是继续把它塞在 300px 左栏里。
</Assistant>

<User id="1">
好的,那你要做一些事情,首先是对既有问题的修复,这是要做的。我们这手上的东西要干净,修干净之后你再增加新的功能或变化。

然后呢,我们呢,就是实验项目,东西更新了,我们直接改掉,没有任何东西需要我们的兼容,直接删掉,没什么好兼容的,没有人等着你兼容,没有任何的消费者,你所谓的兼容呢,就是垃圾,知道吗?

\\wsl.localhost\Ubuntu\home\t103o\workbench\micheng-ts\projects\asciidoc-abundant-tree\tmp\closed-loop-demo 你自己要看一下这个例子啊,这里是一本书籍的例子,因为我之前给你看的《红楼梦》它依然是单篇文章,那么我不管是一篇文章还是说一本书,我都希望,什么意思呢?用官方的这个构建器对它完整的渲染,然后呢,就是官方默认的HTML的样式。 你会发现官方还会对它进行解析啊,会宏展开的,不仅仅只是套个样式这么简单。

我们的TTL 它里面提供的也只是展开前的,它并不会展开。所以说,我们要通过TDL重建原始文件,然后呢丢给官方解析器,构建完整的HTML,然后我们拿到它按需的,你自己看,进行一个裁剪或者是怎么样,是吧,因为我们依然要有这个点击跳转,展示图谱,展示节点的能力,是不是?

现在东西你自己再研究一下吧,然后呢,再来和我聊聊,不少于四千个字或者更多。


</User>

<Assistant id="2">
# ttl-graph-viz 重新研究后的实施方案

我按你刚才补充的约束重新看了一遍，重点看了三个东西：`ttl-graph-viz` 当前代码和既有质量问题、`red-chamber.ttl` 这种单篇文章数据、以及 `asciidoc-abundant-tree/tmp/closed-loop-demo` 这种 book-entry/include 书籍数据。结论先说在前面：这次不能做成“兼容旧 TTL 的小补丁”，也不能做成“继续用 heading raw 分段渲染，只是换个 CSS”。正确方向是把这个实验项目的消费契约直接切到新版 RDF12 投影：从 TTL 重建原始 AsciiDoc 文件集合，把它交给 Asciidoctor.js 的官方解析/转换流程，让 include/xref/目录/table/listing 等宏和块都由官方处理，然后前端只在官方 HTML 上做必要的裁剪、隔离、联动标记。

我也接受你对“兼容”的批评。这个项目是实验项目，不存在外部消费者，也没有必要为旧格式留一堆 fallback 分支。后续我会把“兼容旧 TTL”从设计里拿掉。唯一需要区分的不是旧/新，而是新版 RDF12 里天然存在的两种输入形态：单文件投影和 book-entry 投影。单文件可能只有 heading 的 `aat:raw`；book-entry 会有 `aat:SourceFile`，每个源文件带完整 `aat:raw` 和 `aat:relativePath`。这不是兼容旧世界，而是同一个新版数据模型下的两个官方使用场景。

## 1. 先修干净：当前项目已经有脏问题

我先跑了现有验证。`pnpm --filter seekwant-app test` 是通过的，9 个 test files、67 个 tests 全部绿。但 `pnpm --filter seekwant-app typecheck` 失败，失败点集中在测试代码里数组下标访问后 TypeScript 认为可能是 `undefined`。例如 `DocumentPanel.test.ts`、`TtlGraph.test.ts`、`ttl-parser.test.ts` 都有类似 `nodes[0].data...`、`contains[0]...` 的问题。这个不是什么高级问题，就是测试写法不干净。既然你说手上的东西要干净，那这必须先修。

E2E 我也跑了：`pnpm --filter seekwant-app e2e` 结果 10 个 Playwright 测试全通过。但日志里刷了大量 Cytoscape 未处理错误，包括 `Cannot read properties of null (reading 'notify')` 和 `Cannot read properties of null (reading 'isHeadless')`。这类错误没有让测试失败，是因为测试没有监听 `pageerror` 并 fail；但它们已经说明当前图谱生命周期有问题。结合代码看，`TtlGraph.tsx` 在 effect cleanup 里直接 `cy.destroy()`，但 layout animation、resize animation 或鼠标事件仍可能在 destroy 后访问 renderer/core。测试并行、页面快速切换、鼠标模拟时更容易触发。这个也要放进“先修干净”。不然我们后面改左栏和渲染流程，页面生命周期更复杂，错误会更难定位。

所以第一阶段我会先做三件事：修 typecheck；修 Cytoscape destroy/animation 生命周期；强化 E2E 让 pageerror 真正失败。只有这三件过了，才进入新版数据契约和官方渲染改造。

具体修法上，typecheck 会用明确断言或 helper 解决，比如 `expect(nodes[0]).toBeDefined()` 后用局部变量，或者写 `const first = nodes[0]; expect(first).toBeDefined(); if (!first) throw ...`，避免 `!` 到处乱撒。Cytoscape 这边要做的是在销毁前停止 layout 和 animation、移除事件监听、检查 `cy.destroyed()`，并且延迟动画回调里重新确认实例仍然是当前实例。比如 `requestAnimationFrame` 里的 `cy.resize()` 前要确认 `cyRef.current === cy` 且 `!cy.destroyed()`。鼠标事件和 fit/focus 动画同理。E2E 里增加 pageerror 捕获后，这个修复才算有效。

## 2. 新版 TTL 真实契约：不要再拿旧模型解释它

`red-chamber.ttl` 现在明显变了。`aat:raw` 已经是 Turtle long string literal，不再是旧的 `\n` 转义字符串。N3 解析后表面值一样，但测试应该写新版文本，不应该继续拿旧字符串做样例。更关键的是，heading label space 已经变成 `aat:addressLabel`、`aat:generatedAddressLabel`、`aat:headline` 三者共同构成。`red-chamber.ttl` 里 `贾府概况` 就有 `aat:generatedAddressLabel "贾府概况"`。`base.md` 里也展示了 `_细分规则a`、`_细分规则a_a`、`_其他东西` 这样的 generated label。当前 `ttl-parser.ts` 只把 `addressLabel` 当一等字段，再自己猜 `_${headline}`，这不是新版契约。

边也一样。新版 RDF12 里有 `aat:XrefEdge`，它是边证据。它保留 `aat:sourceHeading`、`aat:targetHeading`、`aat:rel`、`aat:weight`、`aat:displayLabel`、`aat:officialHref`、`aat:officialResolvedId`、`aat:raw` 等信息，并且用 `rdf:reifies <<(source predicate target)>>` 连接到主 relation triple。当前前端还是从 heading 上的 `rel:*` 和 `aat:references` 抽主边，然后倒查 `aat:rel` 找 weight。这个方向应该反过来：图谱边应以 `aat:XrefEdge` 为事实来源。因为图谱展示的不只是“两个 heading 有一条关系”，还要展示这条关系来自哪一个 xref、它的权重是多少、它在源文档哪里、官方解析到哪个 target。

我会把 `GraphEdge` 的来源切成 XrefEdge evidence。没有 `aat:XrefEdge` 的旧式三元组不再作为兼容路径保留。这样会直接迫使 public data 和测试数据都站在新版上。对于 `containsDirectly`，它不是 xref edge，而是结构边，仍然单独从 heading containment 读，继续受“包含关系”开关控制。

`GraphNode` 也要升级。现在只有 `addressLabel: string` 不够。建议字段变成：

```ts
interface GraphNode {
  id: string;
  headline: string;
  addressLabel: string | null;
  generatedAddressLabel: string | null;
  labels: string[];
  raw: string;
  relativePath: string | null;
  startLine: number;
  endLine: number;
  metadata: Record<string, string>;
}
```

`labels` 不是为了炫技，而是直接对应新版 projection 的 label space。图谱 ID 模式可以显示 `addressLabel ?? generatedAddressLabel ?? headline`，详情面板显示显式 ID 和 generated ID 时也应该区分：显式 ID 是作者写的，generated ID 是官方解析生成的。这个差异对调试 xref 很有价值。

## 3. closed-loop-demo 带来的关键修正：必须重建 SourceFile，不是拼 heading raw

我看了 `tmp/closed-loop-demo`。它有真实 `book.adoc`：

```adoc
= Book Entry Demo
Micheng Liang
:doctype: book
:toc:

include::chapters/01-overview.adoc[]

include::chapters/02-operations.adoc[]
```

还有两个 chapter 文件。`graph-current.ttl` 里除了 headings 和 XrefEdges，还出现了 `aat:SourceFile`：

- `source-file-book.adoc` 有 `aat:relativePath "book.adoc"` 和完整 `aat:raw`，里面保留 include 宏。
- `source-file-chapters%2F01-overview.adoc` 有 `aat:relativePath "chapters/01-overview.adoc"` 和完整 chapter raw。
- `source-file-chapters%2F02-operations.adoc` 同理。
- `aat:AsciiDocSourceDocument` 指向这些 source files，并且自身 `aat:relativePath "book.adoc"`。

这说明新版 TTL 已经给了我们重建原始文件集合的材料。更重要的是，`graph-current.ttl` 里的某些 heading `aat:raw` 是空字符串。比如 `Overview`、`Operations`、`QA Checklist` 的 heading raw 在这个 sample 里就是 `"""\n"""` 或很少内容。也就是说，如果继续靠 heading raw 拼正文，在 book-entry 场景下根本不可靠；正确输入是 `aat:SourceFile`，不是 heading slice。

这也解释了你说的“TTL 里面提供的只是展开前的，它并不会展开”。是的，`book.adoc` 里仍然是 `include::chapters/01-overview.adoc[]`，没有在 TTL 中预展开。我们不应该自己用字符串替换 include，也不应该写一个半吊子的 AsciiDoc 展开器。正确做法是把 `aat:SourceFile` 重建成一个虚拟文件系统，然后注册 Asciidoctor.js 的 include processor，让官方解析器在遇到 `include::...[]` 时调用我们的虚拟文件系统读取目标文件，再由官方解析器继续完整解析。

官方 Asciidoctor.js 文档有 include processor extension。核心例子是 `registry.includeProcessor`，`handles(target)` 判断目标，`process(doc, reader, target, attrs)` 里用 `reader.pushInclude(content, target, target, 1, attrs)` 把内容推回解析流程。这个正好适合我们的场景：SourceFile map 就是虚拟文件系统，entry file 是 `book.adoc`，include target 是相对路径。我们只需要实现路径归一化：从当前 include 所在文件的目录解析 target，例如 `book.adoc` include `chapters/01-overview.adoc`，或者 chapter 里 include `../assets/foo.adoc`。路径统一用 `/`，拒绝跳出 SourceFile map 的 target。

参考：

- Asciidoctor.js Register Extensions: https://docs.asciidoctor.org/asciidoctor.js/latest/extend/extensions/register/
- Asciidoctor.js Include Processor Example: https://docs.asciidoctor.org/asciidoctor.js/latest/extend/extensions/include-processor/
- Asciidoctor default stylesheet: https://docs.asciidoctor.org/asciidoctor/latest/html-backend/default-stylesheet/
- Asciidoctor stylesheet modes: https://docs.asciidoctor.org/asciidoctor/latest/html-backend/stylesheet-modes/
- AsciiDoc document doctype: https://docs.asciidoctor.org/asciidoc/latest/document/doctype/

## 4. 单文件文章与书籍的统一策略

这里要分清楚：我不是要兼容旧数据，而是要支持新版投影的两个合法源形态。

如果 TTL 里存在 `aat:SourceFile`，那就以 `aat:AsciiDocSourceDocument aat:relativePath` 指定的 entry file 为入口，把所有 SourceFile 的 `relativePath -> raw` 建成虚拟文件系统，然后用 include processor 交给 Asciidoctor.js。`closed-loop-demo` 就走这条路径。

如果 TTL 里没有 `aat:SourceFile`，但有 heading raw，那说明这是单文件投影，像当前 `red-chamber.ttl`。这个场景我们仍然要重建一个完整 AsciiDoc 源字符串，但它不是旧兼容，而是新版单文件 projection 当前给出的材料。重建方式应该是按 source coordinate 拼：先拿 document root 的 `aat:raw`，再拿全部 heading 的 `aat:raw`，按 `relativePath`、`startLine`、`headingLine` 排序。这里要避免沿 `aat:containsDirectly` 的对象顺序，因为 RDF Store 不保证对象列表顺序能表达文档顺序。`startLine` 才是源顺序的依据。

单文件重建后，我们可以把它放进一个虚拟文件系统，比如 entry path 叫 `document.adoc` 或读取 `aat:AsciiDocSourceDocument aat:relativePath`，然后一样交给 Asciidoctor.js。这样文章和书籍最终进入同一个渲染函数：`renderOfficialHtml(sourceDocument)`。

从这个角度看，前端新增的数据模型应该包含：

```ts
interface SourceFile {
  relativePath: string;
  raw: string;
}

interface SourceDocument {
  entryPath: string;
  files: SourceFile[];
}
```

`parseTtl` 的职责不是直接给 `DocumentPanel` 一堆 section raw，而是给出 graph nodes/edges、documentRoot、addressToNodeId、sourceDocument。左栏渲染只消费 `sourceDocument` 和 node label map。

## 5. 官方完整渲染的实现方式

我们应该调用 Asciidoctor.js 做完整转换，而不是逐段转换。渲染入口大概是：

```ts
const html = processor.convert(entryRaw, {
  safe: "safe",
  standalone: true,
  base_dir: entryDir,
  extension_registry: createVirtualIncludeRegistry(sourceFiles),
  attributes: {
    showtitle: "",
  },
});
```

几个点要注意。

第一，`standalone: true` 更接近官方完整 HTML，因为它会生成 `<html><head>...<style>/*! Asciidoctor default stylesheet ...` 和 body 内容。`standalone: false` 只能拿正文片段，不会带默认 stylesheet。你要的是官方默认 HTML 风格，所以我们应该从 standalone 输出里取官方 style 和 body，而不是自己找第三方 CSS 套上。

第二，不能把完整 standalone HTML 直接塞进 React DOM。里面有 `html`、`head`、`body`、全局 CSS，会污染整个 app。要裁剪：用 `DOMParser` 解析 standalone HTML，取出 `<style>` 内容和 `<body>` 内容。style 要么注入到左栏容器附近，要么生成 scoped stylesheet。直接把 style 原样放页面上会影响全局，因为 Asciidoctor 默认 CSS 有很多 `body`、`h1`、`h2`、`table`、`a` 选择器。我的建议是做 scoped CSS：把官方 CSS 包到 `.asciidoc-render-scope` 下，同时处理 `body`、`html` 这类 selector，使它们落在容器上，而不是全局 document。

第三，include processor 要在每次 convert 时按当前 SourceFile map 创建 extension registry。不要全局注册，因为不同 TTL 文件有不同虚拟文件系统。官方文档也支持 per conversion 传 `extension_registry`。

第四，xref 控制字段不要靠正则提前删掉整篇源。现在 `xref:target[Label, rel=depends-on, weight=0.8]` 这些字段在 AsciiDoc 里会被当作 xref text/attributes 的一部分。上游投影把这些字段用作语义提取，但最终渲染阅读时不应该显示 `rel=...`、`weight=...`。这一步可以有两种做法：

1. 在送给 Asciidoctor 前做源级清洗，把 xref 宏中的 control fields 删除，只保留 target 和 display label。
2. 写一个 inline macro processor 拦截 xref，保留官方 link 行为但过滤显示文本。

我倾向先做源级清洗，因为它更小、更可测试，且这个实验不需要完整重写 xref processor。但清洗不能像现在那样只写一个窄正则，只认识 `rel|weight|delay`。新版里还有 `payload`，也可能有任意业务属性，比如 `banana=true`。要按 xref 宏的 bracket 内容做轻量解析：第一个非 `key=value` 字段是 display label；后面的 named fields 全部从显示层移除。`xref:capacity-rule[]` 要保留为空 label，让 Asciidoctor 使用官方 reftext。`xref:delivery-policy[rel=implementation]` 这种没有显式 display label 但有控制字段的，要变成 `xref:delivery-policy[]`，让官方解析 reftext。

第五，资源路径要考虑。官方 HTML 可能生成图片、链接、stylesheet 内字体引用。当前 demo 没有真实图片，但未来 SourceFile 可能有 `image::assets/foo.png[]`。TTL 只给了 SourceFile raw，不一定带二进制资源。这个实验可以先把文档内资源路径按 entryPath 相对路径保留；如果资源在 `public` 下可访问，就让浏览器加载；如果不可访问，显示 broken image 不作为本轮阻塞。不要在本轮引入二进制资源打包机制。

## 6. 左栏交互如何保留

你要求保留点击跳转、展示图谱、展示节点能力，这个必须设计进去。

官方 HTML 渲染后，heading 会有 id，例如 `demo-overview`、`demo-qa-checklist`，generated heading 也会有官方生成 id。我们已经从 TTL 有 label space，所以可以建立 `htmlId -> nodeId` 的 map。具体做法：

- 对每个 GraphNode，登记 `addressLabel`、`generatedAddressLabel`、`headline`、IRI fragment。
- 同时登记带 `#` 和不带 `#` 的形式，供 link click 解析。
- 渲染后，在 `DocumentPanel` 的容器里扫描 `h1,h2,h3,h4,h5,h6`。
- 对每个 heading，读 `id`，用 map 找 nodeId；找到后给 heading 或最近的 section wrapper 加 `data-node-id`。
- 点击 heading 或 section 时触发 `onHeadingClick(nodeId)`。
- 点击 `<a href="#...">` 时阻止默认跳转，转为 graph focus；如果找不到 nodeId，则允许浏览器在文档内部正常跳。

滚动聚焦也要改。现在代码查 `[data-node-id="focusedNodeId"]`，因为每个 section 外面是 React 自己包的 div。官方 HTML 没这个 wrapper，所以 annotation 后继续查 data 属性即可。高亮则不要破坏官方样式，可以加一个薄的 outline 或背景到 section wrapper 上，比如 `.asciidoc-focused-section`。这属于应用交互层，不是替代官方样式。

详情面板继续显示节点信息和 raw，但 raw 应该优先来自 heading raw；如果 book-entry heading raw 为空，就显示源文件位置、source path、startLine/endLine，并提供“该节点来自源文件片段”的结构信息。后续如果需要，可以从 SourceFile raw 按行号截取原始片段作为详情源码；这比依赖 heading raw 更稳。这个可以纳入本轮，因为 `closed-loop-demo` 的 heading raw 为空，不处理的话详情面板会很尴尬。

## 7. UI 形态：不是窄小目录树，而是官方文档阅读区

当前左栏默认 300px，之前的 GitHub Markdown 片段阅读器勉强能放进去。但官方 Asciidoctor HTML，尤其是 book + toc/table/listing，在 300px 里会非常局促。既然目标是“看起来像一本书”，我建议把文档面板的默认定位从“窄辅助栏”调整成“可折叠、可拖拽的阅读栏”。默认宽度可以提高到 480 或 520，最小宽度 360，最大宽度可以到视口的 70%。这样 book 的 TOC、表格和 listing 才有基本空间。

`closed-loop-demo` 的 `:toc:` 是普通目录，不是 `:toc: left`；`red-chamber.ttl` 源里有 `:toc: left`。官方 `toc: left` 是为整页 HTML 做的，会在 standalone 页面里把 TOC 放到左侧。如果我们在 app 的左文档栏里再启用官方 left TOC，可能出现“应用左栏里又有一个左侧 TOC”的拥挤布局。我的建议不是篡改源文档属性，而是在裁剪后的容器里让官方 CSS自然工作，然后根据实际截图调整容器宽度。如果 `toc: left` 在 520px 面板里仍然不舒服，再考虑在渲染前加一个“面板渲染覆盖属性”，把 `toc=left` 转成普通 `toc`。但这个覆盖会改变源文档意图，我不会第一步就做。

换句话说，我会先尊重源文档：article 就按 article；book 就按 book；`:toc:` / `:toc: left` 由源自己决定。我们只是提供足够宽度和样式隔离，让官方 HTML 能落地。只有当官方 left TOC 在嵌入面板里明显不可用时，再局部处理。

顶部应用 toolbar 仍然保留，图谱仍在中间，详情面板仍在右侧。左栏折叠/展开继续存在。源码/渲染切换继续存在，但“渲染”不再是片段渲染，而是官方完整 HTML；“源码”显示 entry file 或所有 SourceFile，可以做成文件选择 tabs。第一版可以先显示 entry file raw，并在 book-entry 场景下显示一个简洁的 SourceFile 列表，避免一次性把所有文件直接拼成一坨。

## 8. 文件和模块拆分

为了不把 `ttl-parser.ts` 和 `DocumentPanel.tsx` 继续变大，我建议拆分：

- `src/lib/rdf12-parser.ts` 或继续 `ttl-parser.ts` 但内部拆 helper：只负责 RDF12 graph -> app model。
- `src/lib/source-document.ts`：从 RDF triples 构建 `SourceDocument`，包括 SourceFile map、entry path、single-file reconstruction。
- `src/lib/asciidoc-official-renderer.ts`：封装 Asciidoctor.js convert、include processor、standalone HTML 裁剪、xref display 清洗。
- `src/lib/asciidoc-html-index.ts`：根据 GraphNode labels 给官方 HTML DOM 做 annotation，或者提供 label map helper。
- `src/components/DocumentPanel.tsx`：只管布局、滚动、点击、源码/渲染切换。

`github-markdown.css` 应该从渲染路径移除。如果没有别的地方用，就删除文件和 import。`adoc-renderer.ts` 当前的分段渲染函数也应该删除或改名重写，不保留旧片段 API。

测试 fixture 建议直接新增一个 `closed-loop-demo` 风格的最小 TTL，不一定把 7KB 完整文件塞测试里，但必须包含 `aat:SourceFile`、entry `book.adoc`、两个 included chapter、一个 xref edge。另一个 fixture 用 `red-chamber` 风格单文件：没有 SourceFile，但有 long string raw、generatedAddressLabel、XrefEdge。这样两条新版路径都被测到。

## 9. 验收标准

第一阶段清理完成的验收：

- `pnpm --filter seekwant-app typecheck` 通过。
- `pnpm --filter seekwant-app test` 通过。
- `pnpm --filter seekwant-app e2e` 通过，并且 Playwright 捕获 pageerror 后没有 Cytoscape 未处理异常。
- `pnpm lint` 或至少 `pnpm biome check experiments/ttl-graph-viz` 通过；具体命令以 monorepo 当前可用脚本为准。

第二阶段新版 RDF12 契约完成的验收：

- `parseTtl` 不再依赖旧式手写 minimal TTL。
- 节点能读取 `addressLabel` 和 `generatedAddressLabel`。
- xref 关系边来自 `aat:XrefEdge`，能读取 `sourceHeading`、`targetHeading`、`rel`、`weight`、`displayLabel`、`raw`。
- `containsDirectly` 结构边继续由开关控制。
- `red-chamber.ttl` 里的 `贾府概况` 能通过 generated label 被点击、聚焦、链接解析。

第三阶段官方渲染完成的验收：

- 单文件文章通过重建 source document 后由 Asciidoctor.js 完整转换，不再逐 section convert。
- book-entry TTL 通过 `aat:SourceFile` 虚拟文件系统和 include processor 渲染，`include::chapters/...[]` 由官方流程展开。
- 官方 default stylesheet 被应用到文档阅读区域，但不污染 toolbar、图谱、详情面板。
- xref 控制字段不出现在阅读文本中，但链接仍能跳转/聚焦图谱节点。
- table、listing、TOC 在 `closed-loop-demo` 里按官方 HTML 样式显示。
- focused node 能滚动到对应官方 HTML section，并有轻量高亮。

第四阶段视觉验收：

- Playwright 截图检查桌面宽度下左栏不是 GitHub Markdown 风，而是 Asciidoctor default HTML 风格。
- 520px 左栏下 book demo 的 TOC、表格、listing 不重叠、不溢出到图谱上。
- 折叠左栏后图谱 resize 不报错。
- 打开详情面板后图谱 resize 不报错。

## 10. 我准备采用的执行顺序

我建议按四个 commit/批次做，避免把清理、数据契约、渲染重构混成一个大泥球。

第一批：清理既有质量问题。修 TypeScript 测试 undefined；修 Cytoscape 生命周期；让 E2E 捕获 pageerror。这个批次不改功能。

第二批：切换 RDF12 数据模型。改 parser 的 node/edge/sourceDocument 输出；删旧 parser 假设；测试改成新版 TTL fixture；public data 可以加入 book-entry demo TTL 作为新 preset。这里不碰左栏官方渲染，只确保 graph model 干净。

第三批：实现官方完整渲染。新增 SourceFile virtual include processor、standalone HTML 裁剪、scoped default stylesheet、xref display 清洗；DocumentPanel 改为整篇官方 HTML；删除 GitHub Markdown 渲染路径。

第四批：交互和视觉收口。给官方 HTML 做 heading annotation、xref click、focused scroll；调整左栏宽度和源码视图；跑 Playwright 截图；修样式污染和重叠。

提交时遵守你的同仓多人规则：只提交本实验项目相关路径，新增文件先 `git add`，提交用 `git commit --only -m "..." -- <paths>`，不混入 `micheng-ts/projects/asciidoc-abundant-tree` 的独立仓库内容。`closed-loop-demo` 只作为研究来源；如果要把它作为前端 preset，我会复制生成后的 TTL 到 `experiments/ttl-graph-viz/public/data/`，不引用 `projects/.../tmp` 路径。

## 11. 我现在的明确设计选择

我会废掉当前“分段渲染 section raw + GitHub Markdown CSS”的路径。它和目标冲突，尤其在 book-entry sample 里 heading raw 为空，继续维护没有意义。

我会让 TTL parser 直接面向新版 RDF12：SourceFile、XrefEdge、generatedAddressLabel、long string raw、source coordinates。旧 minimal TTL 测试会被替换，不做旧格式兼容。

我会用 Asciidoctor.js include processor，而不是自己展开 include。这样宏展开、目录、表格、listing、xref reftext 都尽量交给官方实现。前端只负责把 TTL 重建成官方 parser 能读的虚拟文件集合。

我会从 standalone HTML 里裁剪官方 style/body，并做样式作用域隔离。不会把完整 standalone document 直接塞进 React，也不会全局 import 默认 stylesheet 污染应用。

我会先尊重源文档 doctype 和 toc 属性。`red-chamber` 仍按 article；`closed-loop-demo` 按 book。视觉上的“像书”来自官方完整 HTML 和默认 stylesheet，而不是强行把所有文档覆盖成 book doctype。

我会把左栏从 300px 小片段栏调整成更像阅读栏的宽度，但保留可折叠和可拖拽。图谱联动、详情面板、节点聚焦继续保留。

如果你认可这版方向，我下一步就开始第一批：先清理 typecheck 和 Cytoscape 生命周期，把项目状态修干净；然后再进入 RDF12 和官方渲染改造。
</Assistant>

<User id="2">
好的，开始吧，你的这份 “ttl-graph-viz 重新研究后的实施方案” 我已经看完了，你需要完整兑现 ttl-graph-viz 重新研究后的实施方案 里的承诺，而不是顺手糊，我后续会按照 ttl-graph-viz 重新研究后的实施方案 里的每一条检查你是否诚实兑现

</User>

