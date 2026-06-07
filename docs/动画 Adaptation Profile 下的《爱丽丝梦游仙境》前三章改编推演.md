# 动画 Adaptation Profile 下的《爱丽丝梦游仙境》前三章改编推演

我现在按你已经确定的前提来走：当前工具默认服务动画改编。`AdaptationProfile = AnimationScript / AnimatedDrama`。真人影视、广播剧、舞台剧、漫画、互动叙事这些剖面只保留在全集概念里，不在今天展开定制。今天完整定义和推演动画这一条链。

这里不再把 YAML 当中心。中心是一本结构化 AsciiDoc 改编书稿。书稿是人类和执行者共同阅读、编辑、审查的表面；`asciidoc-abundant-tree` 已经能把它投影成 RDF/Turtle/JSON-LD；ARQ 能查；业务本体和 SHACL 是我们要定义的业务层；YAML 只是最后从图里导出的甲方要求格式。

这次推演的目标不是“写一个漂亮大纲”，而是模拟一个执行者收到任务以后，如何把《Alice's Adventures in Wonderland》前三章按动画剖面加工成完整可审查初稿。这里的“完整”是相对于动画剖面：它要有源材料、角色、地点、道具、世界规则、视觉风格、动画动作、镜头/分镜、对白、声音、改编选择、来源关系、审查入口、导出结构。它不需要真人拍摄场地、动物驯养、实景棚拍、演员通告，因为这些不属于动画剖面的必要消费对象。

---

## 一、目录树：这本书稿会长什么样

我会把这个项目组织成一本 AsciiDoc book。不是零散 prompt，不是一个 YAML 文件，不是一个脚本输出目录，而是一本可读、可查、可投影的改编工作书。

```text
alice-animation-adaptation/
├── book.adoc
├── frontmatter/
│   ├── 010-project-brief.adoc
│   ├── 020-adaptation-profile.adoc
│   ├── 030-role-vocabulary.adoc
│   ├── 040-relation-vocabulary.adoc
│   └── 050-quality-control.adoc
├── parts/
│   ├── 100-source-material/
│   │   ├── 010-chapter-01-down-the-rabbit-hole.adoc
│   │   ├── 020-chapter-02-pool-of-tears.adoc
│   │   └── 030-chapter-03-caucus-race.adoc
│   ├── 200-story-bible/
│   │   ├── 010-characters.adoc
│   │   ├── 020-locations.adoc
│   │   ├── 030-props-and-visual-objects.adoc
│   │   ├── 040-world-rules.adoc
│   │   └── 050-visual-motifs.adoc
│   ├── 300-adaptation-control/
│   │   ├── 010-animation-style-guide.adoc
│   │   ├── 020-visualisation-policy.adoc
│   │   ├── 030-dialogue-and-narration-policy.adoc
│   │   └── 040-completion-criteria.adoc
│   ├── 400-narrative-structure/
│   │   ├── 010-logline-and-synopsis.adoc
│   │   ├── 020-source-event-map.adoc
│   │   ├── 030-beat-sheet.adoc
│   │   └── 040-scene-cards.adoc
│   ├── 500-animation-script-draft/
│   │   ├── 010-sequence-01-riverbank-and-rabbit.adoc
│   │   ├── 020-sequence-02-rabbit-hole-and-hall.adoc
│   │   ├── 030-sequence-03-tears-and-animals.adoc
│   │   └── 040-sequence-04-caucus-race-and-mouse-tale.adoc
│   ├── 600-storyboard-and-production-notes/
│   │   ├── 010-shot-list.adoc
│   │   ├── 020-character-animation-notes.adoc
│   │   ├── 030-environment-assets.adoc
│   │   └── 040-sound-and-music-notes.adoc
│   └── 700-review-and-export/
│       ├── 010-review-notes.adoc
│       ├── 020-validation-queries.adoc
│       ├── 030-yaml-export-mapping.adoc
│       └── 040-export-preview.adoc
├── ontology/
│   ├── animation-profile.ttl
│   ├── adaptation-core.ttl
│   └── skos-vocabulary.ttl
├── shapes/
│   ├── source-trace.shacl.ttl
│   ├── animation-script.shacl.ttl
│   └── export.shacl.ttl
├── queries/
│   ├── scenes-by-source.rq
│   ├── shots-by-character.rq
│   ├── unresolved-inferences.rq
│   ├── visual-assets.rq
│   └── review-open-items.rq
└── exports/
    └── alice-animation-draft.yaml
```

这个树里有两类文件。

第一类是人写、人读的书稿：`frontmatter/` 和 `parts/`。执行者也读这些文件，因为模型和人一样需要交接资料。

第二类是机器消费的业务基础设施：`ontology/`、`shapes/`、`queries/`、`exports/`。这些不是重新做 `asciidoc-abundant-tree` 的底层投影，而是在已有 TTL 投影之上定义业务语义、业务校验和业务查询。

`book.adoc` 会把这些书稿 include 起来：

```asciidoc
= Alice Animation Adaptation Draft
:doctype: book
:toc: left
:sectnums:
:partnums:
:idprefix:
:idseparator: -

include::frontmatter/010-project-brief.adoc[]
include::frontmatter/020-adaptation-profile.adoc[]
include::frontmatter/030-role-vocabulary.adoc[]
include::frontmatter/040-relation-vocabulary.adoc[]
include::frontmatter/050-quality-control.adoc[]

= Source Material
include::parts/100-source-material/010-chapter-01-down-the-rabbit-hole.adoc[]
include::parts/100-source-material/020-chapter-02-pool-of-tears.adoc[]
include::parts/100-source-material/030-chapter-03-caucus-race.adoc[]

= Story Bible
include::parts/200-story-bible/010-characters.adoc[]
include::parts/200-story-bible/020-locations.adoc[]
include::parts/200-story-bible/030-props-and-visual-objects.adoc[]
include::parts/200-story-bible/040-world-rules.adoc[]
include::parts/200-story-bible/050-visual-motifs.adoc[]

= Adaptation Control
include::parts/300-adaptation-control/010-animation-style-guide.adoc[]
include::parts/300-adaptation-control/020-visualisation-policy.adoc[]
include::parts/300-adaptation-control/030-dialogue-and-narration-policy.adoc[]
include::parts/300-adaptation-control/040-completion-criteria.adoc[]

= Narrative Structure
include::parts/400-narrative-structure/010-logline-and-synopsis.adoc[]
include::parts/400-narrative-structure/020-source-event-map.adoc[]
include::parts/400-narrative-structure/030-beat-sheet.adoc[]
include::parts/400-narrative-structure/040-scene-cards.adoc[]

= Animation Script Draft
include::parts/500-animation-script-draft/010-sequence-01-riverbank-and-rabbit.adoc[]
include::parts/500-animation-script-draft/020-sequence-02-rabbit-hole-and-hall.adoc[]
include::parts/500-animation-script-draft/030-sequence-03-tears-and-animals.adoc[]
include::parts/500-animation-script-draft/040-sequence-04-caucus-race-and-mouse-tale.adoc[]

= Storyboard And Production Notes
include::parts/600-storyboard-and-production-notes/010-shot-list.adoc[]
include::parts/600-storyboard-and-production-notes/020-character-animation-notes.adoc[]
include::parts/600-storyboard-and-production-notes/030-environment-assets.adoc[]
include::parts/600-storyboard-and-production-notes/040-sound-and-music-notes.adoc[]

= Review And Export
include::parts/700-review-and-export/010-review-notes.adoc[]
include::parts/700-review-and-export/020-validation-queries.adoc[]
include::parts/700-review-and-export/030-yaml-export-mapping.adoc[]
include::parts/700-review-and-export/040-export-preview.adoc[]
```

---

## 二、Adaptation Profile：动画剖面是上游事实

