// index.js — discord.js v14
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Partials,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,   // wajib buat status
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember, Partials.User],
});

// ==== KONFIGURASI ====
const OWNER_ID = "535796365192724480";         // <— ganti pakai User ID lo
const TARGET_CHANNEL_ID = "1410904568857890902"; // opsional: biar selalu kirim ke channel ini
const COMMAND = "!statusbots";                  // command buat setup dashboard pertama kali

// Simpen info runtime
let dashboardMessageIds = [];          // 1 embed = 1 bot (Discord limit 10 embed/message)
let dashboardChannelId = null;
const lastState = new Map();           // botId -> { status, changedAt }

// ===== Helper =====
const statusEmoji = (s) =>
  s === "online" ? "🟢" : s === "idle" ? "🟡" : s === "dnd" ? "🔴" : "⚫️";

function fmtDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (!parts.length) parts.push(`${s}s`);
  return parts.join(" ");
}

function getActivityText(presence) {
  if (!presence?.activities?.length) return "—";
  const act = presence.activities.find(a => a.type === 0) || presence.activities[0];
  if (!act) return "—";
  // type 0 = Playing; 2 = Listening; 1 = Streaming; 4 = Custom
  const typeMap = { 0: "🎮 Playing", 1: "🔴 Streaming", 2: "🎵 Listening", 3: "🧩 Watching", 4: "✨ Status" };
  const label = typeMap[act.type] ?? "Activity";
  return `${label}: ${act.name ?? "—"}`;
}

function buildBotEmbed(member) {
  const status = member.presence?.status || "offline";
  const now = Date.now();
  const rec = lastState.get(member.id) || { status, changedAt: now };

  // kalau status berubah, update timestamp
  if (rec.status !== status) {
    lastState.set(member.id, { status, changedAt: now });
  } else if (!lastState.has(member.id)) {
    lastState.set(member.id, rec);
  }

  const sinceMs = now - (lastState.get(member.id)?.changedAt ?? now);
  const isUp = status === "online" || status === "idle" || status === "dnd";
  const color = status === "online" ? 0x2ecc71 : status === "idle" ? 0xf1c40f : status === "dnd" ? 0xe74c3c : 0x95a5a6;

  return new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setThumbnail(member.user.displayAvatarURL())
    .setColor(color)
    .setDescription(
      `${statusEmoji(status)} **${status.toUpperCase()}**\n` +
      `⏳ ${isUp ? "Uptime" : "Last Seen"}: \`${fmtDuration(sinceMs)}\`\n` +
      `${getActivityText(member.presence)}`
    )
    .setFooter({ text: `ID: ${member.id}` })
    .setTimestamp();
}

async function fetchAllBots(guild) {
  // pastikan cache keisi
  const members = await guild.members.fetch();
  return members.filter(m => m.user.bot);
}

async function ensureDashboardChannel(message) {
  // pakai channel command kalau TARGET_CHANNEL_ID kosong
  if (TARGET_CHANNEL_ID) {
    dashboardChannelId = TARGET_CHANNEL_ID;
    return await client.channels.fetch(TARGET_CHANNEL_ID);
  } else {
    dashboardChannelId = message.channel.id;
    return message.channel;
  }
}

async function postOrUpdateDashboard(guild) {
  if (!dashboardChannelId) return;

  const channel = await client.channels.fetch(dashboardChannelId).catch(() => null);
  if (!channel) return;

  const bots = await fetchAllBots(guild);
  if (!bots.size) {
    // kalau ga ada bot lain, beresin pesan lama kalau ada
    if (dashboardMessageIds.length) {
      for (const id of dashboardMessageIds) {
        channel.messages.delete(id).catch(() => {});
      }
      dashboardMessageIds = [];
    }
    await channel.send("⚠️ Gak ada bot lain di server ini.");
    return;
  }

  // Bangun embeds (satu embed per bot, urut alfabet biar konsisten)
  const botList = [...bots.values()].sort((a, b) => a.user.tag.localeCompare(b.user.tag));
  const embeds = botList.map(buildBotEmbed);

  // Discord limit: 10 embeds per message. Pecah jadi beberapa pesan jika > 10.
  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < embeds.length; i += chunkSize) {
    chunks.push(embeds.slice(i, i + chunkSize));
  }

  // Edit pesan lama kalau ada; kalau kurang, kirim baru; kalau kebanyakan, hapus sisanya
  const existing = [...dashboardMessageIds];
  const newMsgIds = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedsChunk = chunks[i];
    if (existing[i]) {
      // edit
      const msg = await channel.messages.fetch(existing[i]).catch(() => null);
      if (msg) {
        await msg.edit({ content: i === 0 ? "🤖 **Dashboard Status Bot (Realtime)**" : null, embeds: embedsChunk }).catch(() => {});
        newMsgIds.push(existing[i]);
        continue;
      }
    }
    // kirim baru
    const msg = await channel.send({ content: i === 0 ? "🤖 **Dashboard Status Bot (Realtime)**" : null, embeds: embedsChunk });
    newMsgIds.push(msg.id);
  }

  // hapus pesan berlebih
  if (existing.length > chunks.length) {
    for (let j = chunks.length; j < existing.length; j++) {
      channel.messages.delete(existing[j]).catch(() => {});
    }
  }

  dashboardMessageIds = newMsgIds;
}

// ===== Bot lifecycle =====
client.once("ready", async () => {
  console.log(`✅ Bot ${client.user.tag} udah online!`);
  // Optional: kalau lo udah set TARGET_CHANNEL_ID, auto bangun dashboard pas nyala
  if (TARGET_CHANNEL_ID) {
    const guilds = [...client.guilds.cache.values()];
    if (guilds[0]) {
      await postOrUpdateDashboard(guilds[0]);
    }
  }
});

// ===== Commands =====
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;
  if (message.content.trim().toLowerCase() !== COMMAND) return;

  if (message.author.id !== OWNER_ID) {
    return message.reply("🚫 Cuma owner yang boleh make command ini, maap bro 😅");
  }

  const channel = await ensureDashboardChannel(message);
  if (!channel) return message.reply("⚠️ Channel gak ketemu.");

  await message.reply("✅ Siap! Lagi bangun dashboard status…");
  await postOrUpdateDashboard(message.guild);
});

// ===== Realtime update saat presence berubah =====
client.on("presenceUpdate", async (oldP, newP) => {
  // Hanya update kalau:
  // 1) Dashboard sudah pernah dibuat
  // 2) User yang update itu bot
  if (!dashboardChannelId) return;
  const user = newP?.user ?? oldP?.user;
  if (!user?.bot) return;

  // Update 1 guild saja (umumnya 1)
  const guilds = [...client.guilds.cache.values()];
  if (!guilds[0]) return;

  await postOrUpdateDashboard(guilds[0]);
});

// ===== Safety net: periodic refresh (misal kalau event kepotong) =====
setInterval(async () => {
  if (!dashboardChannelId) return;
  const guilds = [...client.guilds.cache.values()];
  if (!guilds[0]) return;
  await postOrUpdateDashboard(guilds[0]);
}, 60_000); // tiap 1 menit

client.login(process.env.DISCORD_TOKEN);
