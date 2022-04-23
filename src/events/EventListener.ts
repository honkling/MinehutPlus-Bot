import { Client } from "discord.js";

export default class EventListener {
	constructor(public client: Client<boolean>) {};

	protected register(eventName: string) {
		this.client.on(eventName, (...args) => {
			this.execute(...args);
		});
	}

	protected execute(...args: any[]) {};
}