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

    @Prop({ type: Date, required: true }) expireAt: Date; // Dynamic TTL field
}

export const UserGiftTtlSchema = SchemaFactory.createForClass(UserGiftTtl);

// Create an index for expireAt field to handle dynamic TTL
UserGiftTtlSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
