import { definePlugin, type CommandDefinition, type MessageEvent, type MiokuContext } from "mioku";
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

export default definePlugin({
  name: "60s",

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

    const run = async (event: MessageEvent, text: string) => {
      const sender = event.sender;
      const userNickname =
        (sender && "card" in sender ? sender.card : undefined) || sender?.nickname || undefined;
      const matched = matchSixtySecondsCommand(text, userNickname);
      if (!matched) return;
      runtime.updateServices({
        sixtySecondsService,
        aiService,
        screenshotService: getService(ctx, Services.Screenshot) || screenshotService,
      });
      await runtime.sendReport(ctx, event, {
        type: matched.reportType,
        ...matched.requestOverrides,
      });
    };

    const cmd = (command: CommandDefinition) =>
      ctx.command({ ...command, prefixes: false });

    cmd({ name: "60s", description: "获取今日 60s 新闻简报", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "it", description: "获取实时 IT 资讯", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "金价", description: "获取黄金价格", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "摸鱼日报", description: "获取摸鱼日报", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "epic", description: "获取 Epic 免费游戏", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "历史上的今天", description: "获取历史上的今天", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "ai", description: "获取 AI 资讯快报", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "油价", match: /(.*)油价\s*$/, description: "获取汽油价格，如：杭州油价", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "天气", match: /(.*)天气\s*$/, description: "获取实时天气，如：北京天气", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "热搜", description: "获取微博、抖音、百度等热搜榜单", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "一言", description: "随机获取一句名言", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "疯狂星期四", match: /^(?:疯狂星期四|kfc)\s*$/i, description: "获取 KFC 疯狂星期四文案", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "答案之书", match: /^答案之书/, description: "随机获取答案", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "发病", match: /^发病/, description: "生成发病文学", handler: ({ event, body }) => run(event, body) });
    cmd({ name: "whois", match: /^\/whois(?:\s|$)/, description: "查询域名 Whois 信息", handler: ({ event, body }) => run(event, body) });

    return () => {
      for (const dispose of disposers) dispose();
      if (aiService) aiService.removeSkill("sixty_seconds");
    };
  },
});
