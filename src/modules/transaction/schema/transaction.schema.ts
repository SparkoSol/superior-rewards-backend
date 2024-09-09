import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TransactionType } from '../enum/type.enum';
import { Person } from '../../person/schema/person.schema';

export type TransactionDocument = HydratedDocument<Transaction>;

/*
  user: {},
  customerPhone: '',
  invoiceNo?: '',
  amount?: 0,
  points: 0,
  details?: '',
  type: '',
*/

@Schema({ timestamps: true })
export class Transaction {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name }) user: string;

    @Prop() customerPhone: string;

    @Prop() invoiceNo?: string;

    @Prop() amount?: number;

    @Prop() points: number;

    @Prop() details?: string;

    @Prop({ default: TransactionType.CREDIT }) type: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
