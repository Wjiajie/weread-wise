import { NextResponse } from "next/server";
import { retrieveProjectContext } from "@/lib/rag/retriever";
import { getProvider } from "@/lib/llm/providers";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    message?: string;
    projectIds?: string[];
    providerId?: string;
  };
  const message = body.message?.trim() ?? "";
  const projectIds = body.projectIds?.length ? body.projectIds : ["p-growth"];
  const provider = getProvider(body.providerId ?? "deepseek");
  const contextHits = retrieveProjectContext(message, projectIds);

  const answer = [
    `已用 ${provider.name} 的 OpenAI-compatible 网关形态组织请求。`,
    contextHits.length
      ? `当前命中 ${contextHits.length} 条项目上下文，优先引用：${contextHits
          .map((hit) => `《${hit.sourceTitle}》`)
          .join("、")}。`
      : "当前没有高相关项目上下文，建议先导入或选择项目。",
    "原型阶段不会把 API Key 暴露给浏览器；正式接入时由本地后端加密读取并审计 prompt payload。"
  ].join("\n\n");

  return NextResponse.json({
    id: crypto.randomUUID(),
    provider,
    answer,
    contextHits
  });
}
