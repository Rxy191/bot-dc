const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disconnect-all")
    .setDescription("📤 Kick semua member dari voice channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers),

  async execute(interaction) {
    const { guild } = interaction;
    let disconnected = 0;

    guild.channels.cache
      .filter(c => c.type === 2) // type 2 = voice
      .forEach(vc => {
        vc.members.forEach(member => {
          member.voice.disconnect();
          disconnected++;
        });
      });

    await interaction.reply(`✅ ${disconnected} user berhasil di-disconnect dari voice channel.`);
  },
};
