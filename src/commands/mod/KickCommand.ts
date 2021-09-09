import { ArgumentType } from '../../lib/ArgumentType';
import { roles } from '../../../config.json';
import { CommandInteraction } from 'discord.js';
import { Punishment } from '../../lib/Punishment';
import { Command } from "../../lib/Command";

export default class KickCommand {

	@Command({
		name: 'kick',
		group: 'mod',
		meta: {
			description: 'Kick a user with the provided reason.',
			examples: ['user:@Goose#1832 reason:unacceptable behavior','user:194137531695104000 length:1d reason:shoo'],
		},
		args: [
			{
				name: 'member',
				description: 'The user to kick.',
				type: ArgumentType.USER,
				required: true,
			},
			{
				name: 'reason',
				description: 'The reason for the kick.',
				type: ArgumentType.STRING,
				required: false,
			},
		],
		permissions: [
			{
				id: roles.maintainer,
				type: 'ROLE',
				permission: true,
			},
		],
	})
	async run(i: CommandInteraction) {
		const [member, reason] = [i.options.getUser('member', true), i.options.getString('reason', true)];
		const punishment: Punishment = new Punishment({
			member,
			moderator: i.user,
			reason,
			type: "KICK",
		});
		try {
			punishment.execute();
			i.reply({ content: `Kicked ${member.tag} (\`${member.id}\`) with reason \`${reason}\``, ephemeral: true });
		} catch (err) {
			console.error(err);
			i.reply({ content: `Failed to issue the punishment.\n\`\`\`\n${err}\n\`\`\``, ephemeral: true });
		}
	}
}