import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import Command from "../Command";

export default class Issue extends Command {
    constructor(public client: Client) {
        super(client);
        const guild = client.guilds.cache.get(process.env.GUILD_ID as string);
        this.register({
            name: "issue",
            description: "Create a new issue form.",
            defaultPermission: false,
            permissions: [
                {
                    id: guild?.roles.everyone.id as string,
                    type: "ROLE",
                    permission: false,
                },
                {
                    id: process.env.MAINTAINER as string,
                    type: "ROLE",
                    permission: true,
                },
            ],
        });
    }

    public async execute(i: CommandInteraction) {
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
        await i.reply({
            content: "Done.",
            ephemeral: true,
        });
    }
}