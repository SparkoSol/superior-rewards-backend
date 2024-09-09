import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GiftDocument = HydratedDocument<Gift>;

/*
  name: '',
  image?: '',
  points: 0
*/

@Schema({ timestamps: true })
export class Gift {
  @Prop()
  name: string;

  @Prop()
  image?: string;

  @Prop()
  points: number;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);
