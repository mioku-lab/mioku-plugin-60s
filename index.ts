import type { AIService } from "../../src/services/ai/types";
import type { ConfigService } from "../../src/services/config/tpyes";
import type { SixtySecondsService } from "../../src/services/60s";
import { definePlugin, type MiokiContext } from "mioki";
import { SIXTY_SECONDS_BASE_CONFIG } from "./configs/base";
import { parseReportType, SixtySecondsPluginRuntime } from "./shared";
import {
  resetSixtySecondsRuntimeState,
  setSixtySecondsRuntimeState,
} from "./runtime";
import type { SixtySecondsBaseConfig } from "./types";

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stripCommandPrefix(
  text: string,
  prefixes: string[],
): { value: string; hasPrefix: boolean } {
  const trimmed = String(text || "").trim();
  for (const prefix of prefixes) {
    if (trimmed.startsWith(prefix)) {
      return {
        value: trimmed.slice(prefix.length).trim(),
        hasPrefix: true,
      };
    }
  }
  return { value: trimmed, hasPrefix: false };
}

export default definePlugin({
  name: "60s",
  version: "1.0.0",
  description: "调用 60s API 获取新闻、汇率、天气和摸鱼日报等信息",

  async setup(ctx: MiokiContext) {
    const sixtySecondsService = ctx.services?.["60s"] as
      | SixtySecondsService
      | undefined;
    const configService = ctx.services?.config as ConfigService | undefined;
    const aiService = ctx.services?.ai as AIService | undefined;

    let baseConfig = cloneConfig(SIXTY_SECONDS_BASE_CONFIG);

    if (configService) {
      await configService.registerConfig("60s", "base", baseConfig);
      const nextBase = await configService.getConfig("60s", "base");
      if (nextBase) {
        baseConfig = nextBase as SixtySecondsBaseConfig;
      }
    } else {
      ctx.logger.warn("config-service 未加载，60s 插件将使用内置默认配置");
    }

    const runtime = new SixtySecondsPluginRuntime({
      services: {
        sixtySecondsService,
        aiService,
      },
      config: baseConfig,
      logger: ctx.logger,
    });

    setSixtySecondsRuntimeState({ runtime });

    const disposers: Array<() => void> = [];
    if (configService) {
      disposers.push(
        configService.onConfigChange("60s", "base", (next) => {
          baseConfig = next as SixtySecondsBaseConfig;
          runtime.updateConfig(baseConfig);
        }),
      );
    }

    ctx.handle("message", async (event: any) => {
      const rawText = ctx.text(event)?.trim();
      if (!rawText) {
        return;
      }

      const stripResult = stripCommandPrefix(
        rawText,
        baseConfig.trigger.prefixes,
      );

      let commandText = "";

      if (stripResult.hasPrefix) {
        commandText = stripResult.value;
      } else {
        commandText = rawText;
      }

      if (!commandText) {
        await runtime.sendReport(ctx, event, {
          type: "world_news",
        });
        return;
      }

      const reportType = parseReportType(commandText);
      if (!reportType) {
        return;
      }

      if (reportType === "it_news") {
        await runtime.sendReport(ctx, event, {
          type: reportType,
        });
        return;
      }

      if (reportType === "fuel_price") {
        await runtime.sendReport(ctx, event, {
          type: reportType,
        });
        return;
      }

      if (reportType === "weather") {
        await runtime.sendReport(ctx, event, {
          type: reportType,
        });
        return;
      }

      if (reportType === "world_news") {
        await runtime.sendReport(ctx, event, {
          type: reportType,
        });
        return;
      }

      if (reportType === "ai_news") {
        await runtime.sendReport(ctx, event, {
          type: reportType,
        });
        return;
      }

      if (reportType === "history") {
        await runtime.sendReport(ctx, event, {
          type: reportType,
        });
        return;
      }

      await runtime.sendReport(ctx, event, {
        type: reportType,
      });
    });

    return () => {
      for (const dispose of disposers) {
        dispose();
      }
      resetSixtySecondsRuntimeState();
    };
  },
});
