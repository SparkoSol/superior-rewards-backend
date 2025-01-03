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
  performedBy: {},
*/

@Schema({ timestamps: true })
export class Transaction extends mongoose.Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name }) user: string;

    @Prop() customerPhone: string;

    @Prop() invoiceNo?: string;

    @Prop() amount?: number;

    @Prop() points: number;

    @Prop() details?: string;

    @Prop({ default: TransactionType.CREDIT }) type: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name })
    performedBy?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
