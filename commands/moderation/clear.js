module.exports = {
  name: "clear",
  description: "🧹 Hapus chat di channel",
  async execute(message, args) {
    const jumlah = args[0]?.toLowerCase() === "all" ? 0 : parseInt(args[0]);
    const channel = message.channel;

    if (jumlah === undefined || (jumlah !== 0 && (isNaN(jumlah) || jumlah < 1 || jumlah > 100))) {
      return message.reply("⚠️ Masukkan angka 1-100 atau 'all' untuk hapus semua.");
    }

    if (jumlah === 0) {
      let fetched;
      do {
        fetched = await channel.messages.fetch({ limit: 100 });
        if (fetched.size === 0) break;
        await channel.bulkDelete(fetched, true);
      } while (fetched.size >= 2);
      return message.reply("✅ Semua pesan berhasil dihapus!");
    }

    await channel.bulkDelete(jumlah, true);
    message.reply(`✅ ${jumlah} pesan terakhir berhasil dihapus!`);
  },
};
