import { ApplicationCommandData, ApplicationCommandPermissionData } from "discord.js";

export type CommandData = ApplicationCommandData & {
    permissions?: ApplicationCommandPermissionData[];
};