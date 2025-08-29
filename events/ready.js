module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`✅ Bot ${client.user.tag} udah online!`);
  },
};
