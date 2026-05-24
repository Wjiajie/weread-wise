import type { LlmProvider } from "@/lib/types";

export const llmProviders: LlmProvider[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    openAICompatible: true
  },
  {
    id: "doubao",
    name: "豆包",
    defaultModel: "doubao-pro-32k",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    apiKeyEnv: "DOUBAO_API_KEY",
    openAICompatible: true
  },
  {
    id: "kimi",
    name: "Kimi",
    defaultModel: "moonshot-v1-32k",
    baseUrl: "https://api.moonshot.cn/v1",
    apiKeyEnv: "KIMI_API_KEY",
    openAICompatible: true
  },
  {
    id: "minimax",
    name: "MiniMax",
    defaultModel: "abab6.5s-chat",
    baseUrl: "https://api.minimax.chat/v1",
    apiKeyEnv: "MINIMAX_API_KEY",
    openAICompatible: false
  },
  {
    id: "zhipu",
    name: "智谱",
    defaultModel: "glm-4-plus",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4",
    apiKeyEnv: "ZHIPU_API_KEY",
    openAICompatible: true
  },
  {
    id: "qianwen",
    name: "千问",
    defaultModel: "qwen-plus",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKeyEnv: "QIANWEN_API_KEY",
    openAICompatible: true
  }
];

export function getProvider(id: string) {
  return llmProviders.find((provider) => provider.id === id) ?? llmProviders[0];
}
