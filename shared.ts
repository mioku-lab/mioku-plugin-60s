import type { SixtySecondsClient } from "../../src/services/60s";
import type {
  SixtySecondsBaseConfig,
  SixtySecondsPluginServices,
  SixtySecondsRenderRequest,
  SixtySecondsRenderResult,
  SixtySecondsReportType,
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeBaseUrl(value: string): string {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function limitItems<T>(items: T[], maxItems: number): T[] {
  return items.slice(0, clamp(maxItems || 6, 1, 20));
}

function isValidDate(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidCurrency(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  return /^[A-Za-z]{3,10}$/.test(value);
}

function normalizeCurrency(value: string | undefined): string {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function normalizeLimit(value: number | undefined, fallback: number): number {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return clamp(fallback || 5, 1, 50);
  }
  return clamp(Math.floor(raw), 1, 50);
}

function firstImage(
  ...values: Array<string | undefined | null>
): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function buildLines(title: string, lines: string[]): string {
  return [title, ...lines.filter(Boolean)].join("\n");
}

function pickImportantRates(
  rates: Array<{ currency: string; rate: number }>,
  maxItems: number,
): Array<{ currency: string; rate: number }> {
  const preferred = ["USD", "EUR", "JPY", "HKD", "GBP", "KRW", "AUD"];
  const byCode = new Map(
    rates.map((item) => [String(item.currency || "").toUpperCase(), item]),
  );
  const picked: Array<{ currency: string; rate: number }> = [];

  for (const code of preferred) {
    const rate = byCode.get(code);
    if (rate) {
      picked.push(rate);
      byCode.delete(code);
    }
  }

  for (const item of rates) {
    const code = String(item.currency || "").toUpperCase();
    if (byCode.has(code)) {
      picked.push(item);
      byCode.delete(code);
    }
    if (picked.length >= maxItems) {
      break;
    }
  }

  return picked.slice(0, maxItems);
}

export async function replyWithParts(options: {
  ctx: any;
  event: any;
  parts: any[];
  quoteReply?: boolean;
}): Promise<void> {
  const { event, parts, quoteReply = false } = options;
  const payload = [...parts];
  if (quoteReply && event?.message_id != null) {
    payload.unshift({ type: "reply", id: String(event.message_id) });
  }
  await event.reply(payload.length === 1 ? payload[0] : payload);
}

export async function replyWithImage(options: {
  ctx: any;
  event: any;
  text: string;
  imageUrl?: string;
  quoteReply?: boolean;
}): Promise<void> {
  const { ctx, event, text, imageUrl, quoteReply = false } = options;
  const parts: any[] = [];
  if (imageUrl) {
    const imageSegment = ctx?.segment?.image
      ? ctx.segment.image(imageUrl)
      : { type: "image", file: imageUrl };
    parts.push(imageSegment);
  } else if (text) {
    parts.push(text);
  }
  await replyWithParts({ ctx, event, parts, quoteReply });
}

export class SixtySecondsPluginRuntime {
  private services: SixtySecondsPluginServices;
  private config: SixtySecondsBaseConfig;
  private readonly logger: {
    warn(message: string): void;
  };

  constructor(options: {
    services: SixtySecondsPluginServices;
    config: SixtySecondsBaseConfig;
    logger: { warn(message: string): void };
  }) {
    this.services = options.services;
    this.config = cloneConfig(options.config);
    this.logger = options.logger;
  }

  updateConfig(nextConfig: SixtySecondsBaseConfig): void {
    this.config = cloneConfig(nextConfig);
  }

  updateServices(nextServices: SixtySecondsPluginServices): void {
    this.services = nextServices;
  }

  private getClient(): SixtySecondsClient {
    const service = this.services.sixtySecondsService;
    if (!service) {
      throw new Error("60s-service 未加载");
    }

    return service.createClient({
      baseUrl: normalizeBaseUrl(this.config.api.baseUrl),
      timeoutMs: this.config.api.timeoutMs,
      defaultEncoding: "json",
    });
  }

  async notifyByAI(
    ctx: any,
    event: any,
    instruction: string,
    fallbackMessage: string,
  ): Promise<void> {
    const chatRuntime = this.services.aiService?.getChatRuntime();
    if (chatRuntime) {
      try {
        await chatRuntime.generateNotice({
          event,
          instruction,
          send: true,
          promptInjections: [
            {
              title: "60s Plugin Error Handling",
              content:
                "You are responding for the 60s plugin. Keep replies brief, natural, and actionable. When parameters are missing, ask only for the missing value.",
            },
          ],
        });
        return;
      } catch (error) {
        this.logger.warn(`60s notice 发送失败 ${error}`);
      }
    }

    await replyWithParts({
      ctx,
      event,
      parts: [fallbackMessage],
      quoteReply: this.config.behavior.quoteReply,
    });
  }

  async renderReport(
    request: SixtySecondsRenderRequest,
  ): Promise<SixtySecondsRenderResult> {
    const client = this.getClient();
    const maxItems = clamp(this.config.behavior.maxItems || 6, 1, 20);

    switch (request.type) {
      case "world_news": {
        if (request.date && !isValidDate(request.date)) {
          return {
            ok: false,
            title: "60s 新闻",
            text: "日期格式不合法，请使用 YYYY-MM-DD。",
            noticeInstruction:
              "用户想查询 60s 新闻，但日期格式不合法。请提醒他使用 YYYY-MM-DD。",
          };
        }
        const result = (await client.periodic.daily60s({
          query: request.date ? { date: request.date } : undefined,
        })) as any;
        const data = result?.data;
        const newsItems = Array.isArray(data?.news)
          ? (data.news as string[])
          : [];
        const lines = limitItems(newsItems, maxItems).map(
          (item: string, index: number) => `${index + 1}. ${item}`,
        );
        if (data?.tip) {
          lines.push(`提示：${data.tip}`);
        }
        return {
          ok: true,
          title: `60s 新闻 ${data?.date || ""}`.trim(),
          text: buildLines(`60s 新闻 ${data?.date || ""}`.trim(), lines),
          imageUrl: this.config.behavior.includeImages
            ? firstImage(data?.image, data?.cover)
            : undefined,
        };
      }
      case "ai_news": {
        if (request.date && !isValidDate(request.date)) {
          return {
            ok: false,
            title: "AI 资讯快报",
            text: "日期格式不合法，请使用 YYYY-MM-DD。",
            noticeInstruction:
              "用户想查询 AI 资讯快报，但日期格式不合法。请提醒他使用 YYYY-MM-DD。",
          };
        }
        const result = (await client.periodic.aiNews({
          query: request.date ? { date: request.date } : undefined,
        })) as any;
        const data = result?.data;
        const news = data?.news || [];
        if (news.length === 0) {
          return {
            ok: true,
            title: "AI 资讯快报",
            text: `AI 资讯快报 ${data?.date || ""}\n今天暂无主流 AI 快报。`.trim(),
          };
        }
        const lines = limitItems(news, maxItems).map(
          (item: any, index: number) =>
            `${index + 1}. ${item.title}\n来源：${item.source}\n${item.link}`,
        );
        return {
          ok: true,
          title: `AI 资讯快报 ${data?.date || ""}`.trim(),
          text: buildLines(`AI 资讯快报 ${data?.date || ""}`.trim(), lines),
        };
      }
      case "exchange_rate": {
        const currency = normalizeCurrency(
          request.currency || this.config.defaults.exchangeCurrency,
        );
        if (!isValidCurrency(currency)) {
          return {
            ok: false,
            title: "货币汇率",
            text: "货币代码不合法，请提供类似 USD、EUR、JPY 这样的代码。",
            noticeInstruction:
              "用户想查询货币汇率，但货币代码不合法。请提醒他提供类似 USD、EUR、JPY 这样的代码。",
          };
        }
        const result = (await client.periodic.exchangeRate({
          query: { currency },
        })) as any;
        const data = result?.data;
        const rates = pickImportantRates(data?.rates || [], maxItems);
        const lines = rates.map(
          (item: any) => `${item.currency}: ${item.rate}`,
        );
        lines.unshift(`基准货币：${data?.base_code || currency}`);
        lines.push(`更新时间：${data?.updated || ""}`);
        return {
          ok: true,
          title: "当日货币汇率",
          text: buildLines("当日货币汇率", lines),
        };
      }
      case "history": {
        if (request.date && !isValidDate(request.date)) {
          return {
            ok: false,
            title: "历史上的今天",
            text: "日期格式不合法，请使用 YYYY-MM-DD。",
            noticeInstruction:
              "用户想查询历史上的今天，但日期格式不合法。请提醒他使用 YYYY-MM-DD。",
          };
        }
        const result = (await client.periodic.todayInHistory({
          query: request.date ? { date: request.date } : undefined,
        })) as any;
        const data = result?.data;
        const lines = limitItems(data?.items || [], maxItems).map(
          (item: any, index: number) =>
            `${index + 1}. ${item.year} - ${item.title}`,
        );
        return {
          ok: true,
          title: `历史上的今天 ${data?.date || ""}`.trim(),
          text: buildLines(`历史上的今天 ${data?.date || ""}`.trim(), lines),
        };
      }
      case "epic_games": {
        const result = (await client.periodic.epicGames()) as any;
        const data = result?.data || [];
        const items = limitItems(data, maxItems);
        const coverItem =
          data.find((item: any) => item?.is_free_now && item?.cover) || data[0];
        const lines = items.map(
          (item: any, index: number) =>
            `${index + 1}. ${item.title}\n${item.original_price_desc} -> 当前${
              item.is_free_now ? "免费" : "未免费"
            }\n截止：${item.free_end}\n${item.link}`,
        );
        return {
          ok: true,
          title: "Epic 免费游戏",
          text: buildLines("Epic 免费游戏", lines),
          imageUrl: this.config.behavior.includeImages
            ? firstImage(coverItem?.cover)
            : undefined,
        };
      }
      case "it_news": {
        const limit = normalizeLimit(
          request.limit,
          this.config.defaults.itNewsLimit,
        );
        const result = (await client.periodic.itNews({
          query: { limit },
        })) as any;
        const lines = limitItems(result?.data || [], limit).map(
          (item: any, index: number) =>
            `${index + 1}. ${item.title}\n${item.created}\n${item.link}`,
        );
        return {
          ok: true,
          title: "实时 IT 资讯",
          text: buildLines("实时 IT 资讯", lines),
        };
      }
      case "gold_price": {
        const result = (await client.utility.goldPrice()) as any;
        const data = result?.data;
        const metalLines = limitItems(
          data?.metals || [],
          Math.min(maxItems, 4),
        ).map(
          (item: any) => `${item.name}: ${item.today_price}${item.unit || ""}`,
        );
        const storeLines = limitItems(
          data?.stores || [],
          Math.min(maxItems, 4),
        ).map((item: any) => `${item.brand}${item.product}: ${item.formatted}`);
        const lines = [`日期：${data?.date || ""}`, ...metalLines];
        if (storeLines.length > 0) {
          lines.push("品牌金价：");
          lines.push(...storeLines);
        }
        return {
          ok: true,
          title: "黄金价格",
          text: buildLines("黄金价格", lines),
        };
      }
      case "fuel_price": {
        const region = String(
          request.region || this.config.defaults.fuelRegion || "",
        ).trim();
        if (!region) {
          return {
            ok: false,
            title: "汽油价格",
            text: "缺少地区参数，请提供地区，例如 杭州、成都郫县。",
            noticeInstruction:
              "用户想查询汽油价格，但没有提供地区。请自然提醒他补一个地区，例如 杭州 或 成都郫县。",
          };
        }
        const result = (await client.utility.fuelPrice({
          query: { region },
        })) as any;
        const data = result?.data;
        const lines = [
          `地区：${data?.region || region}`,
          ...limitItems(data?.items || [], maxItems).map(
            (item: any) => `${item.name}: ${item.price_desc}`,
          ),
          `更新时间：${data?.updated || ""}`,
        ];
        return {
          ok: true,
          title: "汽油价格",
          text: buildLines("汽油价格", lines),
        };
      }
      case "weather": {
        const query = String(
          request.query || this.config.defaults.weatherQuery || "",
        ).trim();
        if (!query) {
          return {
            ok: false,
            title: "实时天气",
            text: "缺少地区参数，请提供地区，例如 杭州、北京海淀。",
            noticeInstruction:
              "用户想查询天气，但没有提供地区。请自然提醒他补一个地区，例如 杭州 或 北京海淀。",
          };
        }
        const result = (await client.utility.weatherRealtime({
          query: { query },
        })) as any;
        const data = result?.data;
        const lines = [
          `地区：${data?.location?.name || query}`,
          `天气：${data?.weather?.condition || ""} ${data?.weather?.temperature ?? ""}°C`,
          `湿度：${data?.weather?.humidity ?? ""}%`,
          `风向：${data?.weather?.wind_direction || ""} ${data?.weather?.wind_power || ""}`,
          `空气：AQI ${data?.air_quality?.aqi ?? ""} ${data?.air_quality?.quality || ""}`,
          `更新时间：${data?.weather?.updated || ""}`,
        ];
        if ((data?.alerts || []).length > 0) {
          const firstAlert = data.alerts[0];
          lines.push(
            `预警：${firstAlert.type}${firstAlert.level} ${firstAlert.detail}`,
          );
        }
        return {
          ok: true,
          title: "实时天气",
          text: buildLines("实时天气", lines),
          imageUrl: this.config.behavior.includeImages
            ? firstImage(data?.weather?.weather_icon)
            : undefined,
        };
      }
      case "moyu_daily": {
        const result = (await client.utility.moyu()) as any;
        const data = result?.data;
        const lines = [
          `公历：${data?.date?.gregorian || ""} ${data?.date?.weekday || ""}`,
          `周进度：${data?.progress?.week?.percentage ?? ""}%`,
          `月进度：${data?.progress?.month?.percentage ?? ""}%`,
          `年进度：${data?.progress?.year?.percentage ?? ""}%`,
          `距离周末：${data?.countdown?.toWeekEnd ?? ""} 天`,
          `距离月底：${data?.countdown?.toMonthEnd ?? ""} 天`,
          `距离年底：${data?.countdown?.toYearEnd ?? ""} 天`,
          `摸鱼语录：${data?.moyuQuote || ""}`,
        ];
        if (data?.nextHoliday?.name) {
          lines.push(
            `下个假期：${data.nextHoliday.name} (${data.nextHoliday.date})，还有 ${data.nextHoliday.until} 天`,
          );
        }
        return {
          ok: true,
          title: "摸鱼日报",
          text: buildLines("摸鱼日报", lines),
        };
      }
      default:
        return {
          ok: false,
          title: "60s",
          text: "暂不支持这个查询类型。",
          noticeInstruction:
            "用户请求了 60s 插件暂不支持的类型。请简短说明当前支持新闻、AI 快报、汇率、历史、Epic、IT、金价、油价、天气和摸鱼日报。",
        };
    }
  }

  async sendReport(
    ctx: any,
    event: any,
    request: SixtySecondsRenderRequest,
  ): Promise<SixtySecondsRenderResult> {
    let result: SixtySecondsRenderResult;

    try {
      result = await this.renderReport(request);
    } catch (error) {
      result = {
        ok: false,
        title: "60s",
        text: "60s 查询失败，请稍后再试，或者检查 60s 服务地址是否可用。",
        noticeInstruction: `60s 插件请求失败，错误信息：${error}。请自然告知用户稍后重试，或让管理员检查 60s 服务地址和网络连接。`,
      };
    }

    if (!result.ok) {
      await this.notifyByAI(
        ctx,
        event,
        result.noticeInstruction || result.text,
        result.text,
      );
      return result;
    }

    await replyWithImage({
      ctx,
      event,
      text: result.text,
      imageUrl: result.imageUrl,
      quoteReply: this.config.behavior.quoteReply,
    });
    return result;
  }
}

export function parseReportType(input: string): SixtySecondsReportType | null {
  const normalized = String(input || "")
    .trim()
    .toLowerCase();
  switch (normalized) {
    case "新闻":
    case "世界":
    case "world_news":
    case "news":
      return "world_news";
    case "ai":
    case "ai新闻":
    case "ai资讯":
    case "ai_news":
      return "ai_news";
    case "汇率":
    case "exchange":
    case "exchange_rate":
      return "exchange_rate";
    case "历史":
    case "today":
    case "history":
      return "history";
    case "epic":
    case "epic_games":
      return "epic_games";
    case "it":
    case "it资讯":
    case "it_news":
      return "it_news";
    case "金价":
    case "gold":
    case "gold_price":
      return "gold_price";
    case "油价":
    case "fuel":
    case "fuel_price":
      return "fuel_price";
    case "天气":
    case "weather":
      return "weather";
    case "摸鱼":
    case "moyu":
    case "moyu_daily":
      return "moyu_daily";
    default:
      return null;
  }
}

export function buildHelpText(prefix: string): string {
  return [
    "60s 插件支持这些命令：",
    `${prefix}`,
    `${prefix} 新闻 [日期]`,
    `${prefix} ai [日期]`,
    `${prefix} 汇率 [货币代码]`,
    `${prefix} 历史 [日期]`,
    `${prefix} epic`,
    `${prefix} it [条数]`,
    `${prefix} 金价`,
    `${prefix} 油价 [地区]`,
    `${prefix} 天气 [地区]`,
    `${prefix} 摸鱼`,
  ].join("\n");
}
