import { BeAnObject, IObjectWithTypegooseFunction } from "@typegoose/typegoose/lib/types";
import { Client, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { Role, RoleModel } from "../../lib/schemas/Role";
import Storage from "../../lib/storage";
import Command from "../Command";

export default class Roles extends Command {
    constructor(public client: Client) {
        super(client);
        this.register({
            name: "roles",
            description: "Manage reaction roles.",
            defaultPermission: false,
            permissions: [
                {
                    id: Storage.getInstance().everyone.id,
                    type: "ROLE",
                    permission: false,
                },
                {
                    id: process.env.MAINTAINER as string,
                    type: "ROLE",
                    permission: true,
                },
            ],
            options: [
                {
                    name: "show",
                    description: "Send a message for reaction roles.",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                },
                {
                    name: "list",
                    description: "List all reaction roles.",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                },
                {
                    name: "add",
                    description: "Add a reaction role.",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "role",
                            description: "The reaction role.",
                            type: ApplicationCommandOptionTypes.ROLE,
                            required: true,
                        },
                    ],
                },
                {
                    name: "remove",
                    description: "Remove a reaction role.",
                    type: ApplicationCommandOptionTypes.SUB_COMMAND,
                    options: [
                        {
                            name: "role",
                            description: "The reaction role.",
                            type: ApplicationCommandOptionTypes.ROLE,
                            required: true,
                        },
                    ],
                },
            ],
        });
    }

    public async execute(i: CommandInteraction) {
        const subcommand = i.options.getSubcommand(true);

        switch (subcommand) {
            case "show":
                this.show(i);
                break;
            case "list":
                this.list(i);
                break;
            case "add":
                this.add(i);
                break;
            case "remove":
                this.remove(i);
                break;
        }
    }

    private async show(i: CommandInteraction) {
        const row = new MessageActionRow()
            .addComponents((await RoleModel.find()).map((r) => {
                const role = Storage.getInstance().guild.roles.cache.get(r.id);

                return new MessageButton()
                    .setCustomId(`reactionRole_${r.id}`)
                    .setLabel(role?.name)
                    .setStyle("PRIMARY");
            }));
        
        await i.channel?.send({
            content: "Click a button below to receive a role. Click the button again to remove the role.",
            components: [row],
        });
        await i.reply({
            content: "Done.",
            ephemeral: true,
        });
    }

    private async list(i: CommandInteraction) {
        let n = 0;
        const roles = (await RoleModel.find())
            .map((r) => {
                n++;
                return `${n}. <@&${r.id}>`;
            })
            .filter((r) => r !== null);

        const embed = new MessageEmbed()
            .setTitle(`There are a total of ${roles.length} reaction roles.`)
            .setDescription(roles.join("\n"));

        await i.reply({
            embeds: [embed],
        });
    }

    private async add(i: CommandInteraction) {
        const role = i.options.getRole("role", true);

        const roleExists = await RoleModel.exists({
            id: role.id,
        });

        if (roleExists)
            return await i.reply({
                content: "That role is already a reaction role.",
            });
        
        await RoleModel.create({
            id: role.id,
        });
        await i.reply({
            content: "A new reaction role has been created.",
        });
    }

    private async remove(i: CommandInteraction) {
        const { id } = i.options.getRole("role", true);
        const roleExists = await RoleModel.exists({
            id,
        });

        if (roleExists === null)
            return await i.reply({
                content: "That role isn't a reaction role.",
            });

        await RoleModel.deleteOne({
            id,
        });
        await i.reply({
            content: "A reaction role has been removed.",
        });
    }
}