这个文件是 `frontmatter/020-adaptation-profile.adoc`。它不是偏好说明，而是整个执行链条的上游控制节点。

```asciidoc
[#profile-animation-main.adaptation-profile, target=animation-script, production=animated-short, status=active]
== 动画改编剖面

本项目将《Alice's Adventures in Wonderland》前三章改编为动画剧本初稿。
本剖面启用 xref:module-source-trace[源材料追溯模块, rel=activates]。
本剖面启用 xref:module-story-bible[故事圣经模块, rel=activates]。
本剖面启用 xref:module-animation-visual[动画视觉模块, rel=activates]。
本剖面启用 xref:module-animation-script[动画剧本正文模块, rel=activates]。
本剖面启用 xref:module-storyboard[分镜与镜头模块, rel=activates]。
本剖面启用 xref:module-review-export[审查与导出模块, rel=activates]。

[#profile-animation-main-payload.payload, for=profile-animation-main, data=json]
[source,json]
----
{
  "adaptationTarget": "animation_script",
  "productionForm": "animated_short",
  "sourceWork": "Alice's Adventures in Wonderland",
  "sourceChapters": [1, 2, 3],
  "defaultMedium": "visual_audio_animation",
  "coreAudience": "family_fantasy_animation",
  "styleKeywords": ["whimsical", "surreal", "elastic_scale", "storybook_grotesque", "kinetic_comedy"],
  "requiredChannels": ["image", "motion", "dialogue", "sound", "music"],
  "primaryConsumerRoles": [
    "animation_director",
    "storyboard_artist",
    "character_designer",
    "background_artist",
    "animator",
    "voice_director",
    "sound_designer",
    "reviewing_author"
  ],
  "requiredModules": [
    "source_trace",
    "story_bible",
    "adaptation_control",
    "narrative_structure",
    "animation_script_core",
    "storyboard",
    "animation_assets",
    "sound_music",
    "review_export"
  ]
}
----
```

这里会产生直接后果：后续场景必须描述可见动作、画面变化、镜头运动、角色比例变化、动画表演节奏、声音提示。真人拍摄地点不是这个剖面的核心对象；我们用 `environment-asset`、`background-design`、`shot`、`animation-action`、`scale-rule` 这些对象。

---

## 三、role 词表：节点身份必须稳定

`frontmatter/030-role-vocabulary.adoc` 会定义当前书稿允许使用的 role。全集概念可以在术语里列名，但动画剖面只启用这些。

```asciidoc
[#role-vocabulary.role-vocabulary]
== Role 词表

本书稿中 role 标明标题节点的业务身份。role 在全书范围内保持稳定含义。

[cols="1,2,2", options="header"]
|===
|Role |对象 |动画剖面职责

|`.adaptation-profile`
|改编剖面
|定义目标媒介、生产形态、启用模块和必需输出。

|`.module`
|本体模块
|声明当前剖面启用的业务模块。

|`.source-chapter`
|源章节
|承载小说章节级源材料。

|`.source-snippet`
|源片段
|承载可被场景、角色、道具、世界规则引用的原文片段。

|`.source-event`
|源事件
|从源材料中抽取的事件事实或事件候选。

|`.character`
|角色
|承载角色身份、视觉设定、声音和行为规则。

|`.location`
|叙事地点
|承载故事里的地点概念。

|`.environment-asset`
|动画环境资产
|承载背景、美术空间、可视场景设计。

|`.prop`
|道具 / 视觉物件
|承载角色交互或镜头强调的物件。

|`.world-rule`
|世界规则
|承载比例变化、荒诞逻辑、物理弹性等动画世界约束。

|`.visual-rule`
|视觉规则
|承载颜色、比例、镜头、运动风格的规则。

|`.quality-rule`
|质量规则
|承载审查标准。

|`.adaptation-choice`
|改编选择
|记录外化、压缩、扩写、重排、原创过渡等选择。

|`.beat`
|节拍
|承载叙事功能节点。

|`.scene-card`
|场景卡
|承载场景功能、冲突、参与角色、来源和变化。

|`.animation-scene`
|动画剧本场景
|承载完整动画剧本正文场景。

|`.shot`
|分镜镜头
|承载镜头级画面、运动、声音和资产需求。

|`.review-note`
|审查意见
|承载作者、总编剧或执行者对节点的审查意见。

|`.export-mapping`
|导出映射
|说明图谱对象如何导出为 YAML。
|===
```

这里没有问“哪些最小”。这是一套动画剖面需要的 role。其他剖面如 `.shooting-location`、`.stage-blocking`、`.audio-only-scene`、`.comic-panel` 可以保留在全集术语表里，但今天不激活。

---

## 四、rel 词表：关系谓词要能表达推导链

`frontmatter/040-relation-vocabulary.adoc` 定义边。

```asciidoc
[#relation-vocabulary.relation-vocabulary]
== Relation 词表

rel 写在 xref 边上。xref 所在标题是 source heading，xref 指向标题是 target heading。

[horizontal]
activates:: 改编剖面启用某个模块。
adapted-from:: 改编对象来自某个源片段或源事件。
derived-from:: 设定、角色、规则或事件从源材料推导。
evidenced-by:: 判断由源材料或上游控制信息提供证据。
constrains:: 规则或剖面约束目标对象。
realizes:: 下游对象实现上游节拍、场景卡或改编选择。
features-character:: 场景、节拍或镜头包含角色。
located-at:: 场景或事件发生在地点或环境资产中。
requires-prop:: 场景或镜头需要某个道具。
requires-asset:: 动画镜头需要角色、背景、特效或视觉资产。
externalizes:: 剧本元素把小说心理、意象或抽象描述外化为可见/可听内容。
compresses:: 改编对象压缩多个源事件或源段落。
expands:: 改编对象扩写源材料。
reorders:: 改编对象调整源材料顺序。
sets-up:: 某节点建立后续节点的条件。
pays-off:: 某节点回收前面的铺垫。
follows:: 当前节点在叙事顺序上跟随目标节点。
critiques:: 审查意见批评或要求修改目标节点。
approves:: 审查意见批准目标节点。
exports-to:: 本体对象投影到导出对象。
```

这套 rel 是动画剖面的血管。比如：

```asciidoc
本场景实现 xref:beat-rabbit-appears[白兔出现节拍, rel=realizes]。
本场景改编自 xref:src-ch1-rabbit-watch[白兔看表源片段, rel=adapted-from]。
本场景受 xref:qr-visual-action-first[动作优先表达规则, rel=constrains] 约束。
本场景需要 xref:prop-pocket-watch[怀表, rel=requires-prop]。
```

投影到 TTL 后，ARQ 可以反向查：某源片段被哪些场景改编；某质量规则约束哪些场景；某道具有哪些镜头使用。

---

## 五、源材料：前三章如何进入书稿

你说不需要我下载原文，因为这是公版，故事我知道。正式项目中，源材料应导入原文并保留行号。这里推演时我用稳定片段 ID 和概括文本，代表“原文片段节点”。等真正落地时，片段内容可以换成原文 excerpt 或逐段导入。

`parts/100-source-material/010-chapter-01-down-the-rabbit-hole.adoc`：

