"use client";

import { useMemo, useState, useTransition } from "react";
import { books as sampleBooks, highlights, projects, seedMessages, stats as sampleStats } from "@/data/sample";
import { llmProviders } from "@/lib/llm/providers";
import { wereadCapabilities } from "@/lib/weread/capabilities";
import type { Book, ChatMessage, LlmProviderId, ReadingStats } from "@/lib/types";
import { Icons } from "@/components/icons";

type Tab = "library" | "chat" | "projects" | "settings";
type Filter = "recent" | "year" | "category" | "synced";

const tabs: Array<{ id: Tab; label: string; icon: keyof typeof Icons }> = [
  { id: "library", label: "书架", icon: "library" },
  { id: "chat", label: "对话", icon: "bot" },
  { id: "projects", label: "项目", icon: "folder" },
  { id: "settings", label: "设置", icon: "settings" }
];

const filters: Array<{ id: Filter; label: string }> = [
  { id: "recent", label: "最近" },
  { id: "year", label: "年份" },
  { id: "category", label: "分类" },
  { id: "synced", label: "同步" }
];

export function WeReadWiseApp() {
  const [activeTab, setActiveTab] = useState<Tab>("library");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("recent");
  const [libraryBooks, setLibraryBooks] = useState<Book[]>(sampleBooks);
  const [readingStats, setReadingStats] = useState<ReadingStats>(sampleStats);
  const [selectedBookId, setSelectedBookId] = useState(sampleBooks[0]?.id);
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [chatInput, setChatInput] = useState("");
  const [providerId, setProviderId] = useState<LlmProviderId>("deepseek");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(["p-growth"]);
  const [syncLabel, setSyncLabel] = useState("本地样例已就绪");
  const [isPending, startTransition] = useTransition();

  const filteredBooks = useMemo(
    () => filterBooks(libraryBooks, query, filter),
    [libraryBooks, query, filter]
  );
  const selectedBook =
    libraryBooks.find((book) => book.id === selectedBookId) ?? filteredBooks[0] ?? libraryBooks[0];

  function syncWeRead() {
    startTransition(async () => {
      setSyncLabel("正在通过 WeRead Skill 同步...");
      try {
        const response = await fetch("/api/weread/sync", { method: "POST" });
        if (!response.ok) throw new Error("sync failed");
        const payload = (await response.json()) as {
          source: string;
          books: Book[];
          stats: ReadingStats;
        };
        setLibraryBooks(payload.books);
        setReadingStats(payload.stats);
        setSelectedBookId(payload.books[0]?.id);
        setSyncLabel(
          payload.source === "mock"
            ? "未配置 API Key，展示本地样例"
            : `真实同步完成：${payload.books.length} 个可展示条目`
        );
      } catch {
        setSyncLabel("同步失败，已保留当前缓存");
      }
    });
  }

  function sendMessage() {
    const content = chatInput.trim();
    if (!content) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content }
    ]);
    setChatInput("");

    startTransition(async () => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, projectIds: selectedProjectIds, providerId })
      });
      const payload = (await response.json()) as {
        id: string;
        answer: string;
        contextHits: ChatMessage["contextHits"];
      };
      setMessages((current) => [
        ...current,
        {
          id: payload.id,
          role: "assistant",
          content: payload.answer,
          contextHits: payload.contextHits
        }
      ]);
    });
  }

  return (
    <main className="app-shell">
      <aside className="desktop-rail" aria-label="桌面导航">
        <h1>WeRead Wise</h1>
        <nav className="desktop-nav">
          {tabs.map((tab) => (
            <button
              className="quiet-button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="mobile-frame">
        {activeTab === "library" && selectedBook && (
          <LibraryScreen
            query={query}
            setQuery={setQuery}
            filter={filter}
            setFilter={setFilter}
            books={filteredBooks}
            selectedBook={selectedBook}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
            stats={readingStats}
            syncLabel={syncLabel}
            onSync={syncWeRead}
            isPending={isPending}
            onChat={() => setActiveTab("chat")}
          />
        )}
        {activeTab === "chat" && (
          <ChatScreen
            messages={messages}
            input={chatInput}
            setInput={setChatInput}
            sendMessage={sendMessage}
            providerId={providerId}
            setProviderId={setProviderId}
            selectedProjectIds={selectedProjectIds}
            setSelectedProjectIds={setSelectedProjectIds}
            isPending={isPending}
          />
        )}
        {activeTab === "projects" && (
          <ProjectsScreen
            selectedProjectIds={selectedProjectIds}
            setSelectedProjectIds={setSelectedProjectIds}
          />
        )}
        {activeTab === "settings" && <SettingsScreen />}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </section>
    </main>
  );
}

function LibraryScreen(props: {
  query: string;
  setQuery: (value: string) => void;
  filter: Filter;
  setFilter: (value: Filter) => void;
  books: Book[];
  selectedBook: Book;
  selectedBookId?: string;
  setSelectedBookId: (value: string) => void;
  stats: ReadingStats;
  syncLabel: string;
  onSync: () => void;
  isPending: boolean;
  onChat: () => void;
}) {
  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="brand-kicker">微信读书官方 Skill · 本地优先</p>
          <h1 className="title">WeRead Wise</h1>
          <p className="subtitle">{props.syncLabel}</p>
        </div>
        <button className="icon-button" onClick={props.onSync} aria-label="同步微信读书">
          <Icons.refresh aria-hidden size={19} />
        </button>
      </header>

      <section className="sync-strip" aria-label="阅读统计">
        <Stat value={String(props.stats.books)} label="书架条目" />
        <Stat value={String(props.stats.notes)} label="笔记划线" />
        <Stat value={`${props.stats.readDays}`} label="阅读天数" />
        <Stat value={`${Math.floor(props.stats.readTimeMinutes / 60)}h`} label="本月时长" />
      </section>

      <div className="search-row">
        <label className="search-box">
          <Icons.search size={17} aria-hidden />
          <input
            value={props.query}
            onChange={(event) => props.setQuery(event.target.value)}
            placeholder="搜索书名、作者、分类"
            aria-label="搜索书架"
          />
        </label>
        <button className="quiet-button" onClick={props.onSync}>
          {props.isPending ? "同步中" : "导入"}
        </button>
      </div>

      <div className="filters" role="list" aria-label="书架筛选">
        {filters.map((item) => (
          <button
            key={item.id}
            className="filter-chip"
            aria-pressed={props.filter === item.id}
            onClick={() => props.setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="books-grid" aria-label="书架">
        {props.books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            selected={props.selectedBookId === book.id}
            onSelect={() => props.setSelectedBookId(book.id)}
          />
        ))}
      </section>

      <BookDetail book={props.selectedBook} />

      <button className="primary-button floating-action" onClick={props.onChat}>
        <Icons.sparkles size={17} aria-hidden />
        带入对话
      </button>
    </div>
  );
}

function BookCard({ book, selected, onSelect }: { book: Book; selected: boolean; onSelect: () => void }) {
  return (
    <button className="book-card" onClick={onSelect} aria-pressed={selected}>
      <div className="cover-wrap">
        {book.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover} alt="" loading="lazy" />
        ) : (
          <div className="cover-placeholder">{book.title}</div>
        )}
        <span className="book-badge">{statusLabel(book.status)}</span>
        <div className="progress-line" aria-hidden>
          <span style={{ width: `${book.progress}%` }} />
        </div>
      </div>
      <h2 className="book-title">{book.title}</h2>
      <p className="book-author">{book.author}</p>
      <p className="book-meta">
        {book.progress}% · 划线 {book.highlights} · 想法 {book.reviews}
      </p>
    </button>
  );
}

function BookDetail({ book }: { book: Book }) {
  const bookHighlights = highlights.filter((highlight) => highlight.bookId === book.id);

  return (
    <section className="book-detail panel" aria-label="书籍详情">
      <div className="detail-head">
        <div className="detail-cover">
          {book.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover} alt="" loading="lazy" />
          ) : (
            <div className="cover-placeholder">{book.title.slice(0, 6)}</div>
          )}
        </div>
        <div>
          <h2>{book.title}</h2>
          <p>{book.author}</p>
          <button className="quiet-button">加入项目</button>
        </div>
      </div>

      <div className="detail-tabs" role="tablist" aria-label="书籍内容">
        {["概览", "划线", "想法/评论", "章节", "相关对话"].map((item, index) => (
          <button className={`mini-tab ${index === 1 ? "active" : ""}`} key={item}>
            {item}
          </button>
        ))}
      </div>

      <div className="highlight-list">
        {(bookHighlights.length ? bookHighlights : highlights.slice(0, 2)).map((highlight) => (
          <article className="highlight-item" key={highlight.id}>
            <p>{highlight.text}</p>
            <small>
              {highlight.chapterTitle} · {highlight.createdAt}
            </small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ChatScreen(props: {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  providerId: LlmProviderId;
  setProviderId: (value: LlmProviderId) => void;
  selectedProjectIds: string[];
  setSelectedProjectIds: (value: string[]) => void;
  isPending: boolean;
}) {
  return (
    <div className="screen chat-layout">
      <header className="topbar">
        <div>
          <p className="brand-kicker">多模型对话 · 项目上下文</p>
          <h1 className="title">对话</h1>
        </div>
      </header>

      <section>
        <div className="provider-row" aria-label="模型供应商">
          {llmProviders.map((provider) => (
            <button
              key={provider.id}
              className={`mini-tab ${props.providerId === provider.id ? "active" : ""}`}
              onClick={() => props.setProviderId(provider.id)}
            >
              {provider.name}
            </button>
          ))}
        </div>
        <div className="project-picker" aria-label="引用项目">
          {projects.map((project) => {
            const active = props.selectedProjectIds.includes(project.id);
            return (
              <button
                key={project.id}
                className={`mini-tab ${active ? "active" : ""}`}
                onClick={() =>
                  props.setSelectedProjectIds(
                    active
                      ? props.selectedProjectIds.filter((id) => id !== project.id)
                      : [...props.selectedProjectIds, project.id]
                  )
                }
              >
                {project.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="conversation-list" aria-live="polite">
        {props.messages.map((message) => (
          <article className={`message ${message.role}`} key={message.id}>
            {message.content}
            {message.contextHits?.map((hit) => (
              <div className="context-card" key={hit.id}>
                {hit.sourceTitle} · 相关度 {Math.round(hit.score * 100)}%
                <br />
                {hit.excerpt}
              </div>
            ))}
          </article>
        ))}
        {props.isPending && <article className="message assistant">正在检索项目并生成回答...</article>}
      </section>

      <section className="composer" aria-label="发送消息">
        <div className="context-strip">
          <span>
            已引用 {props.selectedProjectIds.length} 个项目 · RAG 混合检索 · 本地后端代理
          </span>
        </div>
        <div className="input-row">
          <textarea
            value={props.input}
            onChange={(event) => props.setInput(event.target.value)}
            placeholder="问一个和读书笔记或项目有关的问题"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                props.sendMessage();
              }
            }}
          />
          <button className="primary-button" onClick={props.sendMessage} aria-label="发送">
            <Icons.send size={18} aria-hidden />
          </button>
        </div>
      </section>
    </div>
  );
}

function ProjectsScreen(props: {
  selectedProjectIds: string[];
  setSelectedProjectIds: (value: string[]) => void;
}) {
  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="brand-kicker">文件夹式知识容器</p>
          <h1 className="title">项目</h1>
          <p className="subtitle">对话可以保存到新建或已有项目，并同时引用多个项目上下文。</p>
        </div>
        <button className="icon-button" aria-label="新建项目">
          <Icons.folder size={19} />
        </button>
      </header>

      <section className="project-list">
        {projects.map((project) => {
          const active = props.selectedProjectIds.includes(project.id);
          return (
            <article className="project-card panel" key={project.id}>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <div className="project-meta">
                <span className="soft-tag">{project.itemCount} 条上下文</span>
                <span className="soft-tag">{project.conversationCount} 段对话</span>
                <span className="soft-tag">{healthLabel(project.contextHealth)}</span>
              </div>
              <button
                className={active ? "primary-button" : "quiet-button"}
                style={{ marginTop: 12 }}
                onClick={() =>
                  props.setSelectedProjectIds(
                    active
                      ? props.selectedProjectIds.filter((id) => id !== project.id)
                      : [...props.selectedProjectIds, project.id]
                  )
                }
              >
                {active ? "正在引用" : "引用到对话"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="brand-kicker">本地优先 · 密钥不进前端</p>
          <h1 className="title">设置</h1>
        </div>
      </header>

      <section className="settings-list">
        <article className="setting-card panel">
          <h3>WeRead 官方 Skill</h3>
          <p>资源已放入项目内，后端统一通过 Agent Gateway 调用，并保留 Markdown 导入降级路径。</p>
          <div className="capability-grid">
            {wereadCapabilities.map((capability) => (
              <span className="soft-tag" key={capability.id}>
                {capability.label}
              </span>
            ))}
          </div>
        </article>
        <article className="setting-card panel">
          <h3>LLM Provider</h3>
          <p>DeepSeek、豆包、Kimi、MiniMax、智谱、千问统一走本地后端网关。</p>
          <div className="capability-grid">
            {llmProviders.map((provider) => (
              <span className="soft-tag" key={provider.id}>
                {provider.name}
              </span>
            ))}
          </div>
        </article>
        <article className="setting-card panel">
          <h3>PWA 与离线缓存</h3>
          <p>支持安装到移动端桌面；离线时保留最近书架、项目列表和对话草稿。</p>
        </article>
        <article className="setting-card panel">
          <h3>索引与隐私</h3>
          <p>RAG 索引设计为 SQLite FTS + 向量检索；请求日志只保存来源、token 预算和引用边界。</p>
        </article>
      </section>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {tabs.map((tab) => {
        const Icon = Icons[tab.icon];
        return (
          <button
            key={tab.id}
            className="tab-button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            <Icon aria-hidden />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="sync-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function filterBooks(input: Book[], query: string, filter: Filter) {
  const normalized = query.trim().toLowerCase();
  const filtered = input.filter((book) =>
    `${book.title} ${book.author} ${book.category}`.toLowerCase().includes(normalized)
  );

  if (filter === "synced") {
    return filtered.filter((book) => book.status === "synced" || book.status === "queued");
  }
  if (filter === "category") {
    return [...filtered].sort((a, b) => a.category.localeCompare(b.category, "zh-CN"));
  }
  if (filter === "year") {
    return [...filtered].sort((a, b) => b.lastReadAt.localeCompare(a.lastReadAt));
  }
  return filtered;
}

function statusLabel(status: Book["status"]) {
  const labels: Record<Book["status"], string> = {
    synced: "已同步",
    remote: "仅远程",
    local: "仅本地",
    queued: "排队中",
    error: "异常"
  };
  return labels[status];
}

function healthLabel(status: "indexed" | "indexing" | "stale") {
  const labels = {
    indexed: "索引完成",
    indexing: "索引中",
    stale: "需重建"
  };
  return labels[status];
}
