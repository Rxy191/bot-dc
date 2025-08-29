const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("📖 Daftar command yang tersedia"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🤖 Daftar Command")
      .setDescription("Berikut command yang bisa lo pake:")
      .addFields(
        { name: "🧹 /clear [jumlah]", value: "Hapus chat di channel (1-100 atau 0 untuk semua)" },
        { name: "📤 /disconnect-all", value: "Kick semua user dari voice channel" },
        { name: "📡 /status", value: "Cek status bot-bot di server" },
        { name: "📖 /help", value: "Tampilin daftar command ini" }
      )
      .setFooter({ text: "Bot Moderator 🚨" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
