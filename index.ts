import { definePlugin, type MiokuContext } from "mioku";
import { SixtySecondsService } from "mioku-service-60s";
import { getService, Services } from "mioku";
import { SIXTY_SECONDS_BASE_CONFIG } from "./configs/base";
import { matchSixtySecondsCommand } from "./utils/commands";
import { SixtySecondsPluginRuntime } from "./utils/runtime-core";
import type { SixtySecondsBaseConfig } from "./types";
import { createSixtySecondsSkills } from "./skills/sixty-seconds";

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

  async setup(ctx: MiokuContext) {
    const sixtySecondsService = getService(ctx, SixtySecondsService);
    const configService = getService(ctx, Services.Config);
    const aiService = getService(ctx, Services.AI);
    const screenshotService = getService(ctx, Services.Screenshot);

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
        screenshotService,
      },
      config: baseConfig,
    });

    if (!screenshotService) {
      ctx.logger.warn("screenshot 服务未注入，60s 将回退为文本发送");
    }

    if (aiService) {
      for (const skill of createSixtySecondsSkills(runtime)) aiService.registerSkill(skill);
    }

    const disposers: Array<() => void> = [];
    if (configService) {
      disposers.push(
        configService.onConfigChange("60s", "base", (next) => {
          baseConfig = next as SixtySecondsBaseConfig;
          runtime.updateConfig(baseConfig);
        }),
      );
    }

    ctx.handle("message", async (event) => {
      const rawText = ctx.text(event)?.trim();
      if (!rawText) {
        return;
      }
      const stripResult = stripCommandPrefix(
        rawText,
        baseConfig.trigger.prefixes,
      );
      let commandText = rawText;
      if (stripResult.hasPrefix) {
        commandText = stripResult.value || "60s";
      }

      const sender = event.sender;
      const userNickname =
        (sender && "card" in sender ? sender.card : undefined) || sender?.nickname || undefined;
      const matched = matchSixtySecondsCommand(commandText, userNickname);
      if (!matched) {
        return;
      }

      runtime.updateServices({
        sixtySecondsService,
        aiService,
        screenshotService:
          getService(ctx, Services.Screenshot) || screenshotService,
      });

      await runtime.sendReport(ctx, event, {
        type: matched.reportType,
        ...matched.requestOverrides,
      });
    });

    return () => {
      for (const dispose of disposers) dispose();
      if (aiService) aiService.removeSkill("sixty_seconds");
    };
  },
});
