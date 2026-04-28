import type { SixtySecondsClient } from "../../../src/services/60s";
import type {
  SixtySecondsBaseConfig,
  SixtySecondsPluginServices,
  SixtySecondsRenderRequest,
  SixtySecondsRenderResult,
} from "../types";
import {
  replyWithForwardNodes,
  replyWithImage,
  replyWithParts,
} from "./messages";
import { renderSixtySecondsReport } from "./renderers";

function normalizeBaseUrl(value: string): string {
  return String(value || "")
    .trim()
    .replace(/\/+$/, "");
}

function cloneConfig<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function shouldUseScreenshot(result: SixtySecondsRenderResult): boolean {
  return Boolean(result.preferScreenshot && (result.markdown || result.html));
}

export class SixtySecondsPluginRuntime {
  private services: SixtySecondsPluginServices;
  private config: SixtySecondsBaseConfig;

  constructor(options: {
    services: SixtySecondsPluginServices;
    config: SixtySecondsBaseConfig;
  }) {
    this.services = options.services;
    this.config = cloneConfig(options.config);
  }

  updateConfig(nextConfig: SixtySecondsBaseConfig): void {
    this.config = cloneConfig(nextConfig);
  }

  updateServices(nextServices: SixtySecondsPluginServices): void {
    this.services = nextServices;
  }

  private getClient(): SixtySecondsClient {
    const service = this.services.sixtySecondsService;
    if (!service) {
      throw new Error("60s-service 未加载");
    }

    return service.createClient({
      baseUrl: normalizeBaseUrl(this.config.api.baseUrl),
      timeoutMs: this.config.api.timeoutMs,
      defaultEncoding: "json",
    });
  }

  private getScreenshotService() {
    return this.services.screenshotService;
  }

  async notifyByAI(
    ctx: any,
    event: any,
    instruction: string,
    fallbackMessage: string,
    error?: unknown,
  ): Promise<void> {
    if (error != null) {
      ctx.logger.error(`60s 处理失败: ${String(error)}`);
    }
    const chatRuntime = this.services.aiService?.getChatRuntime();
    if (chatRuntime) {
      try {
        await chatRuntime.generateNotice({
          event,
          instruction,
          send: true,
          promptInjections: [
            {
              title: "60s Plugin Error Handling",
              content:
                "You are responding for the 60s plugin. Keep replies brief, natural, and actionable. When parameters are missing, ask only for the missing value. If the user provides the missing parameter in follow-up, directly call the matching tool and return the final result.",
            },
          ],
        });
        return;
      } catch (noticeError) {
        ctx.logger.error(`60s notice 发送失败 ${noticeError}`);
      }
    }

    await replyWithParts({
      ctx,
      event,
      parts: [fallbackMessage],
      quoteReply: this.config.behavior.quoteReply,
    });
  }

  async renderReport(
    request: SixtySecondsRenderRequest,
  ): Promise<SixtySecondsRenderResult> {
    const client = this.getClient();
    return renderSixtySecondsReport({
      client,
      request,
      config: this.config,
    });
  }

  private async sendScreenshotFromMarkdown(
    ctx: any,
    event: any,
    markdown: string,
  ): Promise<void> {
    const screenshotService = this.getScreenshotService();
    if (!screenshotService) {
      throw new Error("screenshot-service 未加载");
    }
    const imagePath = await screenshotService.screenshotMarkdown(markdown, {
      fullPage: true,
      type: "png",
    });
    await replyWithImage({
      ctx,
      event,
      text: "",
      imageUrl: imagePath,
      quoteReply: this.config.behavior.quoteReply,
    });
  }

  private async sendScreenshotFromHtml(
    ctx: any,
    event: any,
    html: string,
    options?: SixtySecondsRenderResult["screenshotOptions"],
  ): Promise<void> {
    const screenshotService = this.getScreenshotService();
    if (!screenshotService) {
      throw new Error("screenshot-service 未加载");
    }
    const imagePath = await screenshotService.screenshot(html, {
      width: options?.width,
      height: options?.height,
      fullPage: options?.fullPage ?? true,
      quality: options?.quality,
      type: options?.type || "png",
    });
    await replyWithImage({
      ctx,
      event,
      text: "",
      imageUrl: imagePath,
      quoteReply: this.config.behavior.quoteReply,
    });
  }

  async sendReport(
    ctx: any,
    event: any,
    request: SixtySecondsRenderRequest,
  ): Promise<SixtySecondsRenderResult> {
    let result: SixtySecondsRenderResult;

    try {
      result = await this.renderReport(request);
    } catch (error) {
      ctx.logger.error(`60s 请求失败: ${String(error)}`);
      result = {
        ok: false,
        title: "60s",
        text: "60s 查询失败，请稍后再试，或者检查 60s 服务地址是否可用。",
        noticeInstruction: `60s 插件请求失败，错误信息：${error}。请自然告知用户稍后重试，或让管理员检查 60s 服务地址和网络连接。`,
      };
    }

    if (!result.ok) {
      if (result.noticeInstruction) {
        await this.notifyByAI(
          ctx,
          event,
          result.noticeInstruction,
          result.text,
        );
        return result;
      }

      await replyWithParts({
        ctx,
        event,
        parts: [result.text],
        quoteReply: this.config.behavior.quoteReply,
      });
      return result;
    }

    if (Array.isArray(result.forwardNodes) && result.forwardNodes.length > 0) {
      try {
        await replyWithForwardNodes({
          ctx,
          event,
          nodes: result.forwardNodes,
        });
        return result;
      } catch (error) {
        ctx.logger.error(`60s 合并转发发送失败，回退文本发送: ${error}`);
      }
    }

    if (shouldUseScreenshot(result)) {
      try {
        if (result.html) {
          await this.sendScreenshotFromHtml(
            ctx,
            event,
            result.html,
            result.screenshotOptions,
          );
        } else if (result.markdown) {
          await this.sendScreenshotFromMarkdown(ctx, event, result.markdown);
        }
        return result;
      } catch (error) {
        ctx.logger.error(`60s 截图发送失败，回退文本发送: ${error}`);
      }
    }

    await replyWithImage({
      ctx,
      event,
      text: result.markdown || result.text,
      imageUrl: result.imageUrl,
      quoteReply: this.config.behavior.quoteReply,
    });
    return result;
  }
}