```asciidoc
[#src-ch1.source-chapter, order=1, title-en="Down the Rabbit-Hole", title-zh="掉进兔子洞"]
== 第一章：掉进兔子洞

本章建立爱丽丝从现实河岸进入荒诞地下世界的入口。

[#src-ch1-bored-riverbank.source-snippet, event=setup]
=== 河岸上的无聊

爱丽丝坐在姐姐旁边，对没有图画和对话的书感到无聊。
本片段提供 xref:char-alice[爱丽丝, rel=evidenced-by] 的好奇心和儿童视角。

[#src-ch1-white-rabbit.source-snippet, event=inciting-incident]
=== 白兔看表

白兔穿着背心，拿出怀表，说自己要迟到了。
本片段提供 xref:char-white-rabbit[白兔, rel=evidenced-by]、xref:prop-pocket-watch[怀表, rel=evidenced-by]、xref:prop-waistcoat[背心, rel=evidenced-by]。

[#src-ch1-rabbit-hole-fall.source-snippet, event=threshold-crossing]
=== 漫长下落

爱丽丝跟随白兔进入兔子洞，经历漫长下落，看见橱柜、书架、地图、果酱罐等物件。
本片段提供 xref:loc-rabbit-hole-shaft[兔子洞竖井, rel=evidenced-by]。

[#src-ch1-hall-doors.source-snippet, event=first-puzzle]
=== 门厅与小门

爱丽丝来到有许多门的大厅，找到金钥匙和通往花园的小门，但身体比例不合适。

[#src-ch1-drink-me.source-snippet, event=scale-transformation]
=== Drink Me 瓶子

爱丽丝喝下标有 Drink Me 的瓶子，身体缩小。
本片段提供 xref:prop-drink-me-bottle[Drink Me 瓶子, rel=evidenced-by] 和 xref:rule-scale-elasticity[比例弹性规则, rel=evidenced-by]。

[#src-ch1-eat-me-cake.source-snippet, event=scale-transformation]
=== Eat Me 蛋糕

爱丽丝发现写有 Eat Me 的蛋糕，吃下后期待发生变化。
本片段提供 xref:prop-eat-me-cake[Eat Me 蛋糕, rel=evidenced-by]。
```

第二章：

```asciidoc
[#src-ch2.source-chapter, order=2, title-en="The Pool of Tears", title-zh="眼泪池"]
== 第二章：眼泪池

本章围绕比例失调、身份混乱和眼泪形成的空间灾难展开。

[#src-ch2-giant-alice.source-snippet, event=scale-transformation]
=== 巨大化的爱丽丝

爱丽丝变得巨大，身体挤压大厅空间，因无法进入花园而哭泣。

[#src-ch2-rabbit-gloves-fan.source-snippet, event=rabbit-return]
=== 白兔的手套与扇子

白兔返回，误认或惊慌，掉下手套和扇子；爱丽丝拿起扇子后再次缩小。

[#src-ch2-tear-pool.source-snippet, event=environment-transformation]
=== 眼泪池

爱丽丝在自己哭出的眼泪池中游泳，身体比例和环境尺度发生荒诞反转。

[#src-ch2-mouse.source-snippet, event=first-wonderland-social-contact]
=== 老鼠出现

爱丽丝遇到老鼠，尝试对话，却因提到猫和狗引发老鼠恐惧。
```

第三章：

```asciidoc
[#src-ch3.source-chapter, order=3, title-en="A Caucus-Race and a Long Tale", title-zh="热身赛跑与长故事"]
== 第三章：热身赛跑与长故事

本章把湿透的动物群体、无规则赛跑、荒诞颁奖和老鼠长故事组织成群像喜剧。

[#src-ch3-wet-animals.source-snippet, event=group-emergence]
=== 湿透的动物群

爱丽丝、老鼠和一群动物从眼泪池上岸，所有人都湿透。

[#src-ch3-caucus-race.source-snippet, event=absurd-collective-action]
=== 热身赛跑

渡渡鸟提出没有明确规则的赛跑，动物们四散奔跑，最终所有人都被宣布获胜。

[#src-ch3-prizes.source-snippet, event=absurd-ceremony]
=== 奖品仪式

爱丽丝把糖果分给动物，自己收到顶针作为奖品。

[#src-ch3-mouse-tale.source-snippet, event=story-within-story]
=== 老鼠的长故事

老鼠开始讲述自己的故事。原文中 tale 和 tail 的文字游戏形成视觉形态。

[#src-ch3-dinah.source-snippet, event=social-failure]
=== Dinah 话题吓散动物

爱丽丝提到自己的猫 Dinah，动物们害怕离开，爱丽丝再次孤立。
```

这里每个片段都不是为了“摘要好看”，而是为了后面提供边。比如 `scene-tear-pool` 会 `adapted-from` `src-ch2-tear-pool`，`shot-scale-drop-01` 会 `externalizes` `src-ch2-giant-alice`。

---

## 六、故事圣经：角色、地点、道具、世界规则

`parts/200-story-bible/010-characters.adoc`：

```asciidoc
[#char-alice.character, status=active]
== 爱丽丝

爱丽丝是本片主角。她的动画表演核心是好奇、礼貌、冲动、快速自我修正，以及儿童式逻辑推理。
她由 xref:src-ch1-bored-riverbank[河岸无聊源片段, rel=derived-from] 建立好奇心。
她在 xref:src-ch2-giant-alice[巨大化源片段, rel=derived-from] 中暴露比例失控下的情绪脆弱。

[#char-alice-payload.payload, for=char-alice, data=json]
[source,json]
----
{
  "visualDesign": {
    "silhouette": "small child figure with expressive head-and-hand acting",
    "scaleBehavior": "body scale changes must affect camera, props, and environment",
    "motionStyle": "quick curiosity-driven steps, sudden stops, elastic reactions"
  },
  "voiceProfile": {
    "tone": "polite, curious, self-questioning",
    "dialogueRule": "questions reveal thought process; avoid adult explanation"
  },
  "actingNotes": [
    "eyes lead the body toward curiosity objects",
    "hands touch labels and props before decisions",
    "fear appears as stillness before overreaction"
  ]
}
----

[#char-white-rabbit.character, status=active]
== 白兔

白兔是入口角色。他把现实规则撕开，让爱丽丝进入地下荒诞世界。
他由 xref:src-ch1-white-rabbit[白兔看表源片段, rel=derived-from] 建立。

[#char-white-rabbit-payload.payload, for=char-white-rabbit, data=json]
[source,json]
----
{
  "visualDesign": {
    "signatureProps": ["waistcoat", "pocket_watch", "gloves", "fan"],
    "motionStyle": "staccato panic, fast foot taps, abrupt direction changes"
  },
  "voiceProfile": {
    "tone": "anxious, formal, breathless",
    "repeatedConcern": "lateness"
  }
}
----

[#char-mouse.character, status=active]
== 老鼠

老鼠是爱丽丝进入动物群体后的第一位对话对象。他对猫和狗极度敏感。
他由 xref:src-ch2-mouse[老鼠出现源片段, rel=derived-from] 建立。

[#char-dodo.character, status=active]
== 渡渡鸟

渡渡鸟是第三章群像荒诞秩序的临时组织者。
他由 xref:src-ch3-caucus-race[热身赛跑源片段, rel=derived-from] 建立。

[#char-animal-crowd.character, status=collective]
== 湿透动物群

湿透动物群是第三章群像喜剧的集体角色。它包括鸟类、小动物和其他从眼泪池上岸的角色。
```

地点与环境资产：

