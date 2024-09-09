import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

/*
  customerPhone: '',
  invoiceNo: '',
  amount: 0,
  points: 0,
  details?: '',
*/

@Schema({ timestamps: true })
export class Transaction {
  @Prop()
  customerPhone: string;

  @Prop()
  invoiceNo: string;

  @Prop()
  amount: number;

  @Prop()
  points: number;

  @Prop()
  details?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
