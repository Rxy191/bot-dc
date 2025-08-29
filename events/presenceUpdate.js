const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "presenceUpdate",
  async execute(oldPresence, newPresence) {
    const guild = newPresence.guild;
    const channel = guild.channels.cache.find(
      ch => ch.name === "bot-status" && ch.isTextBased()
    );
    if (!channel) return;

    const bots = guild.members.cache.filter(m => m.user.bot);
    if (bots.size === 0) return;

    const onlineCount = bots.filter(b => b.presence?.status === "online").size;
    const idleCount = bots.filter(b => b.presence?.status === "idle").size;
    const dndCount = bots.filter(b => b.presence?.status === "dnd").size;
    const offlineCount = bots.size - onlineCount - idleCount - dndCount;

    const embed = new EmbedBuilder()
      .setTitle("🤖 Status Semua Bot di Server")
      .setColor("Blurple")
      .setThumbnail(guild.iconURL({ dynamic: true }))
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
    const botMessage = messages.find(m => m.author.id === newPresence.client.user.id);
    if (botMessage) {
      await botMessage.edit({ embeds: [embed] }).catch(() => {});
    } else {
      await channel.send({ embeds: [embed] });
    }
  },
};
