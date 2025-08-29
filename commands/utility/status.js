const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("📡 Cek status bot di server"),

  async execute(interaction) {
    const botList = [
      "", // contoh ID bot lain
      interaction.client.user.id, // bot kita sendiri
    ];

    const embed = new EmbedBuilder()
      .setColor(0x2F3136)
      .setTitle("🤖 Status Bot di Server")
      .setDescription("Realtime status semua bot yang dipantau")
      .setTimestamp();

    for (const botId of botList) {
      const member = await interaction.guild.members.fetch(botId).catch(() => null);
      if (!member) {
        embed.addFields({ name: `❌ Tidak ditemukan`, value: `<@${botId}>` });
        continue;
      }

      const status = member.presence?.status || "offline";
      const emoji = status === "online" ? "🟢" : status === "idle" ? "🟡" : "🔴";
      embed.addFields({
        name: member.user.username,
        value: `${emoji} ${status.toUpperCase()}`,
        inline: false,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
