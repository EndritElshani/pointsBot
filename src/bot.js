require("dotenv").config();
const token = process.env.DISCORD_TOKEN;
const mongoURI = process.env.MONGO_URI;
const { connect } = require("mongoose");
const { Client, Collection, GatewayIntentBits  } = require("discord.js");
const fs = require("fs");
const { User } = require('./schemas/user');


const client = new Client({
  intents: Object.keys(GatewayIntentBits).map((a)=>{
    return GatewayIntentBits[a]
  }),
});
client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();

client.login(token);

(async () => {
  await connect(mongoURI).catch(console.error);
})();

