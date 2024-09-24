import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import * as process from 'process';
import { Person } from '../../person/schema/person.schema';
import { Gift } from '../../gift/schema/gift.schema';
import { UserGift } from '../../user-gift/schema/user-gift.schema';

export type UserGiftTtlDocument = HydratedDocument<UserGiftTtl>;

/*
  user: {},
  gift: {},
  reference: {},
  isExpired: false,
  expiredAt: Date;
*/

@Schema({ timestamps: false })
export class UserGiftTtl {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name }) user: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Gift.name }) gift: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId , ref: UserGift.name}) reference: string;

    @Prop({ default: false }) isExpired: boolean;

    @Prop({ expires: process.env.TOKEN_EXPIRY, required: true }) createdAt: Date;
}

export const UserGiftTtlSchema = SchemaFactory.createForClass(UserGiftTtl);
