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
});

// contoh command di Discord
client.on("messageCreate", (message) => {
  if (message.content === "!statusbot") {
    message.channel.send("🏓 Pong!");
  }
});

// login pakai token dari Render
client.login(process.env.DISCORD_TOKEN);
