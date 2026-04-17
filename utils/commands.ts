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

  return null;
}
