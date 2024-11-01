import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Role } from '../../role/schema/role.schema';

export type PersonDocument = HydratedDocument<Person>;

/*
  odooCustomerId?: number; // Unique and auto generated
  name: '',
  phone: '',
  dob?: Date,
  address?: '',
  password: '',
  profilePicture?: '',
  role: {},
  fcmTokens?: [''],
  points: 0,
  redeemedPoints: 0,
  addedInOdoo: false,
  deletedAt?: Date;

  //NEW FIELDS FROM EXCEL
  email?: '',
  country?: '',
  customerNumber?: number,

*/

@Schema({ timestamps: true })
export class Person {
    @Prop() odooCustomerId?: number;

    @Prop() name: string;

    @Prop({ require: true }) phone: string;

    @Prop() dob?: Date;

    @Prop() address?: string;

    @Prop() password: string;

    @Prop() profilePicture?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name }) role: string;

    @Prop({ type: [String] }) fcmTokens?: string[];

    @Prop({ default: 0 }) points: number;

    @Prop({ default: 0 }) redeemedPoints: number;

    @Prop({ default: false }) addedInOdoo: boolean;

    @Prop() deletedAt?: Date;

    @Prop() email?: string;

    @Prop() country?: string;

    @Prop() customerNumber?: number;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
