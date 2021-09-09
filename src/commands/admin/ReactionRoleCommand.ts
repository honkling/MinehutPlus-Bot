import { ArgumentType } from "../../lib/ArgumentType";
import { Command } from "../../lib/Command";
import { roles, guild } from "../../../config.json";
import { CommandInteraction, MessageActionRow, MessageEmbed, Role } from "discord.js";
import { MinehutClient } from "../../lib/MinehutClient";
import { EmbedColors, properCase } from "../../lib/Util";
import { APIRole } from "discord-api-types";

export default class ReactionRoleCommand {
	@Command({
		name: 'rr',
		group: 'admin',
		meta: {
			description: 'Manage reaction roles.',
			examples: ['list', 'mark role:@Updates', 'demark role:@Maintainer', 'update'],
		},
		args: [
			{
				name: 'mark',
				description: 'Mark a role as a reaction role.',
				type: ArgumentType.SUB_COMMAND,
				options: [
					{
						name: 'role',
						description: 'The role to mark.',
						type: ArgumentType.ROLE,
						required: true
					},
				],
			},
			{
				name: 'demark',
				description: 'Demark a role.',
				type: ArgumentType.SUB_COMMAND,
				options: [
					{
						name: 'role',
						description: 'The role to demark.',
						type: ArgumentType.ROLE,
						required: true,
					},
				],
			},
			{
				name: 'list',
				description: 'List all reaction roles.',
				type: ArgumentType.SUB_COMMAND,
			},
			{
				name: 'update',
				description: 'Update the reaction roles message.',
				type: ArgumentType.SUB_COMMAND,
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
		const subcommand = i.options.getSubcommand(true);
		const bot = MinehutClient.getInstance();
		const db = MinehutClient.getDatabase();
		const g = await bot.guilds.fetch(guild);
		let role: Role | APIRole;
		switch (subcommand) {
			case 'mark':
				role = i.options.getRole('role', true);
				db.get('SELECT * FROM reactionRoles WHERE role = ?', [role.id], (err: Error, row: any) => {
					if(err) console.error(err);
					if(row) return i.reply({ content: 'That role is already marked.', ephemeral: true });
					db.run(`INSERT INTO reactionRoles(role) VALUES(?)`, [role.id], (err: Error) => {
						if(err) {
							i.reply({ content: `An error occurred marking the role.\n\`\`\`\n${err}\n\`\`\`.`, ephemeral: true });
							return console.error(err);
						}
						i.reply({ content: 'The role has been marked.', ephemeral: true });
					});
				});
				break;
			case 'demark':
				role = i.options.getRole('role', true); 
				db.get('SELECT * FROM reactionRoles WHERE role = ?', [role.id], (err: Error, row: any) => {
					if(err) {
						i.reply({ content: `An error occurred demarking the role.\n\`\`\`\n${err}\n\`\`\``, ephemeral: true });
						return console.error(err);
					}
					if(!row) return i.reply({ content: 'That role isn\'t marked.', ephemeral: true });
					db.run(`DELETE FROM reactionRoles WHERE role = ?`, [role.id], (err: Error) => {
						if(err) {
							i.reply({ content: `Failed to demark that reaction role.`, ephemeral: true });
							return console.error(err);
						}
						i.reply({ content: 'The role has been demarked.', ephemeral: true });
					});
				});
				break;
			case 'list':
				db.all('SELECT * FROM reactionRoles', async (err: Error, rows: any) => {
					if(err) {
						i.reply({ content: `An error occurred grabbing the list of reaction roles.\n\`\`\`\n${err}\n\`\`\``, ephemeral: true });
						return console.error(err);
					}
					if(rows.length === 0) return i.reply({ content: 'There are no marked roles to be listed.', ephemeral: true });
					const mappedRoles: string[] = await Promise.all(rows.map(async (row: any) => {
						const role = await g.roles.fetch(row.role);
						if(!role) return;
						return properCase(role.name);
					}));
					const embed = new MessageEmbed()
						.setTitle('Reaction Roles')
						.setDescription(`Here is a list of all reaction roles.\n\n\`${mappedRoles.join('\`, \`')}\``)
						.setColor(EmbedColors.PRIMARY);
					i.reply({ embeds: [embed], ephemeral: true });
				});
				break;
			case 'update':
				this.refresh(i);
				break;
		}
	}

	async refresh(i: CommandInteraction) {
		const bot = MinehutClient.getInstance();
		const db = MinehutClient.getDatabase();
		const g = await bot.guilds.fetch(guild);
		const actionRow = new MessageActionRow();
		db.all('SELECT * FROM reactionRoles', async (err: Error, rows: any) => {
			if(err) {
				i.reply({ content: `An error occurred grabing the list of reaction roles.\n\`\`\`\n${err}\n\`\`\``, ephemeral: true });
				return console.error(err);
			}
			for(const row of rows) {
				const role = await g.roles.fetch(row.role);
				if(!role) return i.reply({ content: 'Failed to find that role.', ephemeral: true });
				actionRow.addComponents([{
					customId: `rr_${role.id}`,
					label: role.name,
					type: 'BUTTON',
					style: 'PRIMARY',
				}]);
			}
			i.channel?.send({ content: 'Click a button below to receive a role. Click the same button again if you want to remove the role.', components: [actionRow] });
			i.reply({ content: 'Done.', ephemeral: true });
		});
	}
}