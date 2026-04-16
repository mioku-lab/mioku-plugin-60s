import * as fs from "fs/promises";
import * as path from "path";

export async function replyWithParts(options: {
  ctx: any;
  event: any;
  parts: any[];
  quoteReply?: boolean;
}): Promise<void> {
  const { event, parts, quoteReply = false } = options;
  const payload = [...parts];
  if (quoteReply && event?.message_id != null) {
    payload.unshift({ type: "reply", id: String(event.message_id) });
  }
  await event.reply(payload.length === 1 ? payload[0] : payload);
}

export async function replyWithImage(options: {
  ctx: any;
  event: any;
  text: string;
  imageUrl?: string;
  quoteReply?: boolean;
}): Promise<void> {
  const { ctx, event, text, imageUrl, quoteReply = false } = options;
  if (!imageUrl) {
    const parts: any[] = text ? [text] : [];
    await replyWithParts({ ctx, event, parts, quoteReply });
    return;
  }

  const primaryImage = toImageSegment(ctx, imageUrl);
  try {
    await replyWithParts({
      ctx,
      event,
      parts: [primaryImage],
      quoteReply,
    });
    return;
  } catch (error) {
    if (!isLocalPath(imageUrl)) {
      throw error;
    }
  }

  const imageBuffer = await fs.readFile(imageUrl);
  const base64Image = `base64://${imageBuffer.toString("base64")}`;
  await replyWithParts({
    ctx,
    event,
    parts: [toImageSegment(ctx, base64Image)],
    quoteReply,
  });
}

function isLocalPath(file: string): boolean {
  if (!file) {
    return false;
  }
  if (file.startsWith("file://")) {
    return true;
  }
  if (file.startsWith("base64://")) {
    return false;
  }
  if (file.startsWith("http://") || file.startsWith("https://")) {
    return false;
  }
  return path.isAbsolute(file);
}

function toImageSegment(ctx: any, file: string): any {
  if (ctx?.segment?.image) {
    return ctx.segment.image(file);
  }
  return { type: "image", file };
}
