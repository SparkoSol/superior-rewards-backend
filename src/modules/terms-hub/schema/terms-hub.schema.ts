import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { TermsHubsType } from '../enum/type.enum';

export type TermsHubDocument = TermsHub & mongoose.Document;

@Schema({ timestamps: true })
export class TermsHub {
    @Prop({
        required: true,
        default: TermsHubsType.POLICY,
        enum: TermsHubsType,
    })
    type: string;

    @Prop()
    details?: string;
}

export const TermsHubSchema = SchemaFactory.createForClass(TermsHub);
