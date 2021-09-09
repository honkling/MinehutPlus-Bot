import { ArgumentType } from '../../lib/ArgumentType';
import { roles } from '../../../config.json';
import { CommandInteraction } from 'discord.js';
import { ParsedTimespanInformation, parseLength } from '../../lib/Util';
import { Punishment } from '../../lib/Punishment';
import { Command } from "../../lib/Command";

export default class BanCommand {

	@Command({
		name: 'ban',
		group: 'mod',
		meta: {
			description: 'Ban a user with a provided length and reason.',
			examples: ['user:@Goose#1832 length:3h reason:cringe','user:194137531695104000 length:1d reason:nerd'],
		},
		args: [
			{
				name: 'member',
				description: 'The user to ban.',
				type: ArgumentType.USER,
				required: true,
			},
			{
				name: 'length',
				description: 'The length of the punishment.',
				type: ArgumentType.STRING,
				required: true
			},
			{
				name: 'reason',
				description: 'The reason for the ban.',
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
		const [member, length, reason] = [i.options.getUser('member', true), i.options.getString('length', true), i.options.getString('reason', true)];
		let result = parseLength(length === 'forever' ? '1000de' : length);
		if(!result) return i.reply({ content: 'Invalid timespan received. Please try again with a valid timespan.', ephemeral: true });
		result = result as ParsedTimespanInformation;
		const punishment: Punishment = new Punishment({
			member,
			moderator: i.user,
			reason,
			length: result,
			type: "BAN",
		});
		try {
			punishment.execute();
			i.reply({ content: `Banned ${member.tag} (\`${member.id}\`) with reason \`${reason}\` [\`${result.parsedLength}\`]`, ephemeral: true });
		} catch (err) {
			console.error(err);
			i.reply({ content: `Failed to issue the punishment.\n\`\`\`\n${err}\n\`\`\``, ephemeral: true });
		}
	}
}