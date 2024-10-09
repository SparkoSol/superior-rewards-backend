import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;

/*
  name: '',
*/

@Schema({ timestamps: true })
export class Permission {
    @Prop() name: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
