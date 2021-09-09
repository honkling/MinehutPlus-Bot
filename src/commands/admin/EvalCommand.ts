import { ArgumentType } from "../../lib/ArgumentType";
import { Command } from "../../lib/Command";
import { roles } from "../../../config.json";
import { CommandInteraction } from "discord.js";
import { transpile } from "typescript";

export default class EvalCommand {
	@Command({
		name: 'eval',
		group: 'admin',
		meta: {
			description: 'Evaluate JavaScript code.',
			examples: ['input:1+1 usets:true', 'input:console.log(\'hello world!\');'],
		},
		args: [
			{
				name: 'input',
				description: 'JavaScript code to run.',
				type: ArgumentType.STRING,
				required: true
			},
			{
				name: 'usets',
				description: 'Whether or not to use TypeScript transpiling.',
				type: ArgumentType.BOOLEAN,
			}
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
		const input = i.options.getString('input', true).replace(/```/g, '');
		const useTS = i.options.getBoolean('usets', false);
		let output: string;
		try {
			output = `${eval(useTS ? transpile(input) : input)}`;
		} catch (e: any) {
			output = e.stack;
		}
		const tokenRegex = new RegExp(i.client.token as string, 'g');
		i.reply({ content: `\`\`\`\n${output.replace(/```/g, '\`\`\`').replace(tokenRegex, '[TOKEN REDACTED]')}\n\`\`\``, ephemeral: true });
	}
}