const { Client } = require("discord.js");
const { token, guildId } = require("./boodyhsn/config");

const client = new Client({
  intents: ["GUILDS", "GUILD_MEMBERS", "GUILD_MESSAGES", "DIRECT_MESSAGES"],
});

client.on("ready", async () => {
  console.log(`${client.user.tag} is Online `);

  let guild = client.guilds.cache.get(guildId);
  if (guild) {
    guild.commands.set([
      {
        name: "LAG",
        description: `check lag of bot`,
        type: "CHAT_INPUT",
      },
      {
        name: "setup",
        description: `setup the verification system`,
        type: "CHAT_INPUT",
      },
    ]);
  }
  // loading
  require("./boodyhsn/verify")(client);
});

client.login(token);
