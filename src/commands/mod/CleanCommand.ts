import { CommandInteraction, Message, TextChannel } from "discord.js";
import { ArgumentType } from "../../lib/ArgumentType";
import { CommandHandler } from "../../lib/CommandHandler";
import { roles } from "../../../config.json";
import { Command } from "../../lib/Command";

export default class CleanCommand {

	@Command({
		name: 'clean',
		group: 'mod',
		meta: {
			description: 'Clean a user\'s messages.',
			examples: ['user:@Goose#1832 amount:10', 'user:194137531695104000 amount:20'],
		},
		args: [
			{
				name: 'user',
				description: 'The user whose messages you want to clear.',
				type: ArgumentType.USER,
				required: true,
			},
			{
				name: 'amount',
				description: 'The amount of messages you want to clear.',
				type: ArgumentType.INTEGER,
				required: true,
			},
		],
		permissions: [{
			id: roles.maintainer,
			type: 'ROLE',
			permission: true,
		}],
	})
	async run(i: CommandInteraction) {
		const textChannel = await CommandHandler.getBotInstance().channels.fetch(i.channel?.id as string) as TextChannel;
		const user = i.options.getUser('user', true);
		const amount = i.options.getInteger('amount', true);
		const messages = [
			...(await textChannel.messages.fetch())
				.filter((m: Message) => m.author.id === user.id && new Date().getTime() - m.createdTimestamp < 1.2096*(10**9))
				.sort((a: Message, b: Message) => b.createdTimestamp - a.createdTimestamp)
				.values(),
		].slice(0, amount);
		textChannel.bulkDelete(messages)
			.then((m) => i.reply({ content: `Deleted ${`${m.size} ` + (m.size === 1 ? 'message' : 'messages')}.`, ephemeral: true }))
			.catch((err) => {
				i.reply({ content: `There was an error trying to clean messages. You should never receive this. Error:\n\`\`\`\n${err}\n\`\`\``, ephemeral: true });
				console.error(err);
			});
	}
}