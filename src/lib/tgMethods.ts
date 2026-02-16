import { Api } from "telegram";
import { getBotClient, getUserClient } from "./tgClient";
import {
  ChannelStats,
  HourlyViewsSeries,
  LanguageShare,
} from "@/types/channel";
import { InlineKeyboard } from "grammy";
import { DealRole } from "@/types/deal";

export async function verifyBotIsAdmin(chatId: string) {
  const { bot, botId } = await getBotClient();

  const member = await bot.api.getChatMember(chatId, botId);

  const isAdmin = ["administrator", "creator"].includes(member.status);

  if (!isAdmin) {
    throw new Error("Bot is not admin in this channel");
  }

  const rights = member as any;

  const requiredPermissions = [
    { key: "can_post_messages", label: "Post Messages" },
    { key: "can_post_stories", label: "Post Stories" },
    { key: "can_invite_users", label: "Invite Users" },
    { key: "can_promote_members", label: "Add Admins" },
  ] as const;

  const missingPermissions = requiredPermissions
    .filter(({ key }) => !rights?.[key])
    .map(({ label }) => label);

  if (missingPermissions.length > 0) {
    throw new Error(
      `Bot is missing required permissions: ${missingPermissions.join(", ")}`,
    );
  }
}

export async function verifyUserIsOwner(chatId: string, userId: number) {
  const { bot } = await getBotClient();
  const member = await bot.api.getChatMember(chatId, userId);
  if (member.status !== "creator") {
    throw new Error("You are not the owner of this channel.");
  }
  return;
}

export async function verifyUserIsAdmin(
  chatId: number,
  userId: number,
  managerIds?: number[],
) {
  const { bot } = await getBotClient();
  try {
    const member = await bot.api.getChatMember(chatId, userId);
    const isAdmin =
      member?.status === "administrator" || member?.status === "creator";

    let updatedManagerIds = managerIds;

    if (!isAdmin && managerIds) {
      // Remove user from managers if no longer admin
      updatedManagerIds = managerIds.filter((id) => id !== userId);
    }

    return { isAdmin, updatedManagerIds };
  } catch (err) {
    console.error("Telegram admin verification failed:", err);
    return { isAdmin: true, updatedManagerIds: managerIds };
  }
}

async function uploadChatPhotoToImgBB(filePath: string) {
  try {
    // Telegram file URL
    const tgUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;

    // Download image from Telegram
    const tgRes = await fetch(tgUrl);
    if (!tgRes.ok) throw new Error("Failed to fetch Telegram image");

    const imageBuffer = await tgRes.arrayBuffer();

    // Prepare form data
    const formData = new FormData();
    formData.append("image", new Blob([imageBuffer]));
    formData.append("key", process.env.IMGBB_API_KEY!);

    // Upload to ImgBB
    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("ImgBB upload failed");

    const data = await res.json();
    return data.data.url;
  } catch (err) {
    console.error("Upload failed:", (err as any).message);
    return null;
  }
}

export async function getChannelDetails(chatId: string) {
  const { bot } = await getBotClient();
  let chat;
  let link;
  let photo;

  try {
    chat = await bot.api.getChat(chatId);
    if (chat.type === "private") {
      throw new Error("Invalid chat!");
    } else if (chat.type !== "channel") {
      throw new Error("Only channels can be listed, not groups!");
    }
  } catch {
    throw new Error("Invalid chat!");
  }

  if (chat.invite_link) {
    link = chat.invite_link;
  } else {
    try {
      link = await bot.api.exportChatInviteLink(chat.id);
    } catch {
      throw new Error("Bot is missing required permissions: Invite Users");
    }
  }

  if (chat.photo) {
    const file = await bot.api.getFile(chat.photo.big_file_id);
    photo = await uploadChatPhotoToImgBB(file.file_path!);
  } else {
    photo = null;
  }

  return {
    chatId: chat.id,
    title: chat.title,
    username: chat.username,
    photo,
    link,
  };
}

async function mapBroadcastStats(
  broadcastStats: Api.stats.BroadcastStats,
  boostsStatus: Api.premium.BoostsStatus,
  languagesGraph: Api.TypeStatsGraph,
): Promise<ChannelStats> {
  // --- Top Hours Graph ---
  const topHoursJson = JSON.parse(
    (broadcastStats.topHoursGraph as any).json.data,
  );
  const hoursColumn = topHoursJson.columns[0]; // x = 0-23
  const y0Column = topHoursJson.columns.find((c: any[]) => c[0] === "y0") || [];
  const y1Column = topHoursJson.columns.find((c: any[]) => c[0] === "y1") || [];

  const topHours: HourlyViewsSeries[] = hoursColumn
    .slice(1)
    .map((hour: number, i: number) => ({
      hour,
      currentWeek: y0Column[i + 1] ?? 0,
      previousWeek: y1Column[i + 1] ?? 0,
    }));

  // --- Languages Graph ---
  let languages: LanguageShare[] = [];

  if ((languagesGraph as any)?.json?.data) {
    const langJson = JSON.parse((languagesGraph as any).json.data);
    const langColumns: any[] = langJson.columns || [];
    const langNames: Record<string, string> = langJson.names || {};

    languages = langColumns
      .filter((c) => c[0] !== "x")
      .map((c) => {
        const key = c[0];
        const latestValue = c[c.length - 1];

        return {
          code: key,
          name: langNames[key] || key,
          part: latestValue,
        };
      })
      // Filter out languages that currently have 0 users
      .filter((lang) => lang.part > 0);
  }

  return {
    followers: {
      current: broadcastStats.followers.current,
      previous: broadcastStats.followers.previous,
    },
    viewsPerPost: {
      current: broadcastStats.viewsPerPost.current,
      previous: broadcastStats.viewsPerPost.previous,
    },
    sharesPerPost: {
      current: broadcastStats.sharesPerPost.current,
      previous: broadcastStats.sharesPerPost.previous,
    },
    reactionsPerPost: {
      current: broadcastStats.reactionsPerPost.current,
      previous: broadcastStats.reactionsPerPost.previous,
    },
    viewsPerStory: {
      current: broadcastStats.viewsPerStory.current,
      previous: broadcastStats.viewsPerStory.previous,
    },
    sharesPerStory: {
      current: broadcastStats.sharesPerStory.current,
      previous: broadcastStats.sharesPerStory.previous,
    },
    reactionsPerStory: {
      current: broadcastStats.reactionsPerStory.current,
      previous: broadcastStats.reactionsPerStory.previous,
    },
    enabledNotifications: {
      part: broadcastStats.enabledNotifications.part,
      total: broadcastStats.enabledNotifications.total,
    },
    premiumSubscribers: {
      part: boostsStatus.premiumAudience?.part ?? 0,
      total:
        boostsStatus.premiumAudience?.total ?? broadcastStats.followers.current,
    },
    topHours,
    topHoursDateRanges: {
      current: topHoursJson.names?.y0 || "Current week",
      previous: topHoursJson.names?.y1 || "Previous week",
    },
    languages,
    fetchedAt: new Date(),
  };
}

