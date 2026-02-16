import { Bot } from "grammy";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const API_ID = Number(process.env.TG_API_ID!);
const API_HASH = process.env.TG_API_HASH!;
const BOT_TOKEN = process.env.BOT_TOKEN!;
const STRING_SESSION = new StringSession(process.env.SESSION_STRING || "");

// Prevent multiple instances in Next.js dev mode
const globalForTelegram = global as unknown as {
  bot?: Bot;
  botId?: number;
  userbot?: TelegramClient;
  userbotId?: number;
};

export async function getBotClient() {
  if (!globalForTelegram.bot) {
    globalForTelegram.bot = new Bot(BOT_TOKEN);
  }
  if (!globalForTelegram.botId) {
    globalForTelegram.botId = Number(BOT_TOKEN.split(":")[0]);
  }
  return { bot: globalForTelegram.bot, botId: globalForTelegram.botId };
}

export async function getUserClient() {
  // Return existing client if already connected
  if (globalForTelegram.userbot?.connected) {
    if (!globalForTelegram.userbotId) {
      globalForTelegram.userbotId = Number(
        (await globalForTelegram.userbot.getMe()).id,
      );
    }
    return {
      userbot: globalForTelegram.userbot,
      userbotId: globalForTelegram.userbotId,
    };
  }

  // Initialize if not exists
  if (!globalForTelegram.userbot) {
    globalForTelegram.userbot = new TelegramClient(
      STRING_SESSION,
      API_ID,
      API_HASH,
      { connectionRetries: 5 },
    );
  }

  // Connect if disconnected
  if (!globalForTelegram.userbot.connected) {
    await globalForTelegram.userbot.connect();
  }
  if (!globalForTelegram.userbotId) {
    globalForTelegram.userbotId = Number(
      (await globalForTelegram.userbot.getMe()).id,
    );
  }

  return {
    userbot: globalForTelegram.userbot,
    userbotId: globalForTelegram.userbotId,
  };
}
