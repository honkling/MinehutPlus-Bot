import { ButtonInteraction, Client, GuildMember, Interaction } from "discord.js";
import Storage from "../../lib/storage";
import EventListener from "../EventListener";

export default class ReactionRole extends EventListener {
    constructor(public client: Client) {
        super(client);
        this.register("interactionCreate");
    }

    public async execute(i: Interaction) {
        if (!i.isButton() || !i.customId.startsWith("reactionRole")) return;
        const id = i.customId.match(/\d+/)[0];
        const role = Storage.getInstance().guild.roles.cache.get(id);
        const member = i.member as GuildMember;
        if (member?.roles.cache.has(role.id)) {
            await member?.roles.remove(role);
            return await i.reply({
                content: `You have removed the \`${role?.name}\` reaction role.`,
                ephemeral: true,
            });
        }
        await member?.roles.add(role);
        await i.reply({
            content: `You have received the \`${role?.name}\` reaction role.`,
            ephemeral: true,
        });
    }
}