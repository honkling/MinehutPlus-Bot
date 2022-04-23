import { Client, Interaction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import EventListener from "../EventListener";

export default class SubmitIssue extends EventListener {
    constructor(public client: Client) {
        super(client);
        this.register("interactionCreate");
    }

    protected async execute(i: Interaction): Promise<void> {
        if (i.isModalSubmit() && i.customId === "issueForm") {
			const [title, description, platform] = [
				i.fields.getTextInputValue("title"),
				i.fields.getTextInputValue("description"),
				i.fields.getField("platform").value,
			];

			await i.channel?.lastMessage?.delete();

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
			await i.channel?.send({
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