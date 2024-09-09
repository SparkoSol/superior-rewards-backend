import { Role } from '../enum/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

/*
  name: '',
  phone: '',
  dob: '',
  password: '',
  profilePicture?: '',
  role: '',
  fcmTokens: [''],
  points: 0,
  deletedAt?: Date;

*/

@Schema({ timestamps: true })
export class Person {
  @Prop() name: string;

  @Prop({require: true}) phone: string;

  @Prop() dob: Date;

  @Prop() password: string;

  @Prop() profilePicture?: string;

  @Prop({ default: Role.USER }) role: string;

  @Prop({ type: [String] }) fcmTokens: string[];

  @Prop() points: number;

  @Prop() deletedAt?: Date;
}

export const PersonSchema = SchemaFactory.createForClass(Person);