import { books as sampleBooks, highlights, stats as sampleStats } from "@/data/sample";
import type { Book, Highlight, ReadingStats, WeReadGatewayRequest } from "@/lib/types";
import { WEREAD_GATEWAY_URL, WEREAD_SKILL_VERSION } from "@/lib/weread/capabilities";

export interface WeReadConnector {
  syncLibrary(): Promise<{ books: Book[]; stats: ReadingStats }>;
  listBookshelf(): Promise<Book[]>;
  getReadingStats(): Promise<ReadingStats>;
  listHighlights(bookId: string): Promise<Highlight[]>;
  exportBookNotes(bookId: string): Promise<{ highlights: Highlight[]; markdown: string }>;
  gateway<T>(request: Omit<WeReadGatewayRequest, "skill_version">): Promise<T>;
}

type ShelfBook = {
  bookId?: string;
  title?: string;
  author?: string;
  cover?: string;
  category?: string;
  readUpdateTime?: number;
  finishReading?: number;
  secret?: number;
};

type ShelfAlbum = {
  albumInfo?: {
    albumId?: string;
    name?: string;
    authorName?: string;
    cover?: string;
    updateTime?: number;
    finish?: number;
  };
  albumInfoExtra?: {
    lectureReadUpdateTime?: number;
    secret?: number;
  };
};

type ShelfResponse = {
  books?: ShelfBook[];
  albums?: ShelfAlbum[];
  mp?: Record<string, unknown> | null;
};

type NotebookBook = {
  bookId?: string;
  book?: {
    bookId?: string;
    title?: string;
    author?: string;
    cover?: string;
    category?: string;
  };
  reviewCount?: number;
  noteCount?: number;
  bookmarkCount?: number;
  readingProgress?: number;
  markedStatus?: number;
  sort?: number;
};

type NotebooksResponse = {
  totalBookCount?: number;
  totalNoteCount?: number;
  hasMore?: number;
  books?: NotebookBook[];
};

type ReadDataResponse = {
  readDays?: number;
  totalReadTime?: number;
};

export class AgentGatewayWeReadConnector implements WeReadConnector {
  constructor(private readonly apiKey?: string) {}

  async syncLibrary(): Promise<{ books: Book[]; stats: ReadingStats }> {
    const [shelf, notebooks, readData] = await Promise.all([
      this.gateway<ShelfResponse>({ api_name: "/shelf/sync" }),
      this.fetchNotebookOverview(),
      this.gateway<ReadDataResponse>({ api_name: "/readdata/detail", mode: "monthly" }).catch(
        () => undefined
      )
    ]);

    const books = normalizeShelf(shelf, notebooks);
    const visibleShelfCount =
      (shelf.books?.length ?? 0) +
      (shelf.albums?.length ?? 0) +
      (shelf.mp && Object.keys(shelf.mp).length > 0 ? 1 : 0);

    return {
      books,
      stats: {
        books: visibleShelfCount,
        notes: notebooks.totalNoteCount ?? books.reduce((sum, book) => sum + book.notes, 0),
        readDays: readData?.readDays ?? sampleStats.readDays,
        readTimeMinutes: Math.round((readData?.totalReadTime ?? sampleStats.readTimeMinutes * 60) / 60),
        lastSyncAt: new Date().toLocaleString("zh-CN", { hour12: false })
      }
    };
  }

  async listBookshelf(): Promise<Book[]> {
    return (await this.syncLibrary()).books;
  }

  async getReadingStats(): Promise<ReadingStats> {
    return (await this.syncLibrary()).stats;
  }

  async listHighlights(bookId: string): Promise<Highlight[]> {
    const byBook = highlights.filter((highlight) => highlight.bookId === bookId);
    if (!this.apiKey) return byBook;

    await Promise.allSettled([
      this.gateway({ api_name: "/book/bookmarklist", bookId }),
      this.gateway({ api_name: "/review/list/mine", bookid: bookId, count: 20 })
    ]);
    return byBook;
  }

  async exportBookNotes(bookId: string) {
    const selected = await this.listHighlights(bookId);
    const book = sampleBooks.find((candidate) => candidate.id === bookId);
    return {
      highlights: selected,
      markdown: [
        `# ${book?.title ?? "WeRead notes"}`,
        "",
        ...selected.flatMap((highlight) => [
          `## ${highlight.chapterTitle}`,
          `> ${highlight.text}`,
          highlight.comment ? `\n${highlight.comment}` : "",
          `\n- ${highlight.createdAt} · ${highlight.deepLink}`
        ])
      ].join("\n")
    };
  }

