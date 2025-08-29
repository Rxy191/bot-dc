module.exports = {
  name: "help",
  description: "📖 Daftar command bot",
  async execute(message) {
    const commands = [
      { name: "$clear [jumlah/all]", desc: "Hapus chat di channel" },
      { name: "$disconnect-all", desc: "Kick semua user dari voice channel" },
      { name: "$statusbots", desc: "Cek status bot lain di server" },
      { name: "$help", desc: "Tampil daftar command ini" },
    ];

    let helpMessage = "🤖 **Daftar Command Bot:**\n\n";
    commands.forEach(c => {
      helpMessage += `**${c.name}** → ${c.desc}\n`;
    });

    message.reply(helpMessage);
  },
};
