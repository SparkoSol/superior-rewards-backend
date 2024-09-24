import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { UserGift } from '../../user-gift/schema/user-gift.schema';

export type UserGiftTtlDocument = HydratedDocument<UserGiftTtl>;

/*
  userGift: {},
  expiredAt: Date;
*/

@Schema({ timestamps: false })
export class UserGiftTtl extends mongoose.Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserGift.name }) userGift: string;

    @Prop({ type: Date, expires: '5m', required: true }) createdAt: Date;
}

export const UserGiftTtlSchema = SchemaFactory.createForClass(UserGiftTtl);
