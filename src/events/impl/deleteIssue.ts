import { Client, Interaction, Message, ThreadChannel } from "discord.js";
import EventListener from "../EventListener";

export default class DeleteIssue extends EventListener {
    constructor(public client: Client) {
        super(client);
        this.register("interactionCreate");
    }

    protected async execute(i: Interaction): Promise<void> {
        if (i.isButton() && i.customId === "button_deleteIssue") {
			const channel = i.channel as ThreadChannel;
			const pinneds = await (await channel.messages.fetchPinned()).values();
			const pinned: Message<boolean> = pinneds.next().value;
			const userId = Array.from(pinned.content.matchAll(/> Hey <@!(\d+).+/g))[0][1];
			if (i.user.id !== userId) return;
			await channel.delete();
            const message = await channel.fetchStarterMessage();
            await message.delete();
		}
    }
}