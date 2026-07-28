import type { AIService, ScreenshotService } from "mioku";
import type { SixtySecondsService } from "mioku-service-60s";

export interface SixtySecondsTriggerConfig {
  requirePrefix: boolean;
  prefixes: string[];
}

export interface SixtySecondsBehaviorConfig {
  quoteReply: boolean;
  includeImages: boolean;
  maxItems: number;
}

export interface SixtySecondsDefaultsConfig {
  exchangeCurrency: string;
  fuelRegion: string;
  weatherQuery: string;
  itNewsLimit: number;
}

export interface SixtySecondsBaseConfig {
  trigger: SixtySecondsTriggerConfig;
  behavior: SixtySecondsBehaviorConfig;
  defaults: SixtySecondsDefaultsConfig;
}

export type SixtySecondsReportType =
  | "world_news"
  | "ai_news"
  | "exchange_rate"
  | "history"
  | "epic_games"
  | "it_news"
  | "gold_price"
  | "fuel_price"
  | "weather"
  | "moyu_daily"
  | "hot_search"
  | "whois"
  | "hitokoto"
  | "kfc"
  | "answer_book"
  | "sickness_essay";

export interface SixtySecondsPluginServices {
  sixtySecondsService?: SixtySecondsService;
  aiService?: AIService;
  screenshotService?: ScreenshotService;
}

export interface SixtySecondsRenderRequest {
  type: SixtySecondsReportType;
  date?: string;
  currency?: string;
  region?: string;
  query?: string;
  limit?: number;
}

export interface SixtySecondsForwardNode {
  title?: string;
  lines: string[];
  link?: string;
  image?: string;
}

export interface SixtySecondsRenderScreenshotOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  quality?: number;
  type?: "png" | "jpeg" | "webp";
}

export interface SixtySecondsRenderResult {
  ok: boolean;
  title: string;
  text: string;
  markdown?: string;
  html?: string;
  imageUrl?: string;
  forwardNodes?: SixtySecondsForwardNode[];
  screenshotOptions?: SixtySecondsRenderScreenshotOptions;
  preferScreenshot?: boolean;
  noticeInstruction?: string;
  sentImageUrls?: string[];
}
