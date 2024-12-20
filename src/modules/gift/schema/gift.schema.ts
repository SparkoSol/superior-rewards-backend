import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Person } from '../../person/schema/person.schema';

export type GiftDocument = HydratedDocument<Gift>;

/*
  name: '',
  image?: '',
  points: 0,
  deletedAt?: Date;
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
*/

@Schema({ timestamps: true })
export class Gift {
    @Prop() name: string;

    @Prop() image?: string;

    @Prop() points: number;

    @Prop() deletedAt?: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name})
    performedBy?: string;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
