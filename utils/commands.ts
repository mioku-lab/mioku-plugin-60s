import type { SixtySecondsReportType } from "../types";

export interface MatchedSixtySecondsCommand {
  reportType: SixtySecondsReportType;
  requestOverrides: {
    region?: string;
    query?: string;
  };
}

function normalizeText(input: string): string {
  return String(input || "").trim();
}

function normalizeLower(input: string): string {
  return normalizeText(input).toLowerCase();
}

function extractRegionBySuffix(input: string, suffix: string): string | null {
  const text = normalizeText(input);
  if (!text.endsWith(suffix)) {
    return null;
  }
  return text.slice(0, -suffix.length).trim();
}

export function matchSixtySecondsCommand(
  input: string,
  userNickname?: string,
): MatchedSixtySecondsCommand | null {
  const raw = normalizeText(input);
  if (!raw) {
    return null;
  }

  const normalized = normalizeLower(raw);

  if (normalized === "60s" || normalized === "/60s") {
    return {
      reportType: "world_news",
      requestOverrides: {},
    };
  }

  if (normalized === "it") {
    return {
      reportType: "it_news",
      requestOverrides: {},
    };
  }

  if (normalized === "金价") {
    return {
      reportType: "gold_price",
      requestOverrides: {},
    };
  }

  if (normalized === "摸鱼日报") {
    return {
      reportType: "moyu_daily",
      requestOverrides: {},
    };
  }

  if (normalized === "epic") {
    return {
      reportType: "epic_games",
      requestOverrides: {},
    };
  }

  if (normalized === "历史上的今天") {
    return {
      reportType: "history",
      requestOverrides: {},
    };
  }

  if (normalized === "ai") {
    return {
      reportType: "ai_news",
      requestOverrides: {},
    };
  }

  const fuelRegion = extractRegionBySuffix(raw, "油价");
  if (fuelRegion !== null) {
    return {
      reportType: "fuel_price",
      requestOverrides: {
        region: fuelRegion || undefined,
      },
    };
  }

  const weatherRegion = extractRegionBySuffix(raw, "天气");
  if (weatherRegion !== null) {
    return {
      reportType: "weather",
      requestOverrides: {
        query: weatherRegion || undefined,
      },
    };
  }

  if (normalized === "热搜") {
    return {
      reportType: "hot_search",
      requestOverrides: {},
    };
  }

  if (normalized === "一言") {
    return {
      reportType: "hitokoto",
      requestOverrides: {},
    };
  }

  if (normalized === "疯狂星期四" || normalized === "kfc") {
    return {
      reportType: "kfc",
      requestOverrides: {},
    };
  }

  if (normalized.startsWith("答案之书")) {
    const query = normalized.slice(4).trim();
    return {
      reportType: "answer_book",
      requestOverrides: {
        query: query || undefined,
      },
    };
  }

  if (normalized.startsWith("发病")) {
    const atMatch = raw.match(/@(\S+)/);
    let name = "";
    if (atMatch) {
      name = atMatch[1];
    } else {
      const afterKeyword = normalized.slice(2).trim();
      if (afterKeyword) {
        name = afterKeyword;
      }
    }
    if (!name && userNickname) {
      name = userNickname;
    }
    return {
      reportType: "sickness_essay",
      requestOverrides: {
        query: name || undefined,
      },
    };
  }

  if (normalized.startsWith("/whois")) {
    const domain = normalized.slice(6).trim();
    return {
      reportType: "whois",
      requestOverrides: {
        query: domain || undefined,
      },
    };
  }

  return null;
}
