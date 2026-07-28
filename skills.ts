import { TOOL_RESULT_FOLLOWUP_KEY, type AISkill, type AITool } from "mioku";
import type { SixtySecondsReportType } from "./types";
import { getSixtySecondsRuntimeState } from "./runtime";

const sixtySecondsSkills: AISkill[] = [
  {
    name: "sixty_seconds",
    description:
      "发送资讯与实用信息，包括 60s 新闻、AI 快报、货币汇率、历史上的今天、Epic免费游戏、IT资讯、金价、油价、天气、摸鱼日报、Whois查询、热搜榜单",
    permission: "member",
    tools: [
      {
        name: "send_report",
        description: "发送一个报告到当前聊天",
        parameters: {
          type: "object",
          properties: {
            report_type: {
              type: "string",
              description: "报告类型",
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
                "hot_search",
                "whois",
              ],
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
              description:
                "天气查询地区/热搜/Whois查询域名，例如 杭州、北京海淀、example.com",
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

          const reportType = String(
            args?.report_type || "",
          ).trim() as SixtySecondsReportType;
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

          if (!result.ok) {
            return result.text;
          }

          const content = result.markdown || result.text;
          const summary = `已发送${result.title}。以下是报告的主要内容，知晓即可，不需要再向用户重复：\n${content}`;

          const sentImageUrls = (result.sentImageUrls || []).filter(Boolean);
          const isMultimodal = Boolean(runtimeCtx?.isMultimodal);
          if (sentImageUrls.length === 0 || !isMultimodal) {
            return summary;
          }

          return {
            success: true,
            title: result.title,
            preview: content,
            sent_images: sentImageUrls.length,
            note: "图片已发送给用户。",
            [TOOL_RESULT_FOLLOWUP_KEY]: {
              text: `${result.title} 的图片已发送`,
            },
          };
        },
      } as AITool,
    ],
  },
];

export default sixtySecondsSkills;
