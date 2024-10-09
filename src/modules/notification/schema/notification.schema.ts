import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Person } from '../../person/schema/person.schema';

export type NotificationDocument = Notification & mongoose.Document;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name })
    user: string;

    @Prop()
    title: string;

    @Prop()
    body: string;

    @Prop()
    imageUrl: string;

    @Prop({ type: Boolean, default: false })
    markAsRead: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
