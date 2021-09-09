import { CommandInteraction, EmbedFieldData, MessageEmbed } from "discord.js";
import { ArgumentType } from "../../lib/ArgumentType";
import { Command } from "../../lib/Command";
import { CommandArgumentOptions } from "../../lib/CommandArgumentOptions";
import { CommandHandler } from "../../lib/CommandHandler";
import { CommandOptions } from "../../lib/CommandOptions";
import { EmbedColors, properCase } from "../../lib/Util";

export default class HelpCommand {
	@Command({
		name: 'help',
		group: 'misc',
		meta: {
			description: 'View Minehut+ commands.',
			examples: ['', 'command:suggest'],
		},
		args: [
			{
				name: 'command',
				description: 'The command you want to view information about.',
				type: ArgumentType.STRING,
				required: false,
			},
		],
	})
	async run(i: CommandInteraction) {
		const ch: CommandHandler = CommandHandler.getInstance();
		const command: string | null = i.options.getString('command');
		console.log
		if(command) {
			const cmd: CommandOptions | undefined = ch.commands.get(command.toLowerCase());
			if(!cmd) {
				i.reply({ content: `Failed to find information about that command. Make sure there aren't any typos in the name.`, ephemeral: true });
				return;
			}
			const embed = new MessageEmbed()
				.setDescription(`\`${cmd.name} <args>\``.replace('<args>', (cmd.args?.map((arg: CommandArgumentOptions) => {
					return (arg.required ? '<a>' : '[a]').replace('a', arg.name);
				}).join(' ') || '')).trim())
				.addFields([
					{
						name: 'Description',
						value: cmd.meta.description,
						inline: true,
					},
					{
						name: 'Examples',
						value: `\`${cmd.name} ${cmd.meta.examples.join(`\`\n\`${cmd.name} `)}\``.replace(/ `\n/g, '`\n'),
						inline: true,
					},
				])
				.setFooter(`Requested by ${i.user?.tag}`, i.user?.displayAvatarURL());
			return i.reply({ embeds: [embed], ephemeral: true });
		}
		const embed = new MessageEmbed()
			.setTitle('Commands')
			.setDescription('This is a list of all Minehut+ commands.\nTo view information about a specific command, run `/help <command>`')
			.setColor(EmbedColors.PRIMARY)
			.addFields(((): EmbedFieldData[] => {
				const fields = [];
				for(const group of Array.from(ch.groups, ([, value]) => value)) {
					fields.push({
						name: properCase(group.name),
						value: `\`${group.commands.map((command: CommandOptions) => command.name).join('`, `')}\``,
						inline: true,
					});
				}
				return fields;
			})());
		return i.reply({ embeds: [embed], ephemeral: true });
	}
}