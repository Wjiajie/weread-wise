import { highlights, projects } from "@/data/sample";
import type { ContextHit } from "@/lib/types";

const tokenizer = new Intl.Segmenter("zh-CN", { granularity: "word" });

export function retrieveProjectContext(query: string, projectIds: string[]): ContextHit[] {
  const terms = new Set(
    Array.from(tokenizer.segment(query))
      .map((part) => part.segment.trim().toLowerCase())
      .filter((term) => term.length > 1)
  );

  const allowedBookIds = new Set(
    projects
      .filter((project) => projectIds.includes(project.id))
      .flatMap((project) => project.bookIds)
  );

  return highlights
    .filter((highlight) => allowedBookIds.has(highlight.bookId))
    .map((highlight) => {
      const haystack = `${highlight.text} ${highlight.comment ?? ""}`.toLowerCase();
      const lexicalScore = Array.from(terms).reduce(
        (score, term) => score + (haystack.includes(term) ? 0.22 : 0),
        0.45
      );
      const owningProject =
        projects.find((project) => project.bookIds.includes(highlight.bookId))?.id ??
        projectIds[0] ??
        "default";

      return {
        id: `ctx-${highlight.id}`,
        projectId: owningProject,
        sourceType: "highlight",
        sourceTitle: highlight.chapterTitle,
        excerpt: highlight.comment ? `${highlight.text} ${highlight.comment}` : highlight.text,
        score: Math.min(0.98, lexicalScore)
      } satisfies ContextHit;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
