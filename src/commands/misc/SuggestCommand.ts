import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { EmbedColors } from '../../lib/Util';
import { suggestionsChannel } from '../../../config.json';
import { ArgumentType } from '../../lib/ArgumentType';
import { Command } from '../../lib/Command';

export default class SuggestCommand {

	@Command({
		name: 'suggest',
		group: 'misc',
		meta: {
			description: 'Create a new suggestion for Minehut+.',
			examples: ['input:Add subusers!', 'input:Remove all telemetry'],
		},
		args: [
			{
				name: 'input',
				description: 'The suggestion for Minehut+.',
				type: ArgumentType.STRING,
				required: true,
			},
		],
	})
	async run(i: CommandInteraction) {
		if(i.channelId !== suggestionsChannel) {
			i.reply({ content: `You aren't in the correct channel for suggestions. Please go to <#${suggestionsChannel}> and try again.`, ephemeral: true });
			return;
		}
		const embed = new MessageEmbed()
			.setTitle('Suggestion')
			.setDescription(i.options.getString('input', true))
			.setColor(EmbedColors.PRIMARY)
			.setFooter(`Requested by ${i.user.tag}`, i.user.displayAvatarURL());
		const row = new MessageActionRow()
			.addComponents([
				new MessageButton()
					.setCustomId('suggestions_thread')
					.setLabel('Thread')
					.setEmoji('🧵')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('suggestions_delete')
					.setLabel('Delete')
					.setEmoji('🗑️')
					.setStyle('DANGER')
			])
		i.reply({ embeds: [embed], components: [row] });
	}
}