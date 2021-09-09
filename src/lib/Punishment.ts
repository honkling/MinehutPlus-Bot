import { EmbedFieldData, MessageEmbed, User } from "discord.js";
import { EmbedColors, ParsedTimespanInformation, PastTensePunishmentType, PunishmentFailedError, PunishmentOptions, PunishmentType, ValidPunishmentTypes } from "./Util";
import { guild } from "../../config.json";
import { RunResult } from "sqlite3";
import { MinehutClient } from "./MinehutClient";

export class Punishment {

	private member: User;
	private moderator: User;
	private reason: string;
	private length?: ParsedTimespanInformation;
	private type: PunishmentType;
	private rawType: ValidPunishmentTypes;

	constructor({ member, moderator, reason, length, type }: PunishmentOptions) {
		if(length) this.length = length;
		[this.member, this.moderator, this.reason, this.type, this.rawType] = [member, moderator, reason, PunishmentType[type], type];
	}

	async execute() {
		const bot = MinehutClient.getInstance();
		const g = await bot.guilds.fetch(guild as string);
		const db = MinehutClient.getDatabase();
		const guildMember = await g.members.fetch(this.member.id);
		const embed = new MessageEmbed()
			.setTitle(`You have been ${PastTensePunishmentType[this.rawType]} from Minehut+`)
			.setColor(EmbedColors.PRIMARY)
			.addFields(
				((): EmbedFieldData[] => {
					const data: EmbedFieldData[] = [];
					data.push({
						name: 'Reason',
						value: this.reason,
					});
					if(this.type === PunishmentType.BAN) {
						if(!this.length) return data;
						data.push({
							name: 'Expiration',
							value: `Expires at ${new Date(new Date().getTime() + this.length.ms)} (in ${this.length.parsedLength})`
						});
					}
					return data;
				})()
			);
		this.member.send({ embeds: [embed] });
		if(this.type != PunishmentType.KICK && this.length) {
			if(!guildMember.bannable) throw new PunishmentFailedError('That user is not bannable.');
			await g.bans.create(this.member, { reason: this.reason })
				.then(() => {
					if(!this.length) return;
					db.run(`INSERT INTO punishments(user, moderator, ms, reason, date, expiresAt, type, active) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`, [
						this.member.id,
						this.moderator.id,
						this.length.ms,
						this.reason,
						new Date().getTime(),
						new Date().getTime() + this.length.ms,
						this.type,
						true,
					], (_: RunResult, err: string) => {
						if(err) throw new PunishmentFailedError(err);
					});
				})
				.catch((err) => { throw new PunishmentFailedError(err) });
		} else {
			if(this.type === PunishmentType.KICK) {
				if(!guildMember.kickable) throw new PunishmentFailedError('That user is not kickable.');
				guildMember.kick();
			}
			db.run(`INSERT INTO punishments(user, moderator, reason, date, type) VALUES(?, ?, ?, ?, ?)`, [
				this.member.id,
				this.moderator.id,
				this.reason,
				new Date().getTime(),
				this.type,
			], (_: RunResult, err: string) => {
				if(err) throw new PunishmentFailedError(err);
			});
		}
		MinehutClient.getScheduler().refresh();
	}
}