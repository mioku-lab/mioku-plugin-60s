import type { SixtySecondsBaseConfig } from "../types";

export const SIXTY_SECONDS_BASE_CONFIG: SixtySecondsBaseConfig = {
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