```asciidoc
[#loc-riverbank.location]
== 河岸

现实世界起点。视觉上应温暖、平稳、横向构图，以便和兔子洞下落形成反差。

[#env-riverbank.environment-asset, layer=background]
== 河岸背景资产

本资产实现 xref:loc-riverbank[河岸, rel=realizes]。
需要柔和草地、树影、姐姐的书、无聊的静态空气。

[#loc-rabbit-hole-shaft.location]
== 兔子洞竖井

兔子洞竖井是第一章核心动画奇观空间。
它由 xref:src-ch1-rabbit-hole-fall[漫长下落源片段, rel=derived-from] 建立。

[#env-rabbit-hole-shaft.environment-asset]
== 兔子洞下落空间

本环境资产实现 xref:loc-rabbit-hole-shaft[兔子洞竖井, rel=realizes]。
它包含漂浮橱柜、书架、地图、空果酱罐、深井透视、旋转重力方向。

[#loc-hall-of-doors.location]
== 门厅

门厅是比例规则反复折磨爱丽丝的空间。它包含许多门、小门、玻璃桌和金钥匙。

[#env-hall-of-doors.environment-asset]
== 门厅环境资产

本环境资产实现 xref:loc-hall-of-doors[门厅, rel=realizes]。
它必须支持三种比例状态：正常爱丽丝、缩小爱丽丝、巨大爱丽丝。

[#loc-tear-pool.location]
== 眼泪池

眼泪池是爱丽丝情绪外化成物理环境的空间。
它由 xref:src-ch2-tear-pool[眼泪池源片段, rel=derived-from] 建立。

[#env-tear-pool.environment-asset]
== 眼泪池环境资产

本环境资产实现 xref:loc-tear-pool[眼泪池, rel=realizes]。
它需要水面反射、漂浮动物、尺度不稳定的门厅残影。
```

道具与视觉物件：

```asciidoc
[#prop-pocket-watch.prop]
== 怀表

怀表是白兔迟到焦虑的视觉锚点。
它由 xref:src-ch1-white-rabbit[白兔看表源片段, rel=derived-from] 建立。

[#prop-drink-me-bottle.prop]
== Drink Me 瓶子

Drink Me 瓶子触发缩小事件。
它由 xref:src-ch1-drink-me[Drink Me 源片段, rel=derived-from] 建立。

[#prop-eat-me-cake.prop]
== Eat Me 蛋糕

Eat Me 蛋糕触发身体比例变化期待。
它由 xref:src-ch1-eat-me-cake[Eat Me 源片段, rel=derived-from] 建立。

[#prop-golden-key.prop]
== 金钥匙

金钥匙连接大门厅和小花园门，是比例错位问题的核心道具。

[#prop-fan.prop]
== 白兔的扇子

扇子触发爱丽丝再次缩小。
它由 xref:src-ch2-rabbit-gloves-fan[白兔手套与扇子源片段, rel=derived-from] 建立。
```

世界规则：

```asciidoc
[#rule-scale-elasticity.world-rule]
== 比例弹性规则

本动画世界允许角色身体比例因食物、饮料或物件发生剧烈变化。
该变化必须影响角色、环境、镜头和声音，而不能只改变台词描述。
本规则由 xref:src-ch1-drink-me[Drink Me 源片段, rel=derived-from] 和 xref:src-ch2-giant-alice[巨大化源片段, rel=derived-from] 建立。

[#rule-absurd-logic.world-rule]
== 荒诞逻辑规则

Wonderland 的社会规则可以荒诞，但每个荒诞行为在场景内部必须有可见秩序。
本规则约束 xref:scene-caucus-race[热身赛跑场景, rel=constrains]。

[#rule-wordplay-visualisation.world-rule]
== 文字游戏视觉化规则

当原文依赖语言文字游戏时，动画剧本必须提供视觉或声音等价物。
本规则约束 xref:scene-mouse-tale[老鼠长故事场景, rel=constrains]。
```

---

## 七、动画质量规则：总编剧功能写在前面

`parts/300-adaptation-control/010-animation-style-guide.adoc`：

```asciidoc
[#qr-visible-audible-first.quality-rule]
== 可见可听优先规则

动画剧本不得把小说心理描写原样写成不可表现的解释。
执行者必须把心理、意象和抽象状态外化为动作、构图、表情、声音、节奏、颜色或空间变化。

[#qr-scale-must-affect-camera.quality-rule]
== 比例变化必须影响镜头规则

凡涉及爱丽丝变大或变小的场景，必须同时描述角色比例、环境相对尺度、镜头角度和动作困难。
本规则约束 xref:rule-scale-elasticity[比例弹性规则, rel=depends-on]。

[#qr-whimsy-with-readable-action.quality-rule]
== 荒诞动作可读规则

场景可以混乱，但动画动作必须有节奏、方向和视觉重心。
本规则约束第三章群像场景。

[#qr-source-trace-required.quality-rule]
== 来源追溯规则

每个场景卡和动画场景必须至少连接一个 source-snippet、source-event 或 adaptation-choice。
原创过渡必须连接 rationale。
```

可见，这些规则不是写在执行者脑子里的“品味”。它们是图里的上游约束。后面任何场景都可以 `rel=constrains` 指向这些规则。

---

## 八、源事件图：把小说拆成可改编事件

`parts/400-narrative-structure/020-source-event-map.adoc`：

```asciidoc
[#event-riverbank-boredom.source-event]
== 事件：河岸无聊

爱丽丝对姐姐的书感到无聊，处在现实世界的静态开端。
本事件来自 xref:src-ch1-bored-riverbank[河岸无聊源片段, rel=adapted-from]。

[#event-rabbit-appears.source-event]
== 事件：白兔出现

白兔带着怀表和迟到焦虑穿过现实世界，触发爱丽丝追随。
本事件来自 xref:src-ch1-white-rabbit[白兔看表源片段, rel=adapted-from]。

[#event-falling-wonder.source-event]
== 事件：漫长下落

爱丽丝进入兔子洞，经过漂浮物件和空间方向变化。
本事件来自 xref:src-ch1-rabbit-hole-fall[漫长下落源片段, rel=adapted-from]。

[#event-hall-scale-puzzle.source-event]
== 事件：门厅比例谜题

爱丽丝发现小门、花园、钥匙、瓶子和蛋糕，目标与身体比例错位。
本事件来自 xref:src-ch1-hall-doors[门厅小门源片段, rel=adapted-from]。

[#event-giant-alice.source-event]
== 事件：巨大爱丽丝哭泣

爱丽丝巨大化，被空间限制困住，眼泪变成后续环境。
本事件来自 xref:src-ch2-giant-alice[巨大化源片段, rel=adapted-from]。

[#event-tear-pool.source-event]
== 事件：眼泪池游泳

爱丽丝缩小后进入自己的眼泪池，与老鼠和动物相遇。
本事件来自 xref:src-ch2-tear-pool[眼泪池源片段, rel=adapted-from]。

[#event-caucus-race.source-event]
== 事件：热身赛跑

动物们进行无规则赛跑以弄干身体，最后所有人获胜。
本事件来自 xref:src-ch3-caucus-race[热身赛跑源片段, rel=adapted-from]。

[#event-mouse-tale.source-event]
== 事件：老鼠长故事

老鼠讲述长故事，原文中的 tale/tail 形成文字视觉结构。
本事件来自 xref:src-ch3-mouse-tale[老鼠长故事源片段, rel=adapted-from]。
```

这一步解决“员工不是凭空瞎写”。后面每个 beat/scene 都有源事件或选择理由。

---

## 九、节拍表：把源事件转成动画节奏

`parts/400-narrative-structure/030-beat-sheet.adoc`：

```asciidoc
[#beat-boredom-to-curiosity.beat, function=opening-image]
== 节拍 01：无聊被好奇打破

爱丽丝从静态河岸被白兔的异常行为吸引。
本节拍改编自 xref:event-riverbank-boredom[河岸无聊事件, rel=adapted-from] 和 xref:event-rabbit-appears[白兔出现事件, rel=adapted-from]。

[#beat-cross-threshold.beat, function=threshold-crossing]
== 节拍 02：进入兔子洞

爱丽丝跟随白兔进入向下的奇观空间，现实规则开始失效。
本节拍改编自 xref:event-falling-wonder[漫长下落事件, rel=adapted-from]。

[#beat-scale-puzzle.beat, function=first-wonderland-rule]
== 节拍 03：比例谜题建立

小门、钥匙、瓶子和蛋糕建立 Wonderland 的比例错位规则。
本节拍改编自 xref:event-hall-scale-puzzle[门厅比例谜题事件, rel=adapted-from]。

[#beat-tears-become-world.beat, function=emotional-externalization]
== 节拍 04：情绪变成环境

爱丽丝的哭泣变成可游泳的眼泪池。
本节拍改编自 xref:event-giant-alice[巨大爱丽丝事件, rel=adapted-from] 和 xref:event-tear-pool[眼泪池事件, rel=adapted-from]。

[#beat-social-absurdity.beat, function=wonderland-social-rule]
== 节拍 05：荒诞群体规则出现

动物群通过无规则赛跑建立 Wonderland 的社会荒诞。
本节拍改编自 xref:event-caucus-race[热身赛跑事件, rel=adapted-from]。

[#beat-language-breakdown.beat, function=wordplay-visualization]
== 节拍 06：语言和图像错位

老鼠长故事把 tale/tail 文字游戏转成动画视觉路径。
本节拍改编自 xref:event-mouse-tale[老鼠长故事事件, rel=adapted-from]。
```

