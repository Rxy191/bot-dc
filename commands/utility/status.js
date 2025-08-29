const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "status",
  description: "📡 Auto-update embed status semua bot di server (tanya channel ID)",
  async execute(message) {
    // Cek permission user
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("⚠️ Kamu harus punya permission Administrator untuk pakai command ini.");
    }

    // Tanya channel ID
    await message.reply("📌 Masukkan **ID channel** tempat embed status dikirim:");

    const filter = m => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ["time"] })
      .catch(() => null);

    if (!collected) return message.reply("⏰ Waktu habis, command dibatalkan.");

    const channelId = collected.first().content.trim();
    const channel = message.guild.channels.cache.get(channelId);

    if (!channel || !channel.isTextBased()) return message.reply("⚠️ Channel ID tidak valid atau bukan text channel.");

    message.reply(`✅ Embed status akan dikirim ke <#${channel.id}> dan auto-update setiap 15 detik.`);

    // Fungsi kirim/update embed
    const sendOrUpdateEmbed = async () => {
      const bots = message.guild.members.cache.filter(m => m.user.bot);
      if (bots.size === 0) return;

      const onlineCount = bots.filter(b => b.presence?.status === "online").size;
      const idleCount = bots.filter(b => b.presence?.status === "idle").size;
      const dndCount = bots.filter(b => b.presence?.status === "dnd").size;
      const offlineCount = bots.size - onlineCount - idleCount - dndCount;

      const embed = new EmbedBuilder()
        .setTitle("🤖 Status Semua Bot di Server")
        .setColor("Blurple")
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({ text: `Online: ${onlineCount} | Idle: ${idleCount} | DND: ${dndCount} | Offline: ${offlineCount}` });

      bots.forEach(bot => {
        const status = bot.presence?.status || "offline";
        let statusEmoji;
        switch (status) {
          case "online": statusEmoji = "🟢"; break;
          case "idle": statusEmoji = "🟡"; break;
          case "dnd": statusEmoji = "🔴"; break;
          default: statusEmoji = "⚫";
        }

        let activity = "Tidak ada aktivitas";
        if (bot.presence?.activities?.length) {
          const act = bot.presence.activities[0];
          activity = `${act.type} ${act.name}`;
        }

        embed.addFields(
          {
            name: `${bot.displayName}`,
            value: `[Avatar](${bot.user.displayAvatarURL({ dynamic: true, size: 64 })})\n${activity}`,
            inline: true
          },
          {
            name: "\u200B",
            value: statusEmoji,
            inline: true
          }
        );
      });

      const messages = await channel.messages.fetch({ limit: 10 });
      const botMessage = messages.find(m => m.author.id === message.client.user.id);
      if (botMessage) {
        await botMessage.edit({ embeds: [embed] }).catch(() => {});
      } else {
        await channel.send({ embeds: [embed] });
      }
    };

    // Kirim embed awal
    await sendOrUpdateEmbed();

    // Auto-update setiap 15 detik
    setInterval(sendOrUpdateEmbed, 15000);
  },
};
