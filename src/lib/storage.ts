import { Client, Guild, Role } from "discord.js";
import Command from "../commands/Command";

export default class Storage {
    private static instance: Storage;
    private client: Client;
    public commands: Map<string, Command>;
    public guild: Guild;
    public everyone: Role;

    private constructor(client: Client) {
        Storage.instance = this;
        this.client = client;
        this.commands = new Map();
        this.client.guilds.fetch(process.env.GUILD_ID as string)
            .then((g) => {
                this.guild = g;
                this.everyone = g.roles.everyone;
            });
    }

    public static getInstance(client?: Client) {
        const instance = this.instance ?? new Storage(client);
        return instance;
    }
}