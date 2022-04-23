import { getModelForClass, prop } from "@typegoose/typegoose";

export class Role {
    @prop({ required: true })
    public id!: string;
}

export const RoleModel = getModelForClass(Role);