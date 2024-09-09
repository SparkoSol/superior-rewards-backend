import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TransactionType } from '../enum/type.enum';

export type TransactionDocument = HydratedDocument<Transaction>;

/*
  customerPhone: '',
  invoiceNo: '',
  amount: 0,
  points: 0,
  details?: '',
  type: '',
*/

@Schema({ timestamps: true })
export class Transaction {
  @Prop() customerPhone: string;

  @Prop() invoiceNo: string;

  @Prop() amount: number;

  @Prop() points: number;

  @Prop() details?: string;

  @Prop({ default: TransactionType.CREDIT }) type: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
