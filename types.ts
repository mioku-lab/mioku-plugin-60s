import type { SixtySecondsService } from "../../src/services/60s";
import type { AIService } from "../../src/services/ai/types";
import type { ScreenshotService } from "../../src/services/screenshot/types";

export interface SixtySecondsApiConfig {
  baseUrl: string;
  timeoutMs: number;
}

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
  api: SixtySecondsApiConfig;
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
  | "moyu_daily";

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
}
