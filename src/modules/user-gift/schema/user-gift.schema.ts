import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Person } from '../../person/schema/person.schema';
import { Gift } from '../../gift/schema/gift.schema';
import { GiftStatus } from '../enum/status.enum';

export type UserGiftDocument = HydratedDocument<UserGift>;

/*
  user: {},
  gift: {},
  status: '',
  redeemedAt?: Date;
*/

@Schema({ timestamps: true })
export class UserGift {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name }) user: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Gift.name }) gift: string;

    @Prop({ default: GiftStatus.IN_PROGRESS }) status: string;

    @Prop() redeemedAt?: Date;

    @Prop() qrCode?: string;
}

export const UserGiftSchema = SchemaFactory.createForClass(UserGift);
