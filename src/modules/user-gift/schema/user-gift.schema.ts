import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Person } from '../../person/schema/person.schema';
import { Gift } from '../../gift/schema/gift.schema';
import { UserGiftStatus } from '../enum/status.enum';

export type UserGiftDocument = HydratedDocument<UserGift>;

/*
  user: {},
  gifts: [{}, {},  {}],
  status: '',
  isExpired: false,
  qrCode?: string;
*/

@Schema({ timestamps: true })
export class UserGift {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name })
    user: string;

    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Gift', required: true })
    gifts: mongoose.Schema.Types.ObjectId[];

    @Prop({ default: UserGiftStatus.PENDING })
    status: string;

    @Prop({ default: false })
    isExpired: boolean;

    @Prop({default: 0})
    totalPoints: number;

    @Prop()
    qrCode?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name})
    redeemBy?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name})
    performedBy?: string;
}

export const UserGiftSchema = SchemaFactory.createForClass(UserGift);
