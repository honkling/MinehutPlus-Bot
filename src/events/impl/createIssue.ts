import { Client, Interaction, Message, MessageActionRow, MessageButton, MessageEmbed, Modal, TextInputComponent, ThreadChannel } from "discord.js";
import EventListener from "../EventListener";

export default class CreateIssue extends EventListener {
	private message?: Message<boolean>;

	constructor(public client: Client) {
		super(client);
		this.register("interactionCreate");
	}

	public async execute(i: Interaction) {
		if (i.isButton() && i.customId === "button_createIssue") {
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
								type: "TEXT_INPUT",
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
		}
	}
}