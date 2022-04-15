import { APIMessage } from "discord-api-types/v9";
import { ButtonInteraction, Client, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Modal, ReactionEmoji, SelectMenuInteraction, TextChannel, TextInputComponent, ThreadChannel } from "discord.js";
import EventListener from "./impl/EventListener";

export default class CreateIssue extends EventListener {
	private message?: Message<boolean>;

	constructor(public client: Client) {
		super(client);
		this.register("interactionCreate");
	}

	public async execute(i: Interaction) {
		if (i.isButton() && i.customId === "button_createIssue") {
			this.message = i.message as Message;
			const modal = new Modal({
				customId: "issueForm",
				title: "Create new issue",
				components: [
					new MessageActionRow({
						components: [
							new TextInputComponent({
								type: "TEXT_INPUT",
								customId: "title",
								style: "SHORT",
								label: "Title",
								required: true,
							}),
						],
					}),
					new MessageActionRow({
						components: [
							new TextInputComponent({
								type: "TEXT_INPUT",
								customId: "description",
								style: "PARAGRAPH",
								label: "Description",
								required: true,
							}),
						],
					}),
					new MessageActionRow({
						components: [
							new TextInputComponent({
								type: "SELECT_MENU",
								customId: "platform",
								style: "SHORT",
								label: "Platform affected",
								required: true,
							}),
						],
					}),
				],
			});
			i.showModal(modal);
		} else if (i.isButton() && i.customId === "button_deleteIssue") {
			const channel = i.channel as ThreadChannel;
			const pinneds = await (await channel.messages.fetchPinned()).values();
			const pinned: Message<boolean> = pinneds.next().value;
			const userId = Array.from(pinned.content.matchAll(/> Hey <@!(\d+).+/g))[0][1];
			if (i.user.id !== userId) return;
			await channel.delete();
		} else if (i.isModalSubmit() && i.customId === "issueForm") {
			const [title, description, platform] = [
				i.fields.getTextInputValue("title"),
				i.fields.getTextInputValue("description"),
				i.fields.getField("platform").value,
			];

			this.message?.delete();
			const embed = new MessageEmbed()
				.setAuthor({
					name: i.user.tag,
					iconURL: i.user.displayAvatarURL(),
				})
				.addFields([
					{
						name: "Description",
						value: description,
					},
					{
						name: "Platform affected",
						value: platform,
					}
				])

			const message = await i.channel?.send({
				embeds: [embed],
			});
			const thread = await message?.startThread({
				name: title,
			});

			await (await thread?.send({
				content: `> Hey <@!${i.user.id}>! Thank you for raising this ― please feel free to add anymore information to this thread.`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								customId: "button_deleteIssue",
								style: "SUCCESS",
								label: "Close",
								emoji: "🔒",
							}),
						],
					}),
				],
			}))?.pin();
			await thread?.lastMessage?.delete();

			await i.deferUpdate();
			this.message = await i.channel?.send({
				content: `___**Hey there, found a bug or have a suggestion?**___\nFeel free to file an issue.`,
				components: [
					new MessageActionRow({
						components: [
							new MessageButton({
								customId: "button_createIssue",
								style: "PRIMARY",
								label: "File an issue",
								emoji: "💡",
							}),
						],
					}),
				],
			});
		}
	}
}