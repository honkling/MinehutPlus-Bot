import { REST } from "@discordjs/rest";
import { GuildDefaultMessageNotifications, Routes } from "discord-api-types/v10";
import { ApplicationCommandPermissionData, ApplicationCommandPermissions, Client, GuildApplicationCommandPermissionData } from "discord.js";
import { config } from "dotenv";
import glob from "glob";
import mongoose from "mongoose";
import { join } from "path";
import Command from "./commands/Command";
import Logger from "./lib/logger";
import Storage from "./lib/storage";

config({
	path: join(__dirname, "../.env"),
});

if (!process.env.TOKEN || !process.env.GUILD_ID || !process.env.MAINTAINER || !process.env.MONGODB_URL) {
	Logger.severe("Please provide a token, guild ID, MongoDB url, and maintainer role ID in the .env file.");
	process.exit(1);
}

const client = new Client({
	intents: ["GUILDS", "GUILD_MESSAGES"],
});
const rest = new REST({
	version: "10",
}).setToken(process.env.TOKEN);
const storage = Storage.getInstance(client);

client.on("ready", async () => {
	Logger.info("%FgGreen%Ready to roll.");

	await mongoose.connect(process.env.MONGODB_URL as string);

	glob("src/events/impl/**/*.ts", (err, matches) => {
		if (err) {
			Logger.severe(`An error occurred registering events.\n${err}`);
			process.exit(1);
		}

		for (const match of matches) {
			const requirableMatch = Array.from(match.matchAll(/src\/(events\/impl\/.+)\.ts/g))[0][1];
			const { default: Listener } = require(`./${requirableMatch}`);
			if (!Listener) continue;
			new Listener(client);
		}
	});
	glob("src/commands/impl/**/*.ts", async (err, matches) => {
		if (err) {
			Logger.severe(`An error occurred registering commands\n${err}`);
			process.exit(1);
		}

		for (const match of matches) {
			const requirableMatch = Array.from(match.matchAll(/src\/(commands\/impl\/.+)\.ts/g))[0][1];
			const { default: CommandImpl }: { default: typeof Command } = require(`./${requirableMatch}`);
			if (!CommandImpl) continue;
			const command = new CommandImpl(client);
			storage.commands.set(command.data?.name as string, command);
		}

		rest.put(Routes.applicationGuildCommands(client.application?.id as string, process.env.GUILD_ID as string), {
			body: Array.from(storage.commands.values()).map((c) => c.data),
		})
			.then(() => {
				Logger.info("Successfully registered commands.");
			})
			.catch((e) => {
				Logger.severe(`An error occurred registering commands.\n${e}`);
				process.exit(1);
			});
		
		const guild = await client.guilds.cache.get(process.env.GUILD_ID as string);
		const commands = await guild?.commands.fetch();
		const permissions: GuildApplicationCommandPermissionData[] = commands?.map((c) => {
			return {
				id: c.id,
				permissions: storage.commands.get(c.name)?.data?.permissions,
			}
		}) as GuildApplicationCommandPermissionData[];
		await guild?.commands.permissions.set({
			fullPermissions: permissions,
		});
	});
});

client.on("warn", (e) => {
	Logger.warn(e);
});

client.on("error", (e) => {
	Logger.severe(e.message);
});

client.login(process.env.TOKEN);