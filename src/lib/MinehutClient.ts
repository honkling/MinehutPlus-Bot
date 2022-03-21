import { Client, ClientOptions, Message, PartialMessage } from "discord.js";
import { join } from "path";
import { Database } from "sqlite3";
import { PunishmentScheduler } from "./PunishmentScheduler";

export class MinehutClient extends Client {
	private static instance: Client;
	private static PunishmentScheduler: PunishmentScheduler;
	private static db: Database;
	private static INVITE_REGEX: RegExp = /discord(?:\.com|app\.com|\.gg)[\/invite\/]?(?:[a-zA-Z0-9\-]{2,32})/g;

	constructor(options: ClientOptions) {
		super(options);
		MinehutClient.instance = this;
		MinehutClient.PunishmentScheduler = new PunishmentScheduler();
	}

	public static getInstance(): Client {
		return MinehutClient.instance;
	}

	public static getScheduler(): PunishmentScheduler {
		return MinehutClient.PunishmentScheduler;
	}

	public static getDatabase(): Database {
		return MinehutClient.db;
	}

	public async scanForInvites(msg: Message | PartialMessage) {
		if(!msg.content) return;
		const invites = Array.from(msg.content.matchAll(MinehutClient.INVITE_REGEX));
		if(invites) {
			// An invite was sent!
			for(const link of invites) {
				const CODE_REGEX = /\/.+$/g;
				const codeRaw = link[0].match(CODE_REGEX);

				if(!codeRaw || codeRaw.length === 0)
					return;

				// We've got a code! Let's poll the Discord API to view information about the guild so we can filter if needed.
				const code = codeRaw[0].substring(1);
				const invite = await this.fetchInvite(code);

				if(!invite || !invite.guild || invite.guild.id === '872306760394891315')
					return;

				// The invite sent wasn't for Minehut+. Let's filter it.
				await msg.delete();
				return;
			}
		}
	}

	public initiateDatabase() {
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