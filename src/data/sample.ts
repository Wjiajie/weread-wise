import type { Book, ChatMessage, Highlight, Project, ReadingStats } from "@/lib/types";

export const books: Book[] = [
  {
    id: "3300197381",
    title: "为什么10倍增长比2倍更容易",
    author: "丹·沙利文 / 本杰明·哈迪",
    category: "商业与成长",
    cover: "https://res.weread.qq.com/wrepub/CB_3300197381_parsecover",
    progress: 76,
    status: "synced",
    highlights: 42,
    reviews: 13,
    notes: 61,
    lastReadAt: "2026-05-21",
    finished: false,
    deepLink: "weread://reading?bId=3300197381"
  },
  {
    id: "40381455",
    title: "当下的力量",
    author: "埃克哈特·托利",
    category: "心理与灵修",
    cover: "https://res.weread.qq.com/wrepub/CB_40381455_parsecover",
    progress: 100,
    status: "synced",
    highlights: 28,
    reviews: 9,
    notes: 40,
    lastReadAt: "2026-05-18",
    finished: true,
    deepLink: "weread://reading?bId=40381455"
  },
  {
    id: "814697",
    title: "观呼吸",
    author: "德宝法师",
    category: "身心训练",
    cover: "https://res.weread.qq.com/wrepub/CB_814697_parsecover",
    progress: 52,
    status: "queued",
    highlights: 17,
    reviews: 5,
    notes: 26,
    lastReadAt: "2026-05-16",
    finished: false,
    deepLink: "weread://reading?bId=814697"
  },
  {
    id: "3300151174",
    title: "2049：未来10000天的可能",
    author: "凯文·凯利",
    category: "科技与未来",
    cover: "https://cdn.weread.qq.com/weread/cover/69/cpplatform_ftvzmdf1yxwhfrpnjrrvnj/t6_cpplatform_ftvzmdf1yxwhfrpnjrrvnj1751445133.jpg",
    progress: 99,
    status: "local",
    highlights: 2,
    reviews: 0,
    notes: 2,
    lastReadAt: "2025-08-04",
    finished: false,
    deepLink: "weread://reading?bId=3300151174"
  },
  {
    id: "CB_1GY0T00VU5Ni6iI6gc77c0Ib",
    title: "思维模型",
    author: "加布里埃尔·温伯格 / 劳伦·麦肯",
    category: "思维模型",
    cover: "https://res.weread.qq.com/wrepub/CB_1GY0T00VU5Ni6iI6gc77c0Ib_parsecover",
    progress: 68,
    status: "synced",
    highlights: 96,
    reviews: 21,
    notes: 123,
    lastReadAt: "2026-05-09",
    finished: false,
    deepLink: "weread://reading?bId=CB_1GY0T00VU5Ni6iI6gc77c0Ib"
  },
  {
    id: "3158d2c568164d8b95cceb9c1dabf61c",
    title: "5000天后的世界",
    author: "凯文·凯利",
    category: "科技与未来",
    cover: "",
    progress: 31,
    status: "remote",
    highlights: 11,
    reviews: 4,
    notes: 16,
    lastReadAt: "2026-04-28",
    finished: false,
    deepLink: "weread://reading?bId=3158d2c568164d8b95cceb9c1dabf61c"
  }
];

export const highlights: Highlight[] = [
  {
    id: "h-1",
    bookId: "3300197381",
    chapterId: "c-1",
    chapterTitle: "第 1 章 10 倍目标",
    text: "10倍增长迫使你重新选择约束，而2倍增长只会让你在旧系统里更努力。",
    comment: "适合做项目目标筛选：不是问怎么多做，而是问哪些旧动作应该停止。",
    createdAt: "2026-05-21",
    color: "green",
    deepLink: "weread://bestbookmark?bookId=3300197381&chapterUid=1&rangeStart=120&rangeEnd=168"
  },
  {
    id: "h-2",
    bookId: "40381455",
    chapterId: "c-2",
    chapterTitle: "临在",
    text: "真正的问题不是此刻发生了什么，而是头脑如何抗拒此刻。",
    comment: "可以放进情绪默认值项目，和注意力恢复练习关联。",
    createdAt: "2026-05-18",
    color: "amber",
    deepLink: "weread://bestbookmark?bookId=40381455&chapterUid=2&rangeStart=88&rangeEnd=133"
  },
  {
    id: "h-3",
    bookId: "CB_1GY0T00VU5Ni6iI6gc77c0Ib",
    chapterId: "c-3",
    chapterTitle: "系统思维",
    text: "一个模型最大的价值，不是解释一切，而是让你知道自己正在忽略什么。",
    comment: "用于 RAG 检索时可以作为回答质量检查标准。",
    createdAt: "2026-05-09",
    color: "blue",
    deepLink: "weread://bestbookmark?bookId=CB_1GY0T00VU5Ni6iI6gc77c0Ib&chapterUid=3&rangeStart=393&rangeEnd=401"
  }
];

export const stats: ReadingStats = {
  books: 134,
  notes: 268,
  readDays: 45,
  readTimeMinutes: 427,
  lastSyncAt: "2026-05-24 21:08"
};

export const projects: Project[] = [
  {
    id: "p-growth",
    name: "增长与个人系统",
    description: "10倍目标、习惯、注意力、长期项目推进。",
    itemCount: 82,
    conversationCount: 7,
    bookIds: ["3300197381", "CB_1GY0T00VU5Ni6iI6gc77c0Ib"],
    updatedAt: "2026-05-24",
    contextHealth: "indexed"
  },
  {
    id: "p-calm",
    name: "内在稳定训练",
    description: "当下的力量、观呼吸、情绪默认值与日常练习。",
    itemCount: 41,
    conversationCount: 3,
    bookIds: ["40381455", "814697"],
    updatedAt: "2026-05-22",
    contextHealth: "indexed"
  },
  {
    id: "p-future",
    name: "AI 与未来社会",
    description: "技术浪潮、未来场景、产品机会和阅读卡片。",
    itemCount: 24,
    conversationCount: 2,
    bookIds: ["3300151174", "3158d2c568164d8b95cceb9c1dabf61c"],
    updatedAt: "2026-05-20",
    contextHealth: "indexing"
  }
];

export const seedMessages: ChatMessage[] = [
  {
    id: "m-1",
    role: "user",
    content: "结合我的读书笔记，帮我判断现在最应该压缩的项目是什么？"
  },
  {
    id: "m-2",
    role: "assistant",
    content:
      "我会优先看两类信号：一是 10 倍目标里反复出现的“旧系统约束”，二是你在身心训练笔记里提到的能量消耗源。当前最该压缩的不是单个任务，而是那些无法进入项目文件夹、也无法被复用为上下文的零散输入。",
    contextHits: [
      {
        id: "hit-1",
        projectId: "p-growth",
        sourceType: "highlight",
        sourceTitle: "为什么10倍增长比2倍更容易",
        excerpt: "10倍增长迫使你重新选择约束，而2倍增长只会让你在旧系统里更努力。",
        score: 0.91
      }
    ]
  }
];
