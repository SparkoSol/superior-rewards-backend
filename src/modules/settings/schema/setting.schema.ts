import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Person } from '../../person/schema/person.schema';

export type SettingDocument = HydratedDocument<Setting>;

/*
    amount: 1,
    points: 100,
*/

@Schema({ timestamps: true })
export class Setting {
    @Prop({default: 1}) amount: number;

    @Prop({default: 1}) points: number;

}

export const SettingSchema = SchemaFactory.createForClass(Setting);
