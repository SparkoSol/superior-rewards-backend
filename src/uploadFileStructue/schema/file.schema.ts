import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class FileSchema {
    @Prop()
    name: string;

    @Prop()
    path: string;
}
