const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🧹 Hapus chat di channel ini")
    .addIntegerOption(option =>
      option.setName("jumlah")
        .setDescription("Jumlah pesan terakhir yang mau dihapus (1-100). Pilih '0' untuk semua.")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const jumlah = interaction.options.getInteger("jumlah");
    const channel = interaction.channel;

    if (jumlah === 0) {
      // Clear semua chat (max 100 per batch)
      let fetched;
      do {
        fetched = await channel.messages.fetch({ limit: 100 });
        await channel.bulkDelete(fetched);
      } while (fetched.size >= 2);
      return interaction.reply({ content: "✅ Semua pesan berhasil dihapus!", ephemeral: true });
    }

    if (jumlah < 1 || jumlah > 100) {
      return interaction.reply({ content: "⚠️ Masukin angka 1-100 atau 0 untuk hapus semua.", ephemeral: true });
    }

    await channel.bulkDelete(jumlah, true);
    interaction.reply({ content: `✅ ${jumlah} pesan terakhir udah dihapus!`, ephemeral: true });
  },
};