这张 beat sheet 不是最终剧本文本，但它是剧本正文的直接上游。场景卡和场景要 `realizes` 它。

---

## 十、场景卡：执行者开始做具体选择

`parts/400-narrative-structure/040-scene-cards.adoc`：

```asciidoc
[#card-riverbank-rabbit.scene-card, status=ready]
== 场景卡 01：河岸与白兔

本场景卡实现 xref:beat-boredom-to-curiosity[无聊被好奇打破节拍, rel=realizes]。
本场景卡改编自 xref:src-ch1-bored-riverbank[河岸无聊源片段, rel=adapted-from] 和 xref:src-ch1-white-rabbit[白兔看表源片段, rel=adapted-from]。
本场景卡包含 xref:char-alice[爱丽丝, rel=features-character] 和 xref:char-white-rabbit[白兔, rel=features-character]。
本场景卡需要 xref:prop-pocket-watch[怀表, rel=requires-prop]。

[#card-riverbank-rabbit-payload.payload, for=card-riverbank-rabbit, data=json]
[source,json]
----
{
  "sceneFunction": "move Alice from boredom to pursuit",
  "valueShift": {"start": "boredom", "end": "curiosity_in_motion"},
  "animationProblem": "make the Rabbit visibly impossible before Alice decides to follow",
  "rationale": "The source text's curiosity is externalized through eye movement, body lean, and the watch glint pulling Alice forward."
}
----

[#card-rabbit-hole-fall.scene-card, status=ready]
== 场景卡 02：兔子洞下落

本场景卡实现 xref:beat-cross-threshold[进入兔子洞节拍, rel=realizes]。
本场景卡改编自 xref:src-ch1-rabbit-hole-fall[漫长下落源片段, rel=adapted-from]。
本场景卡位于 xref:env-rabbit-hole-shaft[兔子洞下落空间, rel=located-at]。
本场景卡受 xref:qr-scale-must-affect-camera[比例变化必须影响镜头规则, rel=constrains] 约束。

[#card-hall-scale.scene-card, status=ready]
== 场景卡 03：门厅比例谜题

本场景卡实现 xref:beat-scale-puzzle[比例谜题建立节拍, rel=realizes]。
它连接小门、金钥匙、Drink Me 瓶子、Eat Me 蛋糕四个物件。

[#card-tear-pool.scene-card, status=ready]
== 场景卡 04：眼泪池

本场景卡实现 xref:beat-tears-become-world[情绪变成环境节拍, rel=realizes]。
本场景卡外化 xref:src-ch2-giant-alice[巨大化哭泣源片段, rel=externalizes]。

[#card-caucus-race.scene-card, status=ready]
== 场景卡 05：热身赛跑

本场景卡实现 xref:beat-social-absurdity[荒诞群体规则节拍, rel=realizes]。
本场景卡受 xref:qr-whimsy-with-readable-action[荒诞动作可读规则, rel=constrains] 约束。

[#card-mouse-tale.scene-card, status=ready]
== 场景卡 06：老鼠长故事

本场景卡实现 xref:beat-language-breakdown[语言和图像错位节拍, rel=realizes]。
本场景卡受 xref:rule-wordplay-visualisation[文字游戏视觉化规则, rel=constrains] 约束。
```

场景卡让总编剧能在执行者写正文前审查“你准备怎么改”。这比写完后才问为什么更稳。

---

## 十一、动画剧本正文：场景示例

这里展示几个关键场景。每个场景是完整动画剖面场景，不是只有一句摘要。

### 场景 01：河岸与白兔

`parts/500-animation-script-draft/010-sequence-01-riverbank-and-rabbit.adoc`：

```asciidoc
[#scene-riverbank-rabbit.animation-scene, status=draft, sequence=1]
== 场景 01：河岸与白兔

本场景实现 xref:card-riverbank-rabbit[场景卡 01, rel=realizes]。
本场景改编自 xref:src-ch1-bored-riverbank[河岸无聊源片段, rel=adapted-from] 和 xref:src-ch1-white-rabbit[白兔看表源片段, rel=adapted-from]。
本场景包含 xref:char-alice[爱丽丝, rel=features-character] 和 xref:char-white-rabbit[白兔, rel=features-character]。
本场景需要 xref:prop-pocket-watch[怀表, rel=requires-prop]。
本场景受 xref:qr-visible-audible-first[可见可听优先规则, rel=constrains] 约束。

[animation-script]
----
EXT. RIVERBANK - AFTERNOON

Warm, still air. The river barely moves.

ALICE sits beside her sister. Her sister's book fills the frame: dense lines, no pictures, no dialogue.

Alice tilts her head. Her eyes drift away from the page. A daisy bends in the grass. A bee circles once, too slowly.

A WHITE RABBIT cuts across the stillness.

He wears a waistcoat. One paw grips a POCKET WATCH. The watch snaps open with a bright metallic tick.

WHITE RABBIT
Oh dear! Oh dear! I shall be too late!

Alice freezes.

The watch face flashes in her eyes. The whole riverbank seems to hold its breath.

The Rabbit darts behind a hedge.

Alice stands before she has decided to stand.

ALICE
A rabbit with a watch?

She runs after him.
----

[#scene-riverbank-rabbit-choice.adaptation-choice]
=== 改编选择：把无聊外化为静态空气

原文中爱丽丝的无聊通过对姐姐书本缺少图画和对话的评价表达。
本场景把无聊外化为静止河面、慢速昆虫、无图画书页和爱丽丝视线游离。
本选择外化 xref:src-ch1-bored-riverbank[河岸无聊源片段, rel=externalizes]。
```

这里有几个特性被跑通：source trace、角色、道具、动作外化、对白、视觉节奏、改编理由。

### 场景 02：兔子洞下落

```asciidoc
[#scene-rabbit-hole-fall.animation-scene, status=draft, sequence=2]
== 场景 02：兔子洞下落

本场景实现 xref:card-rabbit-hole-fall[场景卡 02, rel=realizes]。
本场景改编自 xref:src-ch1-rabbit-hole-fall[漫长下落源片段, rel=adapted-from]。
本场景位于 xref:env-rabbit-hole-shaft[兔子洞下落空间, rel=located-at]。
本场景受 xref:qr-scale-must-affect-camera[比例变化必须影响镜头规则, rel=constrains] 约束。

[animation-script]
----
INT. RABBIT HOLE SHAFT - CONTINUOUS

Alice slips through the hedge and drops.

The ground does not arrive.

She falls past a wooden shelf. A teacup lifts from it, floats beside her, then falls upward.

CAMERA ROLLS with Alice. The shaft becomes a vertical room, then a sideways hallway, then a long dark well lined with cupboards.

Alice reaches for a jar labeled ORANGE MARMALADE. It is empty. Her disappointment lasts one beat too long for someone falling.

Below her, the White Rabbit becomes a tiny flicker of white.

ALICE
Well... after this, falling down stairs will seem very ordinary.

A map peels off the wall and wraps around her like a cape. She spins out of it, laughing despite herself.

The darkness opens.
----

[#shot-fall-rolling-camera.shot, scene=scene-rabbit-hole-fall, order=2]
=== Shot：旋转镜头下落

本镜头实现 xref:scene-rabbit-hole-fall[兔子洞下落场景, rel=realizes]。
本镜头需要 xref:env-rabbit-hole-shaft[兔子洞下落空间, rel=requires-asset]。

[#shot-fall-rolling-camera-payload.payload, for=shot-fall-rolling-camera, data=json]
[source,json]
----
{
  "camera": "continuous rolling fall, 180-degree orientation shifts",
  "motion": "Alice rotates slowly while objects drift at contradictory speeds",
  "visualFocus": ["empty marmalade jar", "floating shelf", "distant white rabbit"],
  "animationRisk": "avoid visual clutter; keep Alice silhouette readable"
}
----
```

