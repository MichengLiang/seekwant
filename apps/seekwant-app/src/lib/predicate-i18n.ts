/**
 * Chinese translations for graph edge predicates (rel=).
 * Covers all predicates used in the 4 example TTL files.
 */
export const PREDICATE_ZH: Record<string, string> = {
  // 01-dream-of-red-chamber
  loves: "深爱",
  "married-to": "结为夫妻",
  serves: "服侍",
  "son-of": "之子",
  "mother-of": "之母",
  "father-of": "之父",
  "brother-of": "兄弟",
  "sister-of": "姐妹",
  "granddaughter-of": "之外孙女",
  "granddaughter-in-law-of": "之孙媳",
  "grandmother-of": "之外祖母",
  "grandson-of": "之孙",
  "brother-of-paternal-cousin": "堂兄弟",
  "rival-in-love": "情敌",
  "rival-servant": "争宠",
  "scandal-with": "暧昧",
  "concubine-of": "之妾",
  "destroyed-by": "被害于",
  dislikes: "不喜",
  "disliked-by": "被嫌于",
  desires: "欲纳",
  "niece-of": "之侄女",
  "aunt-of": "之姑母",
  "sister-in-law-rival": "妯娌不和",
  "Prefers-as-daughter-in-law": "属意为媳",
  cousin: "表亲",
  "cousin-of": "堂亲",
  harasses: "骚扰",
  "poetry-friend": "诗友",
  rescues: "搭救",

  // 02-tcm-diagnosis
  "treated-by": "治疗方",
  "uses-herb": "常用药",
  contains: "含有",
  "paired-with": "常配伍",

  // 03-wwii-causal
  enables: "催生",
  accelerates: "加速",
  provokes: "激化",
  "leads-to": "导致",
  emboldens: "纵容",
  necessitates: "迫使",

  // 04-service-dependency
  "routes-to": "路由至",
  "depends-on": "依赖",
  "delegates-to": "委托",
  queries: "查询",
  "publishes-to": "发布至",
  "subscribes-to": "订阅",
  precedes: "先于",

  // built-in predicates
  references: "引用",
  containsDirectly: "包含",
};

/**
 * Get the Chinese label for a predicate, falling back to the original key.
 */
export function getPredicateLabel(rel: string, useChinese: boolean): string {
  if (!useChinese) return rel;
  return PREDICATE_ZH[rel] ?? rel;
}
