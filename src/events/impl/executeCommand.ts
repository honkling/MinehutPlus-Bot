import { Client, Interaction } from "discord.js";
import Logger from "../../lib/logger";
import Storage from "../../lib/storage";
import EventListener from "../EventListener";

export default class ExecuteCommand extends EventListener {
    constructor(public client: Client) {
        super(client);
        this.register("interactionCreate");
    }

    public async execute(i: Interaction): Promise<void> {
        if (!i.isCommand()) return;

        const { commandName: name } = i;
        Storage.getInstance().commands.get(name)?.execute(i);
    }
}