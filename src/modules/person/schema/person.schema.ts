import { Role } from '../enum/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonDocument = HydratedDocument<Person>;

/*
  name: '',
  phone: '',
  email?: '',
  password: '',
  profilePicture?: '',
  role: '',
  description?: '',
  fcmTokens: [''],

*/

@Schema({ timestamps: true })
export class Person {
  @Prop() name: string;

  @Prop({require: true, unique: true}) phone: string;

  @Prop() email?: string;

  @Prop() password: string;

  @Prop() profilePicture?: string;

  @Prop({ default: Role.USER }) role: string;

  @Prop() description?: string;

  @Prop({ type: [String] }) fcmTokens: string[];
}

export const PersonSchema = SchemaFactory.createForClass(Person);