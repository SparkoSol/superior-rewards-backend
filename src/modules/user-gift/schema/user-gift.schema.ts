import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Person } from '../../person/schema/person.schema';
import { Gift } from '../../gift/schema/gift.schema';
import { UserGiftStatus } from '../enum/status.enum';

export type UserGiftDocument = HydratedDocument<UserGift>;

/*
  user: {},
  gift: {},
  status: '',
  isExpired: false,
  qrCode?: string;
*/

@Schema({ timestamps: true })
export class UserGift {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name }) user: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Gift.name }) gift: string;

    @Prop({ default: UserGiftStatus.PENDING }) status: string;

    @Prop({ default: false }) isExpired: boolean;

    @Prop() qrCode?: string;
}

export const UserGiftSchema = SchemaFactory.createForClass(UserGift);
