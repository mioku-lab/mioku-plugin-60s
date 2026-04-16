import type { AISkill, AITool } from "../../src";
import type { SixtySecondsReportType } from "./types";
import { getSixtySecondsRuntimeState } from "./runtime";

const sixtySecondsSkills: AISkill[] = [
  {
    name: "sixty_seconds",
    description:
      "发送 60s 插件支持的资讯与实用信息，包括新闻、AI 快报、汇率、历史、Epic、IT、金价、油价、天气和摸鱼日报",
    tools: [
      {
        name: "send_report",
        description:
          "发送一个 60s 报告到当前聊天。天气需要 query，油价需要 region，其余参数按类型选填。",
        parameters: {
          type: "object",
          properties: {
            report_type: {
              type: "string",
              description:
                "报告类型，可选 world_news、ai_news、exchange_rate、history、epic_games、it_news、gold_price、fuel_price、weather、moyu_daily",
              enum: [
                "world_news",
                "ai_news",
                "exchange_rate",
                "history",
                "epic_games",
                "it_news",
                "gold_price",
                "fuel_price",
                "weather",
                "moyu_daily",
              ],
            },
            date: {
              type: "string",
              description: "查询日期，适用于 world_news、ai_news、history，格式 YYYY-MM-DD",
            },
            currency: {
              type: "string",
              description: "汇率基准货币代码，例如 USD、CNY、EUR",
            },
            region: {
              type: "string",
              description: "油价查询地区，例如 杭州、成都郫县",
            },
            query: {
              type: "string",
              description: "天气查询地区，例如 杭州、北京海淀",
            },
            limit: {
              type: "number",
              description: "IT 资讯条数，1 到 50",
            },
          },
          required: ["report_type"],
        },
        handler: async (args: any, runtimeCtx?: any) => {
          const runtime = getSixtySecondsRuntimeState().runtime;
          const ctx = runtimeCtx?.ctx;
          const event = runtimeCtx?.event || runtimeCtx?.rawEvent;

          if (!runtime) {
            return "60s 插件尚未初始化";
          }

          const reportType = String(args?.report_type || "").trim() as SixtySecondsReportType;
          if (!reportType) {
            return "缺少 report_type";
          }

          if (!ctx || !event) {
            return "当前上下文不支持发送 60s 报告";
          }

          const result = await runtime.sendReport(ctx, event, {
            type: reportType,
            date: args?.date ? String(args.date) : undefined,
            currency: args?.currency ? String(args.currency) : undefined,
            region: args?.region ? String(args.region) : undefined,
            query: args?.query ? String(args.query) : undefined,
            limit:
              args?.limit != null && Number.isFinite(Number(args.limit))
                ? Number(args.limit)
                : undefined,
          });

          return result.ok ? `已发送${result.title}` : result.text;
        },
      } as AITool,
    ],
  },
];

export default sixtySecondsSkills;
