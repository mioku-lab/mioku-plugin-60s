import type { SixtySecondsBaseConfig } from "../types";

export const SIXTY_SECONDS_BASE_CONFIG: SixtySecondsBaseConfig = {
  api: {
    baseUrl: "https://60s.viki.moe",
    timeoutMs: 15000,
  },
  trigger: {
    requirePrefix: false,
    prefixes: ["60s", "/60s"],
  },
  behavior: {
    quoteReply: false,
    includeImages: false,
    maxItems: 6,
  },
  defaults: {
    exchangeCurrency: "CNY",
    fuelRegion: "",
    weatherQuery: "",
    itNewsLimit: 5,
  },
};