这里跑通了 animation-specific shot。真人场景不一定需要这么写，但动画需要分镜师和动画师消费镜头、运动、视觉重心和可读性风险。

### 场景 03：门厅与比例谜题

```asciidoc
[#scene-hall-scale-puzzle.animation-scene, status=draft, sequence=3]
== 场景 03：门厅与比例谜题

本场景实现 xref:card-hall-scale[场景卡 03, rel=realizes]。
本场景改编自 xref:src-ch1-hall-doors[门厅小门源片段, rel=adapted-from]、xref:src-ch1-drink-me[Drink Me 源片段, rel=adapted-from] 和 xref:src-ch1-eat-me-cake[Eat Me 源片段, rel=adapted-from]。
本场景位于 xref:env-hall-of-doors[门厅环境资产, rel=located-at]。
本场景需要 xref:prop-golden-key[金钥匙, rel=requires-prop]、xref:prop-drink-me-bottle[Drink Me 瓶子, rel=requires-prop]、xref:prop-eat-me-cake[Eat Me 蛋糕, rel=requires-prop]。
本场景受 xref:rule-scale-elasticity[比例弹性规则, rel=constrains] 约束。

[animation-script]
----
INT. HALL OF DOORS - LATER

Alice lands softly on a floor too polished to belong underground.

Doors line every wall. Big doors. Narrow doors. Doors with faces carved into their handles.

A tiny curtain stirs near the floor.

Alice kneels. Behind the curtain: a LITTLE DOOR. Beyond it, a garden glows green and gold.

On a glass table, a GOLDEN KEY shines.

Alice reaches. The table is exactly too high.

She finds a bottle labeled DRINK ME.

Alice studies the label, then the door, then the key.

ALICE
If one drinks from a bottle in a place like this, one ought to check first.

She checks. No skull. No warning. Only the label, smiling in red letters.

She drinks.

The room stretches upward. The table grows into a tower. The key becomes a sun on glass above her.

Alice, now tiny, looks from the key to the little door.

ALICE
Oh.

On the floor, a small cake waits in a paper box. EAT ME.
----
```

这里的重点是：比例变化不是一句“她变小了”。镜头里 table becomes tower，key becomes sun。这个就是动画剖面的消费者动作：分镜和动画可以执行。

### 场景 04：巨大爱丽丝与眼泪池

```asciidoc
[#scene-giant-tears.animation-scene, status=draft, sequence=4]
== 场景 04：巨大爱丽丝与眼泪池

本场景实现 xref:card-tear-pool[场景卡 04, rel=realizes]。
本场景改编自 xref:src-ch2-giant-alice[巨大化源片段, rel=adapted-from] 和 xref:src-ch2-tear-pool[眼泪池源片段, rel=adapted-from]。
本场景外化 xref:src-ch2-giant-alice[巨大化哭泣源片段, rel=externalizes]。
本场景受 xref:qr-scale-must-affect-camera[比例变化必须影响镜头规则, rel=constrains] 约束。

[animation-script]
----
INT. HALL OF DOORS - MOMENTS LATER

Alice grows.

Her knees hit the ceiling. Her arm slides down the hall like a fallen column. The little door is now smaller than her tear.

The garden glows beyond it, unreachable.

Alice tries to fold herself smaller. The hall answers with creaks.

ALICE
Who in the world am I?

A tear slips down her cheek.

It hits the floor with the weight of a bucket.

Another tear. Another.

The floor becomes a shining pool. The doors reflect in it like crooked moons.

White Rabbit rushes in, sees Alice, drops his gloves and fan, and bolts.

Alice grabs the fan without thinking.

Her hand shrinks around it.

The ceiling races upward. The pool rises around her.

Tiny Alice splashes into her own tears.
----

[#scene-giant-tears-choice.adaptation-choice]
=== 改编选择：情绪变成环境

原文中爱丽丝哭出的眼泪形成池水。
本场景把情绪外化为物理空间灾难：单滴眼泪先像水桶一样砸落，再连续扩展成池。
本选择外化 xref:src-ch2-giant-alice[巨大化源片段, rel=externalizes]。
本选择实现 xref:beat-tears-become-world[情绪变成环境节拍, rel=realizes]。
```

这里跑通了“心理 / 情绪 / 环境”转换。动画要把内在体验变成画面和运动。

### 场景 05：眼泪池里的老鼠

```asciidoc
[#scene-tear-pool-mouse.animation-scene, status=draft, sequence=5]
== 场景 05：眼泪池里的老鼠

本场景改编自 xref:src-ch2-tear-pool[眼泪池源片段, rel=adapted-from] 和 xref:src-ch2-mouse[老鼠出现源片段, rel=adapted-from]。
本场景包含 xref:char-alice[爱丽丝, rel=features-character] 和 xref:char-mouse[老鼠, rel=features-character]。
本场景位于 xref:env-tear-pool[眼泪池环境资产, rel=located-at]。

[animation-script]
----
INT. TEAR POOL - CONTINUOUS

Alice swims through salty water. A table leg drifts past like a mast.

A MOUSE paddles nearby, whiskers flat with panic.

ALICE
Oh Mouse, do you know the way out of this pool?

The Mouse turns, suspicious.

Alice tries again, too politely.

ALICE
I have a cat named Dinah. She is very good at catching—

The Mouse stiffens. His tail becomes a rigid line.

The water around him ripples outward in sharp rings.

ALICE
Oh! I beg your pardon.

The Mouse swims faster.
----
```

这里声音、动作、尾巴形态都承载角色反应。老鼠的 tail 也为第三章 tale/tail 铺垫。

### 场景 06：热身赛跑

```asciidoc
[#scene-caucus-race.animation-scene, status=draft, sequence=6]
== 场景 06：热身赛跑

本场景实现 xref:card-caucus-race[场景卡 05, rel=realizes]。
本场景改编自 xref:src-ch3-wet-animals[湿透动物群源片段, rel=adapted-from] 和 xref:src-ch3-caucus-race[热身赛跑源片段, rel=adapted-from]。
本场景包含 xref:char-alice[爱丽丝, rel=features-character]、xref:char-dodo[渡渡鸟, rel=features-character] 和 xref:char-animal-crowd[湿透动物群, rel=features-character]。
本场景受 xref:qr-whimsy-with-readable-action[荒诞动作可读规则, rel=constrains] 和 xref:rule-absurd-logic[荒诞逻辑规则, rel=constrains] 约束。

[animation-script]
----
EXT. TEAR POOL SHORE - DAY

Everyone is wet.

Birds drip. Fur drips. Alice's hair drips in two straight lines.

The DODO climbs onto a stone as if it were a parliament bench.

DODO
The best thing to get us dry would be a Caucus-race.

No one knows what that means. Everyone nods.

The Dodo draws a circle in the mud. The circle is not round.

DODO
Begin when you like. Stop when you like.

The animals run.

A duck sprints three steps, forgets why, turns back. A lory runs backward. A crab cuts sideways through the group. Alice tries to follow the circle and finds three animals crossing her path at once.

CAMERA rises overhead. The race becomes a moving knot of arrows, splashes, feathers, and footprints.

DODO
Stop!

Everyone stops in different poses.

DODO
Everybody has won.

The animals cheer as if this were perfectly sensible.
----

[#scene-caucus-race-choice.adaptation-choice]
=== 改编选择：把无规则赛跑做成有视觉重心的群像调度

原文的荒诞来自没有明确规则的赛跑。
动画场景必须避免无意义混乱，因此用俯视镜头、泥地圆圈、动物运动方向差异来组织节奏。
本选择改编自 xref:src-ch3-caucus-race[热身赛跑源片段, rel=adapted-from]。
本选择受 xref:qr-whimsy-with-readable-action[荒诞动作可读规则, rel=constrains] 约束。
```

