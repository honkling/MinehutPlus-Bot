import { Client, MessageActionRow, MessageButton } from "discord.js";
import { config } from "dotenv";
import glob from "glob";
import { join } from "path";
import interactionCreate from "./events/createIssue";
import EventListener from "./events/impl/EventListener";
import Logger from "./lib/logger";

const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES"],
});
config({
	path: join(__dirname, "../.env"),
});

if (!process.env.TOKEN) {
	Logger.severe("Please provide a token in the .env file.");
	process.exit(1);
}

client.on("ready", async () => {
	Logger.info("%FgGreen%Ready to roll.");
	glob("src/events/**/*", (err, matches) => {
		for (const match of matches) {
			if (match.startsWith("src/events/impl")) continue;
			const requirableMatch = Array.from(match.matchAll(/src\/(events\/.+)\.ts/g))[0][1];
			const { default: Listener } = require(`./${requirableMatch}`);
			if (!Listener) continue;
			new Listener(client);
		}
	});
});

/*client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	Logger.info("[DBG] new message");
	await message.reply({
		components: [
			new MessageActionRow({
				components: [
					new MessageButton({
						customId: "button_createIssue",
						style: "PRIMARY",
						label: "Create new issue",
					}),
				],
			}),
		],
	});
});

client.on("interactionCreate", async (interaction) => {
	await interactionCreate(interaction);
});*/

client.on("warn", (e) => {
	Logger.warn(e);
});

client.on("error", (e) => {
	Logger.severe(e.message);
});

client.login(process.env.TOKEN);