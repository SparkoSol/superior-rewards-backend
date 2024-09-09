import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './schema/person.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }])],
    providers: [PersonService],
    controllers: [PersonController],
    exports: [PersonService],
})
export class PersonModule {}
