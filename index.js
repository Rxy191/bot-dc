const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder 
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences, // wajib buat status
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const OWNER_ID = "535796365192724480"; // ganti dengan ID lo
const TARGET_CHANNEL_ID = "1410904568857890902"; // channel tempat update embed

// Simpan message embed supaya bisa diedit realtime
let statusMessage;

client.once("ready", () => {
  console.log(`✅ Bot ${client.user.tag} udah online!`);
});

// Command awal buat munculin embed status bot-bot
client.on("messageCreate", async (message) => {
  if (message.content === "!statusbots") {
    if (message.author.id !== OWNER_ID) {
      return message.reply("🚫 Bro, cuma owner yang boleh pake command ini.");
    }

    const members = await message.guild.members.fetch();
    const bots = members.filter((m) => m.user.bot);

    if (bots.size === 0) {
      return message.reply("⚠️ Ga ada bot lain di server ini.");
    }

    const embed = makeStatusEmbed(bots);

    // kirim embed ke channel
    statusMessage = await message.channel.send({ embeds: [embed] });
  }
});

// Realtime update kalau ada member berubah presence
client.on("presenceUpdate", async () => {
  if (!statusMessage) return;

  const members = await statusMessage.guild.members.fetch();
  const bots = members.filter((m) => m.user.bot);

  const embed = makeStatusEmbed(bots);

  // edit embed lama jadi baru
  statusMessage.edit({ embeds: [embed] });
});

// Function bikin embed status
function makeStatusEmbed(bots) {
  const embed = new EmbedBuilder()
    .setTitle("🤖 Status Bot di Server")
    .setColor("#2f3136")
    .setTimestamp();

  bots.forEach((bot) => {
    const status = bot.presence?.status || "offline";
    const emoji = status === "online" ? "🟢" : status === "idle" ? "🟡" : "🔴";
    embed.addFields({
      name: bot.user.tag,
      value: `${emoji} ${status.toUpperCase()}`,
      inline: true,
    });
  });

  return embed;
}

client.login(process.env.DISCORD_TOKEN);
