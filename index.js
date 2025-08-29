const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`✅ Bot ${client.user.tag} udah online!`);
  // contoh: kirim pesan ke channel pas bot nyala
  const channelId = "1410904568857890902"; 
  const channel = client.channels.cache.get(channelId);
  if (channel) channel.send("🤖 Bot udah online dan siap kerja!");
});

client.on("messageCreate", (message) => {
  if (message.content === "!ping") {
    message.channel.send("🏓 Pong!");
  }
});

console.log("TOKEN DARI ENV:", process.env.DISCORD_TOKEN ? process.env.DISCORD_TOKEN.slice(0, 10) + "..." : "❌ GA ADA");


client.login(process.env.DISCORD_TOKEN);
