const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const OWNER_ID = "535796365192724480"; // ganti dengan user ID lo
const BOT_IDS = ["155149108183695360", "276060004262477825"]; // isi dengan ID bot2 target

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} sudah online!`);
});

client.on("messageCreate", async (message) => {
  if (message.content === "!status") {
    if (message.author.id !== OWNER_ID) return;

    let embeds = [];

    for (const botId of BOT_IDS) {
      const member = await message.guild.members.fetch(botId).catch(() => null);

      if (!member) continue;

      const status = member.presence?.status || "offline";
      const emoji =
        status === "online" ? "🟢" :
        status === "idle"   ? "🟡" :
        status === "dnd"    ? "🔴" :
        "⚫️";

      const embed = new EmbedBuilder()
        .setAuthor({
          name: member.user.tag,
          iconURL: member.user.displayAvatarURL(),
        })
        .setDescription(`${emoji} **${status.toUpperCase()}**`)
        .setThumbnail(member.user.displayAvatarURL())
        .setColor(
          status === "online"
            ? 0x2ecc71 // hijau
            : status === "idle"
            ? 0xf1c40f // kuning
            : status === "dnd"
            ? 0xe74c3c // merah
            : 0x95a5a6 // abu
        )
        .setTimestamp();

      embeds.push(embed);
    }

    if (embeds.length === 0) {
      return message.reply("⚠️ Ga ada bot yang bisa dicek di server ini.");
    }

    message.reply({ embeds });
  }
});

client.login(process.env.DISCORD_TOKEN);
