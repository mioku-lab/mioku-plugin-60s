import type { SixtySecondsClient } from "../../../src/services/60s";
import type {
  SixtySecondsBaseConfig,
  SixtySecondsRenderRequest,
  SixtySecondsRenderResult,
} from "../types";
import { buildMoyuDailyHtml, buildWeatherAppHtml } from "./html-cards";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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

function markdownSection(title: string, lines: string[]): string {
  const filtered = lines.filter(Boolean);
  return [`## ${title}`, "", ...filtered].join("\n");
}

function markdownNumbered(title: string, items: string[]): string {
  const numbered = items.map((item, index) => `${index + 1}. ${item}`);
  return markdownSection(title, numbered);
}

function markdownBulleted(title: string, items: string[]): string {
  const bulleted = items.map((item) => `- ${item}`);
  return markdownSection(title, bulleted);
}

function markdownQuote(lines: string[]): string {
  const filtered = lines.filter(Boolean);
  return filtered.map((line) => `> ${line}`).join("\n");
}

function escapeTableCell(value: unknown): string {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

function markdownTable(
  title: string,
  headers: string[],
  rows: Array<Array<unknown>>,
): string {
  const headerLine = `| ${headers.map((item) => escapeTableCell(item)).join(" | ")} |`;
  const dividerLine = `| ${headers.map(() => "---").join(" | ")} |`;
  const bodyLines = rows.map(
    (row) => `| ${row.map((item) => escapeTableCell(item)).join(" | ")} |`,
  );
  return markdownSection(title, [headerLine, dividerLine, ...bodyLines]);
}

function buildMarkdownCard(title: string, sections: string[]): string {
  return [`# ${title}`, "", ...sections.filter(Boolean)].join("\n");
}

function firstString(values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function resolveWorldNewsImageUrl(data: any): string | undefined {
  const direct = firstString([
    data?.image,
    data?.image?.url,
    data?.imageUrl,
    data?.image_url,
    data?.cover,
    data?.img,
  ]);
  if (direct) {
    return direct;
  }

  if (Array.isArray(data?.images)) {
    const fromArray = firstString(data.images);
    if (fromArray) {
      return fromArray;
    }
  }

  if (Array.isArray(data?.media)) {
    const fromMedia = firstString(
      data.media.map((item: any) => item?.url || item?.image || item?.src),
    );
    if (fromMedia) {
      return fromMedia;
    }
  }

  return undefined;
}

function ensureMultiContent(request: SixtySecondsRenderRequest): boolean {
  switch (request.type) {
    case "gold_price":
    case "fuel_price":
    case "weather":
    case "world_news":
    case "ai_news":
    case "history":
    case "epic_games":
    case "it_news":
    case "exchange_rate":
    case "moyu_daily":
      return true;
    default:
      return false;
  }
}

export async function renderSixtySecondsReport(options: {
  client: SixtySecondsClient;
  request: SixtySecondsRenderRequest;
  config: SixtySecondsBaseConfig;
}): Promise<SixtySecondsRenderResult> {
  const { client, request, config } = options;
  const maxItems = clamp(config.behavior.maxItems || 6, 1, 20);

  switch (request.type) {
    case "world_news": {
      const result = (await client.periodic.daily60s()) as any;
      const data = result?.data;
      const imageUrl = resolveWorldNewsImageUrl(data);
      if (imageUrl) {
        return {
          ok: true,
          title: `60s 新闻 ${data?.date || ""}`.trim(),
          text: `60s 新闻 ${data?.date || ""}`.trim(),
          imageUrl,
          preferScreenshot: false,
        };
      }
      const newsItems = Array.isArray(data?.news)
        ? (data.news as string[])
        : [];
      const sections: string[] = [];
      sections.push(
        markdownBulleted(
          "今日新闻",
          limitItems(newsItems, maxItems).map((item) => `**${item}**`),
        ),
      );
      if (data?.tip) {
        sections.push(markdownSection("提示", [markdownQuote([data.tip])]));
      }
      return {
        ok: true,
        title: `60s 新闻 ${data?.date || ""}`.trim(),
        text: `60s 新闻 ${data?.date || ""}`.trim(),
        markdown: buildMarkdownCard(
          `60s 新闻 ${data?.date || ""}`.trim(),
          sections,
        ),
        preferScreenshot: true,
      };
    }
    case "ai_news": {
      const result = (await client.periodic.aiNews()) as any;
      const data = result?.data;
      const news = Array.isArray(data?.news) ? data.news : [];
      if (news.length === 0) {
        return {
          ok: true,
          title: "AI 资讯快报",
          text: `AI 资讯快报 ${data?.date || ""}\n今天暂无主流 AI 快报。`.trim(),
        };
      }
      const items = limitItems(news, maxItems).map(
        (item: any) =>
          `**${item.title || "未命名资讯"}**\n*来源：${item.source || "未知来源"}*\n链接：${item.link || "-"}`,
      );
      return {
        ok: true,
        title: `AI 资讯快报 ${data?.date || ""}`.trim(),
        text: `AI 资讯快报 ${data?.date || ""}`.trim(),
        markdown: buildMarkdownCard(`AI 资讯快报 ${data?.date || ""}`.trim(), [
          markdownNumbered("资讯列表", items),
        ]),
        preferScreenshot: true,
      };
    }
    case "exchange_rate": {
      const currency = normalizeCurrency(
        request.currency || config.defaults.exchangeCurrency,
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
      const rows = rates.map((item: any) => [item.currency, item.rate]);
      const infoLines = [
        `- **基准货币**：${data?.base_code || currency}`,
        `- **更新时间**：${data?.updated || ""}`,
      ];
      return {
        ok: true,
        title: "当日货币汇率",
        text: "当日货币汇率",
        markdown: buildMarkdownCard("当日货币汇率", [
          markdownSection("基础信息", infoLines),
          markdownTable("汇率表", ["货币", "汇率"], rows),
        ]),
        preferScreenshot: ensureMultiContent(request),
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
      const items = limitItems(data?.items || [], maxItems).map(
        (item: any) => `**${item.year}** · ${item.title}`,
      );
      const title = `历史上的今天 ${data?.date || ""}`.trim();
      return {
        ok: true,
        title,
        text: title,
        markdown: buildMarkdownCard(title, [
          markdownNumbered("历史事件", items),
        ]),
        preferScreenshot: true,
      };
    }
    case "epic_games": {
      const result = (await client.periodic.epicGames()) as any;
      const data = Array.isArray(result?.data) ? result.data : [];
      const limited = limitItems(data, maxItems);
      const rows = limited.map((item: any) => {
        const status = item.is_free_now ? "免费领取中" : "当前未免费";
        return [
          item.title || "-",
          item.original_price_desc || "-",
          status,
          item.free_end || "-",
        ];
      });
      const links = limited.map(
        (item: any) =>
          `- **${item.title || "未命名游戏"}**：${item.link || "-"}`,
      );
      const forwardNodes = limited.map((item: any) => {
        return {
          title: item.title || "未命名游戏",
          lines: [
            `发行厂商：${item.seller || "-"}`,
            `原价：${item.original_price_desc || "-"}`,
            `现价：${item.is_free_now ? "免费" : "非免费"}`,
            `免费开始：${item.free_start || "-"}`,
            `免费截止：${item.free_end || "-"}`,
            "",
            `${item.description || "暂无描述"}`,
          ],
          link: item.link || undefined,
          image: item.cover || undefined,
        };
      });
      return {
        ok: true,
        title: "Epic 免费游戏",
        text: "Epic 免费游戏",
        markdown: buildMarkdownCard("Epic 免费游戏", [
          markdownTable("游戏列表", ["名称", "原价", "状态", "截止"], rows),
          markdownSection("领取链接", links),
        ]),
        forwardNodes,
        preferScreenshot: true,
      };
    }
    case "it_news": {
      const limit = normalizeLimit(request.limit, config.defaults.itNewsLimit);
      const result = (await client.periodic.itNews({
        query: { limit },
      })) as any;
      const items = limitItems(result?.data || [], limit).map(
        (item: any) =>
          `**${item.title || "未命名资讯"}**\n*时间：${item.created || "-"}*\n链接：${item.link || "-"}`,
      );
      return {
        ok: true,
        title: "实时 IT 资讯",
        text: "实时 IT 资讯",
        markdown: buildMarkdownCard("实时 IT 资讯", [
          markdownNumbered("资讯列表", items),
        ]),
        preferScreenshot: true,
      };
    }
    case "gold_price": {
      const result = (await client.utility.goldPrice()) as any;
      const data = result?.data;
      const metalRows = limitItems(
        data?.metals || [],
        Math.min(maxItems, 8),
      ).map((item: any) => [
        item.name || "-",
        `${item.today_price ?? "-"}${item.unit || ""}`,
      ]);
      const storeRows = limitItems(
        data?.stores || [],
        Math.min(maxItems, 10),
      ).map((item: any) => [
        `${item.brand || ""}${item.product || ""}`.trim() || "-",
        item.formatted || "-",
      ]);
      const sections = [
        markdownSection("基础信息", [`- **日期**：${data?.date || ""}`]),
        markdownTable("黄金品类", ["品类", "价格"], metalRows),
      ];
      if (storeRows.length > 0) {
        sections.push(
          markdownTable("品牌金价", ["品牌/产品", "价格"], storeRows),
        );
      }
      return {
        ok: true,
        title: "黄金价格",
        text: "黄金价格",
        markdown: buildMarkdownCard("黄金价格", sections),
        preferScreenshot: true,
      };
    }
    case "fuel_price": {
      const region = String(
        request.region || config.defaults.fuelRegion || "",
      ).trim();
      if (!region) {
        return {
          ok: false,
          title: "汽油价格",
          text: "缺少地区参数，请提供地区，例如 杭州、成都郫县。",
          noticeInstruction:
            "你在 60s 插件中负责油价查询。当前用户缺少地区信息。请自然提醒他补一个地区，例如 杭州 或 成都郫县。如果用户在这次或下一次回复中直接给出了地区，请直接调用工具查询并回复结果，不要继续引导他发送特定指令格式。",
        };
      }
      const result = (await client.utility.fuelPrice({
        query: { region },
      })) as any;
      const data = result?.data;
      const rows = limitItems(data?.items || [], maxItems).map((item: any) => [
        item.name || "-",
        item.price_desc || "-",
      ]);
      const lines = [
        `- **地区**：${data?.region || region}`,
        `- **更新时间**：${data?.updated || ""}`,
      ];
      return {
        ok: true,
        title: "汽油价格",
        text: "汽油价格",
        markdown: buildMarkdownCard("汽油价格", [
          markdownSection("基础信息", lines),
          markdownTable("价格信息", ["油品", "价格"], rows),
        ]),
        preferScreenshot: true,
      };
    }
    case "weather": {
      const query = String(
        request.query || config.defaults.weatherQuery || "",
      ).trim();
      if (!query) {
        return {
          ok: false,
          title: "实时天气",
          text: "缺少地区参数，请提供地区，例如 杭州、北京海淀。",
          noticeInstruction:
            "你在 60s 插件中负责天气查询。当前用户缺少地区信息。请自然提醒他补一个地区，例如 杭州 或 北京海淀。如果用户在这次或下一次回复中直接给出了地区，请直接调用工具查询并回复结果，不要继续引导他发送特定指令格式。",
        };
      }
      const [realtimeResult, forecastResult] = await Promise.all([
        client.utility.weatherRealtime({
          query: { query },
        }),
        client.utility.weatherForecast({
          query: { query },
        }),
      ]);
      const data = (realtimeResult as any)?.data;
      const forecastData = (forecastResult as any)?.data;
      const lines = [
        `- **地区**：${data?.location?.name || query}`,
        `- **天气**：**${data?.weather?.condition || ""}** ${data?.weather?.temperature ?? ""}°C`,
        `- **湿度**：${data?.weather?.humidity ?? ""}%`,
        `- **风向**：${data?.weather?.wind_direction || ""} ${data?.weather?.wind_power || ""}`,
        `- **空气**：AQI ${data?.air_quality?.aqi ?? ""} ${data?.air_quality?.quality || ""}`,
        `- **更新时间**：${data?.weather?.updated || ""}`,
      ];
      const sections = [markdownSection("天气信息", lines)];
      if ((data?.alerts || []).length > 0) {
        const firstAlert = data.alerts[0];
        sections.push(
          markdownSection("天气预警", [
            markdownQuote([
              `${firstAlert.type || ""}${firstAlert.level || ""} ${firstAlert.detail || ""}`.trim(),
            ]),
          ]),
        );
      }
      return {
        ok: true,
        title: "实时天气",
        text: "实时天气",
        html: buildWeatherAppHtml(data, query, forecastData),
        screenshotOptions: {
          width: 420,
          height: 520,
          fullPage: true,
          type: "png",
        },
        markdown: buildMarkdownCard("实时天气", sections),
        preferScreenshot: true,
      };
    }
    case "moyu_daily": {
      const result = (await client.utility.moyu()) as any;
      const data = result?.data;
      const lines = [
        `- **公历**：${data?.date?.gregorian || ""} ${data?.date?.weekday || ""}`,
        `- **周进度**：${data?.progress?.week?.percentage ?? ""}%`,
        `- **月进度**：${data?.progress?.month?.percentage ?? ""}%`,
        `- **年进度**：${data?.progress?.year?.percentage ?? ""}%`,
        `- **距离周末**：${data?.countdown?.toWeekEnd ?? ""} 天`,
        `- **距离月底**：${data?.countdown?.toMonthEnd ?? ""} 天`,
        `- **距离年底**：${data?.countdown?.toYearEnd ?? ""} 天`,
      ];
      const quoteLines = data?.moyuQuote ? [data.moyuQuote] : [];
      if (data?.nextHoliday?.name) {
        lines.push(
          `- **下个假期**：${data.nextHoliday.name} (${data.nextHoliday.date})，还有 ${data.nextHoliday.until} 天`,
        );
      }
      return {
        ok: true,
        title: "摸鱼日报",
        text: "摸鱼日报",
        html: buildMoyuDailyHtml(data),
        screenshotOptions: {
          width: 760,
          height: 700,
          fullPage: true,
          type: "png",
        },
        markdown: buildMarkdownCard("摸鱼日报", [
          markdownSection("日报内容", lines),
          quoteLines.length > 0
            ? markdownSection("摸鱼语录", [markdownQuote(quoteLines)])
            : "",
        ]),
        preferScreenshot: true,
      };
    }
    default:
      return {
        ok: false,
        title: "60s",
        text: "暂不支持这个查询类型。",
        noticeInstruction:
          "用户请求了 60s 插件暂不支持的类型。请简短说明当前支持 60s、it、金价、地区+油价、地区天气、摸鱼日报、epic、历史上的今天、ai。",
      };
    case "whois": {
      const domain = String(request.query || "").trim();
      if (!domain) {
        return {
          ok: false,
          title: "Whois 查询",
          text: "缺少域名参数，请提供域名，例如 /whois example.com。",
          noticeInstruction:
            "你在 60s 插件中负责 Whois 查询。当前用户缺少域名信息。请自然提醒他补一个域名，例如 example.com。",
        };
      }
      const result = (await client.utility.whois({
        query: { domain },
      })) as any;
      const data = result?.data;
      const lines = [
        `- **域名**：${domain}`,
        `- **注册商**：${data?.registrar || "-"}`,
        `- **注册时间**：${data?.created || "-"}`,
        `- **到期时间**：${data?.expires || "-"}`,
        `- **DNS**：${data?.nameservers ? data.nameservers.join(", ") : "-"}`,
      ];
      if (data?.registrant?.name) {
        lines.push(`- **注册人**：${data.registrant.name}`);
      }
      if (data?.registrant?.organization) {
        lines.push(`- **组织**：${data.registrant.organization}`);
      }
      return {
        ok: true,
        title: "Whois 查询",
        text: "Whois 查询结果",
        markdown: buildMarkdownCard(`Whois: ${domain}`, [
          markdownSection("查询结果", lines),
        ]),
        preferScreenshot: true,
      };
    }
    case "hot_search": {
      const [
        douyinResult,
        rednoteResult,
        biliResult,
        weiboResult,
        baiduResult,
        zhihuResult,
      ] = await Promise.all([
        client.hot.douyin(),
        client.hot.rednote(),
        client.hot.bili(),
        client.hot.weibo(),
        client.hot.baiduHot(),
        client.hot.zhihu(),
      ]);
      const douyinData = ((douyinResult as any)?.data || []) as any[];
      const rednoteData = ((rednoteResult as any)?.data || []) as any[];
      const biliData = ((biliResult as any)?.data || []) as any[];
      const weiboData = ((weiboResult as any)?.data || []) as any[];
      const baiduData = ((baiduResult as any)?.data || []) as any[];
      const zhihuData = ((zhihuResult as any)?.data || []) as any[];
      const hotSearchData: {
        douyin: Array<{ word: string; hot_value: string | number }>;
        rednote: Array<{ word: string; hot_value: string | number }>;
        bili: Array<{ word: string; hot_value: string | number }>;
        weibo: Array<{ word: string; hot_value: string | number }>;
        baidu: Array<{ word: string; hot_value: string | number }>;
        zhihu: Array<{ word: string; hot_value: string | number }>;
      } = {
        douyin: douyinData.slice(0, 10).map((item) => ({
          word: item.title || "--",
          hot_value: item.hot_value || "",
        })),
        rednote: rednoteData.slice(0, 10).map((item) => ({
          word: item.title || "--",
          hot_value: item.score || "",
        })),
        bili: biliData
          .slice(0, 10)
          .map((item) => ({ word: item.title || "--", hot_value: "" })),
        weibo: weiboData.slice(0, 10).map((item) => ({
          word: item.title || "--",
          hot_value: item.hot_value || "",
        })),
        baidu: baiduData.slice(0, 10).map((item) => ({
          word: item.title || "--",
          hot_value: item.score_desc || "",
        })),
        zhihu: zhihuData.slice(0, 10).map((item) => ({
          word: item.title || "--",
          hot_value: item.熱度 || "",
        })),
      };
      const { buildHotSearchHtml } = await import("./html-cards");
      return {
        ok: true,
        title: "热搜",
        text: "热搜榜单",
        html: buildHotSearchHtml(hotSearchData),
        screenshotOptions: {
          width: 800,
          height: 900,
          type: "png",
        },
        markdown: buildMarkdownCard("热搜", []),
        preferScreenshot: true,
      };
    }
    case "hitokoto": {
      try {
        const response = await fetch("https://v1.hitokoto.cn/?c=i&c=j&c=h&c=k");
        const hitokotoData = (await response.json()) as any;
        const sentence = hitokotoData?.hitokoto || "获取一言失败";
        return {
          ok: true,
          title: "一言",
          text: sentence,
        };
      } catch {
        return {
          ok: false,
          title: "一言",
          text: "获取一言失败，请稍后重试",
        };
      }
    }
    case "kfc": {
      const result = (await client.entertainment.randomKfcCopywriting()) as any;
      const data = result?.data;
      const copywriting =
        data?.kfc || data?.copywriting || data || "获取 KFC 文案失败";
      return {
        ok: true,
        title: "疯狂星期四",
        text: String(copywriting),
      };
    }
    case "answer_book": {
      const result = (await client.entertainment.answerBook({
        query: request.query ? { question: request.query } : undefined,
      })) as any;
      const data = result?.data;
      const answer = data?.answer || data || "获取答案失败";
      return {
        ok: true,
        title: "答案之书",
        text: String(answer),
      };
    }
    case "sickness_essay": {
      const result = (await client.entertainment.randomSicknessEssay({
        query: request.query ? { name: request.query } : undefined,
      })) as any;
      const data = result?.data;
      const essay = data?.saying || data?.essay || data || "获取发病文学失败";
      return {
        ok: true,
        title: "发病文学",
        text: String(essay),
      };
    }
  }
}
