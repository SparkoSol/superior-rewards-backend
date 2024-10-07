import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Role } from '../../role/schema/role.schema';

export type PersonDocument = HydratedDocument<Person>;

/*
  name: '',
  phone: '',
  dob: '',
  address?: '',
  password: '',
  profilePicture?: '',
  role: {},
  fcmTokens?: [''],
  points: 0,
  redeemedPoints: 0,
  addedInOdoo: false,
  deletedAt?: Date;

*/

@Schema({ timestamps: true, autoIndex: true })
export class Person {
    @Prop({ unique: true }) odooCustomerId?: number;

    @Prop() name: string;

    @Prop({ require: true }) phone: string;

    @Prop() dob?: Date;

    @Prop() address?: string;

    @Prop() password: string;

    @Prop() profilePicture?: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: Role.name}) role: string;

    @Prop({ type: [String] }) fcmTokens?: string[];

    @Prop({ default: 0 }) points: number;

    @Prop({ default: 0 }) redeemedPoints: number;

    @Prop({ default: false }) addedInOdoo: boolean;

    @Prop() deletedAt?: Date;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
