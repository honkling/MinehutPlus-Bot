import { Interaction, Message, MessageActionRow, MessageButton, TextChannel } from 'discord.js';
import { join } from 'path';
import { CommandHandler } from './lib/CommandHandler';
import { token, ownerId, suggestionsChannel } from '../config.json';
import { MinehutClient } from './lib/MinehutClient';

const bot = new MinehutClient({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"], allowedMentions: { repliedUser: true, roles: [], users: [] } });
const INVITE_REGEX = /discord(?:\.com|app\.com|\.gg)[\/invite\/]?(?:[a-zA-Z0-9\-]{2,32})/g;

bot.on('ready', () => {
	console.log(`Logged in as ${bot.user?.tag}.`);
	new CommandHandler(bot, join(__dirname, "commands"))
		.registerGroups([
			{
				name: 'Miscellaneous',
				directory: 'misc',
			},
			{
				name: 'Moderation',
				directory: 'mod',
			},
			{
				name: 'Administration',
				directory: 'admin',
			},
		])
		.registerCommands();
	bot.initiateDatabase();
});

bot.on('messageCreate', async (msg: Message) => {
	if(msg.channel.id === suggestionsChannel && !msg.author.bot) {
		await msg.delete();
		await msg.author.send({ content: `Hey, you aren\'t allowed to talk in <#${msg.channel.id}>! If you want to give a suggestion for Minehut+, please use /suggest.`});
	}

	const invitesRaw = Array.from(msg.content.matchAll(INVITE_REGEX));
	if(invitesRaw) {
		// An invite was sent!
		const invites = invitesRaw[0];
		for(const link of invites) {
			const CODE_REGEX = /\/.+$/g;
			const codeRaw = link.match(CODE_REGEX);

			if(!codeRaw || codeRaw.length === 0)
				return;
			
			// We've got a code! Let's poll the Discord API to view information about the guild so we can filter if needed.
			const code = codeRaw[0].substring(1);
			const invite = await bot.fetchInvite(code);

			if(!invite || !invite.guild || invite.guild.id === '872306760394891315')
				return;
			
			// The invite sent wasn't for Minehut+. Let's filter it.
			await msg.delete();
		}
	}
});

bot.on('interactionCreate', async (i: Interaction) => {
	if(!i.isButton()) return;
	const textChannel = await bot.channels.fetch(suggestionsChannel) as TextChannel;
	const guildMember = await textChannel.guild.members.fetch(i.user.id);
	let slashReply: Message;
	switch (i.customId) {
		case 'suggestions_thread':
			slashReply = await textChannel.messages?.fetch(i.message.id);
			if(!slashReply.hasThread) {
				const threadChannel = await slashReply.startThread({ name: `suggestion-${i.user.username.toLowerCase()}`, autoArchiveDuration: 1440 });
				i.reply({ content: `Started a new thread, view it at <#${threadChannel.id}>.`, ephemeral: true });
			} else {
				i.reply({ content: `That suggestion already has a thread, view it at <#${slashReply.thread?.id}>.`, ephemeral: true });
			}
			break;
		case 'suggestions_delete':
			slashReply = await textChannel.messages?.fetch(i.message.id);
			if(i.user.id === i.message.interaction?.user.id) {
				if(slashReply.hasThread) slashReply.thread?.delete();
				slashReply.delete();
			} else if(i.user.id === ownerId) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('suggestions_forceDelete')
							.setLabel('Force Delete')
							.setEmoji('🗑️')
							.setStyle('DANGER')
					);
				i.reply({ content: 'Are you sure you want to force delete this suggestion? This action is irreversible!', components: [row], ephemeral: true });
			} else {
				i.reply({ content: 'You can\'t do that! You aren\'t the owner of the suggestion.', ephemeral: true });
			}
			break;
		case 'suggestions_forceDelete':
			slashReply = await textChannel.messages?.fetch(i.message.id);
			if(i.user.id === ownerId) {
				const referenceMessage = (await slashReply.fetchReference());
				if(referenceMessage.hasThread) referenceMessage.thread?.delete();
				referenceMessage.delete();
				i.reply({ content: 'The suggestion has been deleted.', ephemeral: true });
			}
			break;
	}
	if(i.customId.startsWith('rr_')) {
		const role = await i.guild?.roles.fetch(i.customId.replace(/rr_/g, ''));
		if(!role) return;
		if(!guildMember.roles.cache.has(role.id)) {
			guildMember.roles.add(role);
			i.reply({ content: `You have been given the \`${role.name}\` role.`, ephemeral: true });
		} else {
			guildMember.roles.remove(role);
			i.reply({ content: `The \`${role.name}\` role has been taken away.`, ephemeral: true });
		}
		return;
	}
});

bot.login(token);