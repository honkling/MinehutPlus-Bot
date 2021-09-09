import { Client, ClientOptions } from "discord.js";
import { join } from "path";
import { Database } from "sqlite3";
import { PunishmentScheduler } from "./PunishmentScheduler";

export class MinehutClient extends Client {
	private static instance: Client;
	private static PunishmentScheduler: PunishmentScheduler;
	private static db: Database;

	constructor(options: ClientOptions) {
		super(options);
		MinehutClient.instance = this;
		MinehutClient.PunishmentScheduler = new PunishmentScheduler();
	}

	static getInstance(): Client {
		return MinehutClient.instance;
	}

	static getScheduler(): PunishmentScheduler {
		return MinehutClient.PunishmentScheduler;
	}

	static getDatabase(): Database {
		return MinehutClient.db;
	}

	initiateDatabase() {
		MinehutClient.db = new Database(join(__dirname, '../../main.db'), (err: Error | null) => { if(err) console.error });
		MinehutClient.db.exec(`CREATE TABLE IF NOT EXISTS punishments(
			user TEXT NOT NULL,
			moderator TEXT NOT NULL,
			ms INT,
			reason TEXT DEFAULT 'No reason specified.',
			date INT NOT NULL,
			expiresAt INT,
			type INT NOT NULL,
			active BOOLEAN
		)`, (err: Error | null) => {
			if(err) console.error(err);
			MinehutClient.PunishmentScheduler.refresh();
		});
		MinehutClient.db.exec(`CREATE TABLE IF NOT EXISTS reactionRoles(
			role TEXT NOT NULL
		)`);
	}
}