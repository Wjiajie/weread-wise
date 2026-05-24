import type { WeReadCapability } from "@/lib/types";

export const WEREAD_SKILL_VERSION = "1.0.3";
export const WEREAD_GATEWAY_URL = "https://i.weread.qq.com/api/agent/gateway";
export const WEREAD_SKILL_RESOURCE_PATH =
  "skills/Tencent-WeChatReading/skill/weread-skills";

export type WeReadCapabilitySpec = {
  id: WeReadCapability;
  label: string;
  apiNames: string[];
  doc: string;
  notes: string;
};

export const wereadCapabilities: WeReadCapabilitySpec[] = [
  {
    id: "bookshelf.list",
    label: "查阅书架",
    apiNames: ["/shelf/sync"],
    doc: "shelf.md",
    notes: "书架总数必须按 books.length + albums.length + (mp 非空 ? 1 : 0) 计算。"
  },
  {
    id: "stats.get",
    label: "阅读统计",
    apiNames: ["/readdata/detail"],
    doc: "readdata.md",
    notes: "阅读时长字段单位为秒，展示时统一转换为小时和分钟。"
  },
  {
    id: "notes.list",
    label: "笔记概览",
    apiNames: ["/user/notebooks"],
    doc: "notes.md",
    notes: "单本总笔记数使用 reviewCount + noteCount + bookmarkCount。"
  },
  {
    id: "notes.export",
    label: "导出划线和评论",
    apiNames: ["/book/bookmarklist", "/review/list/mine"],
    doc: "notes.md",
    notes: "当前可导出内容为划线内容 + 想法/点评内容，书签只提供数量。"
  },
  {
    id: "book.search",
    label: "书籍搜索",
    apiNames: ["/store/search"],
    doc: "search.md",
    notes: "用户输入书名时先搜索获得 bookId，再执行详情或笔记查询。"
  },
  {
    id: "book.detail",
    label: "书籍详情",
    apiNames: ["/book/info", "/book/chapterinfo", "/book/getprogress"],
    doc: "book.md",
    notes: "用于书籍元数据、目录和阅读进度。"
  },
  {
    id: "book.reviews",
    label: "公开书评",
    apiNames: ["/book/reviews", "/review/single"],
    doc: "review.md",
    notes: "公开点评不属于个人笔记，展示时和个人想法区分。"
  },
  {
    id: "recommendations.list",
    label: "推荐好书",
    apiNames: ["/discover/books", "/book/similar"],
    doc: "discover.md",
    notes: "用于发现页、相似推荐和书籍补充。"
  }
];

export function getCapability(id: WeReadCapability) {
  return wereadCapabilities.find((capability) => capability.id === id);
}
