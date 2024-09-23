import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Role } from 'src/modules/gift copy/schema/role.schema';

export type PermissionDocument = HydratedDocument<Permission>;

/*
  role: {},
  name: '',
*/

@Schema({ timestamps: true })
export class Permission {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name }) role: string;
    @Prop() name: string;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
