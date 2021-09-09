import { MinehutClient } from "./MinehutClient";
import { guild } from "../../config.json";

export class PunishmentScheduler {

	async refresh() {
		const timeouts: NodeJS.Timeout[] = [];
		const db = MinehutClient.getDatabase();
		const executionTime = new Date().getTime();
		db.each(`SELECT * FROM punishments WHERE date >= ${executionTime - 2.592e8} AND active = true AND type != 1`, (err: Error, row: any) => {
			if(err) return console.error(err);
			timeouts.push(setTimeout(async () => {
				switch (row.type) {
					case 2:
						const bot = MinehutClient.getInstance();
						const g = await bot.guilds.fetch(guild);
						g.bans.remove(row.user, "Automatic unban");
						db.run(`UPDATE punishments SET active = false WHERE date = ${row.date} AND active = true AND type = ${row.type}`);
				}
			}, (row.expiresAt - executionTime) < 0 ? 0 : row.expiresAt - executionTime));
		});
		setTimeout(this.refresh, 4.32e7);
	}
}