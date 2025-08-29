const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "status",
  description: "📡 Cek status semua bot di server (embed modern)",
  async execute(message) {
    // Ambil semua member bot di server
    const bots = message.guild.members.cache.filter(member => member.user.bot);

    if (bots.size === 0) {
      return message.reply("⚠️ Tidak ada bot di server ini.");
    }

    const embed = new EmbedBuilder()
      .setTitle("🤖 Status Semua Bot di Server")
      .setColor("Blurple")
      .setTimestamp();

    bots.forEach(bot => {
      const status = bot.presence?.status || "offline";
      let emoji;
      switch (status) {
        case "online":
          emoji = "🟢";
          break;
        case "idle":
          emoji = "🟡";
          break;
        case "dnd":
          emoji = "🔴";
          break;
        default:
          emoji = "⚫";
      }

      embed.addFields({
        name: `${emoji} ${bot.user.username}`,
        value: `[Avatar](${bot.user.displayAvatarURL()})`,
        inline: true,
      });
    });

    message.reply({ embeds: [embed] });
  },
};
