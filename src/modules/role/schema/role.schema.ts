import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Permission } from '../../permission/schema/permission.schema';

export type RoleDocument = HydratedDocument<Role>;

/*
  name: '',
  permissions: [],
  deletedAt?: ''
*/

@Schema({ timestamps: true })
export class Role {
    @Prop() name: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: Permission.name }] })
    permissions: mongoose.Schema.Types.ObjectId[];

    @Prop() deletedAt?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
