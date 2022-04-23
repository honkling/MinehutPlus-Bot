import { Client, CommandInteraction } from "discord.js";
import { CommandData } from "../lib/CommandData";

export default class Command {
    public data?: CommandData;

    constructor(protected client: Client) {};

    protected register(data: CommandData) {
        this.data = data;
    }

    public execute(i: CommandInteraction) {};
}