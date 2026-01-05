import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Person } from '../../person/schema/person.schema';
import { UserGift } from '../../user-gift/schema/user-gift.schema';

export type CertificateDocument = HydratedDocument<Certificate>;

@Schema({ timestamps: true })
export class CertificateMetadata {
    @Prop({ required: true })
    customerName: string;

    @Prop()
    customerId: string;

    @Prop()
    customerEmail: string;

    @Prop({ required: true })
    pointsRedeemed: number;

    @Prop({ required: true })
    monetaryValue: number;

    @Prop()
    transactionId: string;

    @Prop({ required: true })
    redemptionDate: Date;
}

@Schema({ timestamps: true })
export class Certificate {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: UserGift.name, required: true })
    userGiftId: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, unique: true })
    certificateNumber: string;

    @Prop({ required: true, unique: true })
    verificationCode: string;

    @Prop()
    htmlContent: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Person.name, required: true })
    generatedBy: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, default: () => new Date() })
    generatedAt: Date;

    @Prop()
    downloadedAt: Date;

    @Prop()
    printedAt: Date;

    @Prop({ type: CertificateMetadata, required: true })
    metadata: CertificateMetadata;
}

export const CertificateSchema = SchemaFactory.createForClass(Certificate);
