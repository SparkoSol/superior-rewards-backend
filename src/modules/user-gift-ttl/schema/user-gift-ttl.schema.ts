import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';

export type UserGiftTtlDocument = HydratedDocument<UserGiftTtl>;

/*
  _id: {} (userGift),
  expiredAt: Date;
*/

@Schema({ timestamps: false, _id: true })
export class UserGiftTtl extends mongoose.Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() })
    _id: string;

    @Prop({ type: Date, required: true }) expireAt: Date; // Dynamic TTL field
}

export const UserGiftTtlSchema = SchemaFactory.createForClass(UserGiftTtl);

// Create an index for expireAt field to handle dynamic TTL
UserGiftTtlSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