export async function getChannelStatistics(chatId: number, link: string) {
  const { bot } = await getBotClient();
  const { userbot, userbotId } = await getUserClient();
  let member;

  try {
    member = await bot.api.getChatMember(chatId, userbotId);
  } catch (error: any) {
    if (error.message?.includes("PARTICIPANT_ID_INVALID")) {
    } else {
      throw error;
    }
  }

  if (!member || !["administrator", "creator"].includes(member.status)) {
    if (!member || ["left", "kicked"].includes(member.status)) {
      // Try to unban userbot if banned
      if (member && member.status === "kicked") {
        try {
          await bot.api.unbanChatMember(chatId, userbotId);
        } catch {}
      }

      // Join channel on userbot account to fetch stats
      if (link.startsWith("https://t.me/+")) {
        // Extract the hash from the link
        const hash = link.split("t.me/+", 2)[1];

        // Join private channel using ImportChatInvite
        await userbot.invoke(new Api.messages.ImportChatInvite({ hash }));
      } else {
        // Join public channel using JoinChannel
        await userbot.invoke(new Api.channels.JoinChannel({ channel: link }));
      }
    }

    // Promote userbot with postMessages admin right to fetch channel stats
    await bot.api.promoteChatMember(chatId, userbotId, {
      can_manage_chat: true,
      can_post_messages: true,
    });
  } else if (!(member as any).can_post_messages) {
    // Promote userbot with postMessages admin right to fetch channel stats
    await bot.api.promoteChatMember(chatId, userbotId, {
      can_manage_chat: true,
      can_post_messages: true,
    });
  }

  const channel = await userbot.invoke(
    new Api.channels.GetFullChannel({ channel: chatId }),
  );

  if ((channel.fullChat as any).canViewStats) {
    const broadcastStats = await userbot.invoke(
      new Api.stats.GetBroadcastStats({
        dark: true,
        channel: chatId,
      }),
      (channel.fullChat as any).statsDc,
    );
    const boostsStatus = await userbot.invoke(
      new Api.premium.GetBoostsStatus({
        peer: chatId,
      }),
    );
    const languagesGraph = await userbot.invoke(
      new Api.stats.LoadAsyncGraph({
        token: (broadcastStats.languagesGraph as any).token,
      }),
      (channel.fullChat as any).statsDc,
    );

    const stats: ChannelStats = await mapBroadcastStats(
      broadcastStats,
      boostsStatus,
      languagesGraph,
    );
    return stats;
  } else {
    throw new Error("This channel does not have statistics");
  }
}

export async function getChannelAdmins(
  chatId: number,
  excludeAdmins: number[],
) {
  const { bot } = await getBotClient();

  const admins = await bot.api.getChatAdministrators(chatId);
  const filteredAdmins = admins
    .filter(
      (admin) =>
        !admin.user.is_bot &&
        admin.status !== "creator" &&
        !excludeAdmins.includes(admin.user.id),
    )
    .map((admin) => ({
      id: admin.user.id,
      first_name: admin.user.first_name,
      username: admin.user.username,
    }));
  return filteredAdmins;
}

export async function notifyAdSubmit(userId: number, dealId: string) {
  const { bot } = await getBotClient();
  const reply_markup = new InlineKeyboard().text(
    "Submit Ad",
    `submitAd|${dealId}`,
  );
  await bot.api.sendMessage(
    userId,
    "Click on below button to submit your ad.",
    {
      reply_markup,
    },
  );
}

export async function viewAdSubmit(
  userId: number,
  fromChatId: number,
  messageId: number,
  forward: boolean = false,
) {
  const { bot } = await getBotClient();
  if (forward) {
    await bot.api.forwardMessage(userId, fromChatId, messageId);
  } else {
    await bot.api.copyMessage(userId, fromChatId, messageId);
  }
}

export async function startChat(
  userId: number,
  dealId: string,
  partnerRole: DealRole,
) {
  const { bot } = await getBotClient();
  const reply_markup = new InlineKeyboard().text(
    "Start Chat",
    `startChat|${dealId}`,
  );
  await bot.api.sendMessage(
    userId,
    `Click on below button to start conversation with ${partnerRole === "advertiser" ? "Advertiser" : "Publisher"} of the <a href='https://t.me/${process.env.NEXT_PUBLIC_BOT_USERNAME}/deals?startapp=${dealId}'>deal</a>.`,
    { reply_markup, parse_mode: "HTML" },
  );
}
