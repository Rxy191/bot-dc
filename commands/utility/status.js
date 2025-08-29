module.exports = {
  name: "status",
  description: "📡 Cek status bot di server",
  async execute(message) {
    const botList = [
      "", // contoh bot lain
      // bisa tambah ID bot lain
    ];

    let statusMsg = "🤖 **Status Bot di Server:**\n\n";

    for (const botId of botList) {
      const member = await message.guild.members.fetch(botId).catch(() => null);
      if (!member) {
        statusMsg += `❌ Tidak ditemukan → <@${botId}>\n`;
        continue;
      }

      const status = member.presence?.status || "offline";
      const emoji = status === "online" ? "🟢" : status === "idle" ? "🟡" : "🔴";
      statusMsg += `**${member.user.username}** → ${emoji} ${status.toUpperCase()}\n`;
    }

    message.reply(statusMsg);
  },
};
