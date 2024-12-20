import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GiftDocument = HydratedDocument<Gift>;

/*
  name: '',
  image?: '',
  points: 0,
  deletedAt?: Date;
*/

@Schema({ timestamps: true })
export class Gift {
    @Prop() name: string;

    @Prop() image?: string;

    @Prop() points: number;

    @Prop() deletedAt?: Date;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
