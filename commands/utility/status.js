const { EmbedBuilder, PermissionsBitField } = require("discord.js");

// Helper: emoji status
const statusEmoji = (s) => s === "online" ? "🟢" : s === "idle" ? "🟡" : s === "dnd" ? "🔴" : "⚫️";

// Helper: format duration
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

// Ambil aktivitas
function getActivityText(presence) {
  if (!presence?.activities?.length) return "—";
  const act = presence.activities[0];
  const typeMap = { 0: "🎮 Playing", 1: "🔴 Streaming", 2: "🎵 Listening", 3: "🧩 Watching", 4: "✨ Status" };
  return `${typeMap[act.type] ?? "Activity"}: ${act.name ?? "—"}`;
}

// Build embed modern per bot
function buildBotEmbed(member, lastState) {
  const status = member.presence?.status || "offline";
  const now = Date.now();
  const rec = lastState.get(member.id) || { status, changedAt: now };

  // update timestamp jika status berubah
  if (rec.status !== status) lastState.set(member.id, { status, changedAt: now });
  else if (!lastState.has(member.id)) lastState.set(member.id, rec);

  const sinceMs = now - (lastState.get(member.id)?.changedAt ?? now);

  const statusColors = { online: 0x2ecc71, idle: 0xf1c40f, dnd: 0xe74c3c, offline: 0x7f8c8d };
  const color = statusColors[status] || 0x95a5a6;

  // Status emoji di sebelah avatar
  const emoji = statusEmoji(status);

  // Activity
  let activityText = getActivityText(member.presence);

  return new EmbedBuilder()
    .setAuthor({
      name: `${member.displayName} ${emoji}`,
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    })
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }))
    .setColor(color)
    .addFields(
      {
        name: "💬 Aktivitas",
        value: activityText,
        inline: true
      },
      {
        name: "⏱ Uptime / Last Seen",
        value: `${status === "offline" ? "Last Seen" : "Uptime"}: \`${fmtDuration(sinceMs)}\``,
        inline: true
      }
    )
    .setFooter({ text: `ID: ${member.id}` })
    .setTimestamp();
}


// Map untuk simpen lastState tiap bot
const lastState = new Map();

module.exports = {
  name: "status",
  description: "📡 Kirim dashboard status semua bot di server (auto-update tiap 15 detik)",
  async execute(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("🚫 Kamu harus punya permission Administrator untuk pakai command ini.");

    await message.reply("📌 Masukkan **ID channel** tempat dashboard dikirim:");

    const filter = m => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] }).catch(() => null);
    if (!collected) return message.reply("⏰ Waktu habis, command dibatalkan.");

    const channelId = collected.first().content.trim();
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return message.reply("⚠️ Channel ID tidak valid atau bukan text channel.");

    await message.reply(`✅ Dashboard akan dikirim ke <#${channel.id}> dan auto-update tiap 15 detik.`);

    // Auto-update function
    const sendOrUpdateDashboard = async () => {
      const bots = await message.guild.members.fetch().then(ms => ms.filter(m => m.user.bot));
      if (!bots.size) return;

      const embeds = [...bots.values()].sort((a,b) => a.user.tag.localeCompare(b.user.tag)).map(m => buildBotEmbed(m, lastState));

      const messages = await channel.messages.fetch({ limit: 10 });
      let botMsg = messages.find(m => m.author.id === message.client.user.id);

      if (botMsg) await botMsg.edit({ embeds }).catch(() => {});
      else botMsg = await channel.send({ embeds });
    };

    // Kirim awal & set interval 15 detik
    await sendOrUpdateDashboard();
    setInterval(sendOrUpdateDashboard, 15000);
  },
};
