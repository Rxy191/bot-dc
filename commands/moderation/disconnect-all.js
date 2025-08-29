module.exports = {
  name: "disconnect-all",
  description: "📤 Kick semua member dari voice channel",
  async execute(message) {
    const member = message.member;
    const vc = member.voice.channel;

    if (!vc) return message.reply("❌ Lo harus ada di voice channel dulu.");

    let disconnected = 0;
    vc.members.forEach(mem => {
      mem.voice.disconnect().catch(() => {});
      disconnected++;
    });

    message.reply(`✅ ${disconnected} user berhasil di-disconnect dari ${vc.name}.`);
  },
};
