import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoleDocument = HydratedDocument<Role>;

/*
  name: '',
  deletedAt?: ''
*/

@Schema({ timestamps: true })
export class Role {
    @Prop() name: string;

    @Prop() deletedAt?: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