这里跑通群像动画调度。不是“动物乱跑”，而是让混乱可读。

### 场景 07：老鼠长故事

```asciidoc
[#scene-mouse-tale.animation-scene, status=draft, sequence=7]
== 场景 07：老鼠长故事

本场景实现 xref:card-mouse-tale[场景卡 06, rel=realizes]。
本场景改编自 xref:src-ch3-mouse-tale[老鼠长故事源片段, rel=adapted-from]。
本场景包含 xref:char-mouse[老鼠, rel=features-character] 和 xref:char-alice[爱丽丝, rel=features-character]。
本场景受 xref:rule-wordplay-visualisation[文字游戏视觉化规则, rel=constrains] 约束。

[animation-script]
----
EXT. TEAR POOL SHORE - LATER

The Mouse stands before Alice with wounded dignity.

MOUSE
Mine is a long and sad tale.

Alice looks at his tail, still wet, curling behind him.

ALICE
It is a long tail, certainly.

The Mouse begins his story.

As he speaks, his words trail into the air behind him. The letters bend, shrink, and curl into the shape of his tail.

The camera follows the text-tail as it winds across the ground, around Alice's shoes, through puddles, and back to the Mouse.

Alice tries to read it. The tail keeps moving.
----

[#scene-mouse-tale-choice.adaptation-choice]
=== 改编选择：把 tale/tail 文字游戏转成运动文字尾巴

原文依赖 tale 与 tail 的文字游戏和排版形态。
动画中将老鼠讲述的文字变成可运动的尾巴形状，使语言游戏变成可见动作。
本选择外化 xref:src-ch3-mouse-tale[老鼠长故事源片段, rel=externalizes]。
```

这个场景跑通文字游戏视觉化。动画剖面必须处理这类文学特性，不能只保留对白。

---

## 十二、分镜镜头：每种动画特性至少展示一次

`parts/600-storyboard-and-production-notes/010-shot-list.adoc`：

```asciidoc
[#shot-rabbit-watch-glint.shot, scene=scene-riverbank-rabbit, order=1]
== Shot 01：怀表闪光吸引爱丽丝

本镜头实现 xref:scene-riverbank-rabbit[河岸与白兔场景, rel=realizes]。
本镜头需要 xref:prop-pocket-watch[怀表, rel=requires-asset]。

[#shot-rabbit-watch-glint-payload.payload, for=shot-rabbit-watch-glint, data=json]
[source,json]
----
{
  "framing": "close-up on pocket watch opening, reflected in Alice's eye",
  "motion": "single sharp snap in an otherwise still scene",
  "sound": "bright metallic tick",
  "purpose": "externalize curiosity trigger"
}
----

[#shot-scale-table-tower.shot, scene=scene-hall-scale-puzzle, order=4]
== Shot 04：桌子变成高塔

本镜头实现 xref:scene-hall-scale-puzzle[门厅比例谜题场景, rel=realizes]。
本镜头受 xref:qr-scale-must-affect-camera[比例变化必须影响镜头规则, rel=constrains] 约束。

[#shot-scale-table-tower-payload.payload, for=shot-scale-table-tower, data=json]
[source,json]
----
{
  "framing": "low angle from tiny Alice looking up at glass table",
  "scaleCue": "key appears sun-like on tabletop",
  "animationNote": "change must be staged through camera perspective, not only character size"
}
----

[#shot-tear-impact.shot, scene=scene-giant-tears, order=2]
== Shot 02：眼泪砸成水池

本镜头外化 xref:src-ch2-giant-alice[巨大化哭泣源片段, rel=externalizes]。

[#shot-caucus-overhead.shot, scene=scene-caucus-race, order=5]
== Shot 05：热身赛跑俯视图

本镜头受 xref:qr-whimsy-with-readable-action[荒诞动作可读规则, rel=constrains] 约束。

[#shot-mouse-text-tail.shot, scene=scene-mouse-tale, order=3]
== Shot 03：文字尾巴

本镜头实现 xref:scene-mouse-tale-choice[文字游戏视觉化选择, rel=realizes]。
```

这些 shot 展示等价类：触发物特写、比例变化、情绪外化、群像调度、文字游戏视觉化。

---

## 十三、审查意见：打回机制如何写

`parts/700-review-and-export/010-review-notes.adoc`：

```asciidoc
[#review-note-scale-001.review-note, status=open, assigned-to=executor]
== 审查意见：门厅比例变化还需加强连续性

当前 xref:scene-hall-scale-puzzle[门厅比例谜题场景, rel=critiques] 已经描述桌子变高，但需要补充爱丽丝缩小后声音空间的变化。
建议增加脚步声变空、钥匙碰撞声变远的声音提示。
本意见依据 xref:qr-scale-must-affect-camera[比例变化必须影响镜头规则, rel=evidenced-by]。

[#review-note-caucus-001.review-note, status=resolved, assigned-to=executor]
== 审查意见：热身赛跑需要明确视觉重心

xref:scene-caucus-race[热身赛跑场景, rel=critiques] 已增加俯视镜头和泥地圆圈，解决群像混乱不可读问题。
本意见已解决。
```

审查意见本身也是节点，批评目标通过 `rel=critiques` 连接。反向查询可以查某个场景所有未解决意见。

---

## 十四、业务 SHACL 约束示例

`shapes/animation-script.shacl.ttl` 不是完整文件，但会这样表达规则：

```turtle
@prefix sh: <http://www.w3.org/ns/shacl#> .
@prefix screen: <https://micheng.dev/ns/screen-adaptation#> .
@prefix aat: <https://micheng.dev/ns/asciidoc-abundant-tree#> .
@prefix rel: <https://micheng.dev/ns/asciidoc-relation#> .

screen:AnimationSceneShape
  a sh:NodeShape ;
  sh:targetClass screen:AnimationScene ;
  sh:property [
    sh:path rel:adapted-from ;
    sh:minCount 1 ;
    sh:message "Animation scene must trace back to source material or an adaptation choice." ;
  ] ;
  sh:property [
    sh:path rel:features-character ;
    sh:minCount 1 ;
    sh:message "Animation scene must feature at least one character or collective character." ;
  ] ;
  sh:property [
    sh:path rel:realizes ;
    sh:minCount 1 ;
    sh:message "Animation scene must realize a scene card or beat." ;
  ] .

screen:ShotShape
  a sh:NodeShape ;
  sh:targetClass screen:Shot ;
  sh:property [
    sh:path rel:realizes ;
    sh:minCount 1 ;
  ] .
```

这里需要一个业务 RDF 层把 `.animation-scene` role 映射成 `screen:AnimationScene`。底层 aat 图负责保留标题和属性；业务层负责解释 role。

---

## 十五、SPARQL 查询示例

`queries/scenes-by-source.rq`：

