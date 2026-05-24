export type SyncStatus = "synced" | "remote" | "local" | "queued" | "error";

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  progress: number;
  status: SyncStatus;
  highlights: number;
  reviews: number;
  notes: number;
  lastReadAt: string;
  finished: boolean;
  deepLink: string;
};

export type Chapter = {
  id: string;
  bookId: string;
  title: string;
  order: number;
};

export type Highlight = {
  id: string;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
  text: string;
  comment?: string;
  createdAt: string;
  color: "amber" | "green" | "blue";
  deepLink: string;
};

export type ReadingStats = {
  books: number;
  notes: number;
  readDays: number;
  readTimeMinutes: number;
  lastSyncAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  conversationCount: number;
  bookIds: string[];
  updatedAt: string;
  contextHealth: "indexed" | "indexing" | "stale";
};

export type ContextHit = {
  id: string;
  projectId: string;
  sourceType: "highlight" | "review" | "chapter" | "conversation" | "file";
  sourceTitle: string;
  excerpt: string;
  score: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  contextHits?: ContextHit[];
};

export type LlmProviderId =
  | "deepseek"
  | "doubao"
  | "kimi"
  | "minimax"
  | "zhipu"
  | "qianwen";

export type LlmProvider = {
  id: LlmProviderId;
  name: string;
  defaultModel: string;
  baseUrl: string;
  apiKeyEnv: string;
  openAICompatible: boolean;
};

export type WeReadCapability =
  | "bookshelf.list"
  | "stats.get"
  | "notes.list"
  | "notes.export"
  | "book.search"
  | "book.detail"
  | "book.reviews"
  | "recommendations.list";

export type WeReadGatewayRequest = {
  api_name: string;
  skill_version: string;
  [key: string]: unknown;
};