  async gateway<T>(request: Omit<WeReadGatewayRequest, "skill_version">): Promise<T> {
    if (!this.apiKey) {
      throw new Error("WEREAD_API_KEY is not configured");
    }

    const response = await fetch(WEREAD_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...request, skill_version: WEREAD_SKILL_VERSION })
    });

    if (!response.ok) {
      throw new Error(`WeRead gateway failed: ${response.status}`);
    }

    const payload = (await response.json()) as T & { errcode?: number; errmsg?: string };
    if (typeof payload.errcode === "number" && payload.errcode !== 0) {
      throw new Error(payload.errmsg ?? "WeRead gateway returned an error");
    }
    return payload;
  }

  private async fetchNotebookOverview(): Promise<NotebooksResponse> {
    const firstPage = await this.gateway<NotebooksResponse>({
      api_name: "/user/notebooks",
      count: 100
    });
    return firstPage;
  }
}

export class MockWeReadConnector implements WeReadConnector {
  async syncLibrary() {
    return { books: sampleBooks, stats: sampleStats };
  }

  async listBookshelf() {
    return sampleBooks;
  }

  async getReadingStats() {
    return sampleStats;
  }

  async listHighlights(bookId: string) {
    return highlights.filter((highlight) => highlight.bookId === bookId);
  }

  async exportBookNotes(bookId: string) {
    const selected = await this.listHighlights(bookId);
    const book = sampleBooks.find((candidate) => candidate.id === bookId);
    return {
      highlights: selected,
      markdown: `# ${book?.title ?? "WeRead notes"}\n\n${selected
        .map((highlight) => `> ${highlight.text}\n\n${highlight.comment ?? ""}`)
        .join("\n\n")}`
    };
  }

  async gateway<T>() {
    return {} as T;
  }
}

export function createWeReadConnector(): WeReadConnector {
  const apiKey = process.env.WEREAD_API_KEY;
  return apiKey ? new AgentGatewayWeReadConnector(apiKey) : new MockWeReadConnector();
}

function normalizeShelf(shelf: ShelfResponse, notebooks: NotebooksResponse): Book[] {
  const noteMap = new Map<string, NotebookBook>();
  for (const item of notebooks.books ?? []) {
    const id = item.bookId ?? item.book?.bookId;
    if (id) noteMap.set(id, item);
  }

  const normalizedBooks = (shelf.books ?? []).map((book) => {
    const note = book.bookId ? noteMap.get(book.bookId) : undefined;
    return normalizeBook(book, note);
  });

  const albums = (shelf.albums ?? []).map((album) => normalizeAlbum(album));
  const mpEntry =
    shelf.mp && Object.keys(shelf.mp).length > 0
      ? [
          {
            id: "weread-mp",
            title: "文章收藏",
            author: "微信读书",
            category: "文章",
            cover: "",
            progress: 0,
            status: "remote" as const,
            highlights: 0,
            reviews: 0,
            notes: 0,
            lastReadAt: "",
            finished: false,
            deepLink: "weread://reading"
          }
        ]
      : [];

  return [...normalizedBooks, ...albums, ...mpEntry]
    .filter((book) => book.id && book.title)
    .sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt))
    .slice(0, 80);
}

function normalizeBook(book: ShelfBook, note?: NotebookBook): Book {
  const id = book.bookId ?? note?.bookId ?? note?.book?.bookId ?? crypto.randomUUID();
  const highlightCount = note?.noteCount ?? 0;
  const reviewCount = note?.reviewCount ?? 0;
  const bookmarkCount = note?.bookmarkCount ?? 0;

  return {
    id,
    title: book.title ?? note?.book?.title ?? "Untitled",
    author: book.author ?? note?.book?.author ?? "Unknown",
    category: book.category ?? note?.book?.category ?? "未分类",
    cover: normalizeCover(book.cover ?? note?.book?.cover ?? ""),
    progress: clampProgress(note?.readingProgress ?? (book.finishReading ? 100 : 0)),
    status: note ? "synced" : "remote",
    highlights: highlightCount,
    reviews: reviewCount,
    notes: highlightCount + reviewCount + bookmarkCount,
    lastReadAt: formatUnixDate(book.readUpdateTime ?? note?.sort),
    finished: book.finishReading === 1 || note?.markedStatus === 1,
    deepLink: `weread://reading?bId=${id}`
  };
}

function normalizeAlbum(album: ShelfAlbum): Book {
  const info = album.albumInfo ?? {};
  const extra = album.albumInfoExtra ?? {};
  const id = info.albumId ?? crypto.randomUUID();

  return {
    id,
    title: info.name ?? "有声书",
    author: info.authorName ?? "微信读书",
    category: "有声书",
    cover: normalizeCover(info.cover ?? ""),
    progress: info.finish ? 100 : 0,
    status: "remote",
    highlights: 0,
    reviews: 0,
    notes: 0,
    lastReadAt: formatUnixDate(extra.lectureReadUpdateTime ?? info.updateTime),
    finished: info.finish === 1,
    deepLink: `weread://reading?bId=${id}`
  };
}

function normalizeCover(cover: string) {
  if (!cover) return "";
  if (cover.startsWith("http")) return cover;
  return `https://res.weread.qq.com/wrepub/${cover}`;
}

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatUnixDate(value?: number) {
  if (!value) return "";
  return new Date(value * 1000).toISOString().slice(0, 10);
}