```sparql
PREFIX aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>
PREFIX rel: <https://micheng.dev/ns/asciidoc-relation#>

SELECT ?sceneTitle ?sourceTitle ?scenePath ?sceneLine
WHERE {
  ?scene aat:role "animation-scene" ;
         aat:headline ?sceneTitle ;
         aat:relativePath ?scenePath ;
         aat:headingLine ?sceneLine ;
         rel:adapted-from ?source .
  ?source aat:headline ?sourceTitle .
}
ORDER BY ?scenePath ?sceneLine
```

`queries/visual-assets.rq`：

```sparql
PREFIX aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>
PREFIX rel: <https://micheng.dev/ns/asciidoc-relation#>

SELECT ?shotTitle ?assetTitle ?path ?line
WHERE {
  ?shot aat:role "shot" ;
        aat:headline ?shotTitle ;
        aat:relativePath ?path ;
        aat:headingLine ?line ;
        rel:requires-asset ?asset .
  ?asset aat:headline ?assetTitle .
}
ORDER BY ?path ?line
```

`queries/review-open-items.rq`：

```sparql
PREFIX aat: <https://micheng.dev/ns/asciidoc-abundant-tree#>
PREFIX rel: <https://micheng.dev/ns/asciidoc-relation#>

SELECT ?noteTitle ?targetTitle ?assignee ?path ?line
WHERE {
  ?note aat:role "review-note" ;
        aat:headline ?noteTitle ;
        aat:status "open" ;
        aat:relativePath ?path ;
        aat:headingLine ?line ;
        rel:critiques ?target .
  OPTIONAL { ?note aat:assigned-to ?assignee . }
  ?target aat:headline ?targetTitle .
}
ORDER BY ?assignee ?path ?line
```

这些查询直接体现：书稿不是死文档。它能查来源、查资产、查审查意见。

---

## 十六、YAML 导出映射

`parts/700-review-and-export/030-yaml-export-mapping.adoc`：

```asciidoc
[#yaml-export-animation.export-mapping]
== 动画剧本 YAML 导出映射

YAML 导出是动画剖面的机器交换格式。
它从书稿图中的 `.adaptation-profile`、`.character`、`.environment-asset`、`.prop`、`.world-rule`、`.beat`、`.animation-scene`、`.shot`、`.review-note` 节点投影。

[cols="1,2,2", options="header"]
|===
|YAML 字段 |来源节点 |说明

|`project`
|`.adaptation-profile`
|项目、目标媒介、生产形态。

|`source.chapters`
|`.source-chapter`
|源章节。

|`source.snippets`
|`.source-snippet`
|可追溯源片段。

|`story_bible.characters`
|`.character`
|角色与视觉/声音设定。

|`story_bible.environments`
|`.environment-asset`
|动画背景和空间资产。

|`story_bible.props`
|`.prop`
|道具与视觉物件。

|`rules.world_rules`
|`.world-rule`
|世界逻辑和比例规则。

|`rules.quality_rules`
|`.quality-rule`
|审查规则。

|`structure.beats`
|`.beat`
|节拍表。

|`script.scenes`
|`.animation-scene`
|动画剧本场景。

|`storyboard.shots`
|`.shot`
|镜头与动画指令。

|`review.notes`
|`.review-note`
|审查意见。
|===
```

导出 YAML 片段示例：

```yaml
schema_version: "1.0"
adaptation_profile:
  id: profile-animation-main
  target: animation_script
  production_form: animated_short
  source_work: "Alice's Adventures in Wonderland"
source:
  chapters:
    - id: src-ch1
      title: "第一章：掉进兔子洞"
    - id: src-ch2
      title: "第二章：眼泪池"
    - id: src-ch3
      title: "第三章：热身赛跑与长故事"
story_bible:
  characters:
    - id: char-alice
      name: 爱丽丝
      visual_design:
        motion_style: "quick curiosity-driven steps, sudden stops, elastic reactions"
      voice_profile:
        tone: "polite, curious, self-questioning"
    - id: char-white-rabbit
      name: 白兔
      signature_props: [prop-pocket-watch, prop-waistcoat, prop-fan]
  environments:
    - id: env-rabbit-hole-shaft
      name: 兔子洞下落空间
      required_features: [floating_cupboards, shelves, maps, rotating_gravity]
script:
  scenes:
    - id: scene-rabbit-hole-fall
      title: 场景 02：兔子洞下落
      source_refs:
        - src-ch1-rabbit-hole-fall
      realizes:
        - card-rabbit-hole-fall
      characters:
        - char-alice
      environment: env-rabbit-hole-shaft
      elements:
        - type: action
          text: "Alice slips through the hedge and drops."
        - type: action
          text: "The ground does not arrive."
        - type: dialogue
          character: char-alice
          text: "Well... after this, falling down stairs will seem very ordinary."
storyboard:
  shots:
    - id: shot-fall-rolling-camera
      scene: scene-rabbit-hole-fall
      camera: "continuous rolling fall, 180-degree orientation shifts"
      visual_focus: [empty_marmalade_jar, floating_shelf, distant_white_rabbit]
review:
  notes:
    - id: review-note-scale-001
      status: open
      target: scene-hall-scale-puzzle
      text: "需要补充爱丽丝缩小后声音空间的变化。"
```

这就是 YAML 的位置：它是从完整书稿和图谱导出的交换表面。

---

## 十七、这次推演跑通了哪些等价类

按测试工程学看，这次至少覆盖了这些特性类别：

1. 源章节节点：三章都入书稿。
2. 源片段节点：河岸、白兔、下落、门厅、Drink Me、巨大化、眼泪池、老鼠、赛跑、长故事。
3. 角色节点：爱丽丝、白兔、老鼠、渡渡鸟、动物群。
4. 地点与动画环境资产：河岸、兔子洞、门厅、眼泪池。
5. 道具：怀表、金钥匙、Drink Me 瓶子、Eat Me 蛋糕、扇子。
6. 世界规则：比例弹性、荒诞逻辑、文字游戏视觉化。
7. 质量规则：可见可听优先、比例影响镜头、荒诞动作可读、来源追溯。
8. 源事件：从三章抽出的事件链。
9. 节拍：从事件转换成动画叙事功能。
10. 场景卡：执行前审查层。
11. 动画剧本场景：完整场景正文。
12. 改编选择：说明为什么这样外化、压缩或视觉化。
13. 分镜镜头：镜头、动作、声音、资产需求。
14. 审查意见：打回、解决、指向目标。
15. SHACL 约束：动画场景和 shot 的业务校验。
16. SPARQL 查询：来源、资产、审查项。
17. YAML 导出：甲方格式。

这就是“过一遍”。不是只说理论，而是把每一种核心机制都放进 Alice 前三章动画改编里运行一次。

---

## 十八、现在这套方案的业务判断

对这个项目来说，默认动画剖面是合理的。Alice 前三章非常适合动画，因为它的核心挑战正是动画擅长的：空间失重、比例变化、荒诞群像、文字游戏视觉化。真人影视当然也能做，但会受到实拍成本、特效和场景调度影响；广播剧会损失大量视觉奇观；漫画可以做但会转成画格逻辑。动画剖面能直接消费这些源材料特性。

所以今天的完整设计方向应是：

> 用动画 AdaptationProfile 激活源追溯、故事圣经、改编控制、动画视觉、动画剧本、分镜、声音、审查和导出模块；执行者以《爱丽丝梦游仙境》前三章为源材料，建立角色、环境、道具、世界规则、节拍、场景和镜头；每个改编选择保留来源和理由；书稿投影为 RDF/TTL 供查询与 SHACL 校验；最后导出 YAML 剧本初稿。

这套路径里，没有“最小”。有的是“动画剖面完整”。也没有“工具链未来接入”。底层工具链已经在这里；我们现在写的是业务本体、业务书稿和业务投影。

