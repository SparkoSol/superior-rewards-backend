import { forwardRef, Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonController } from './person.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Person, PersonSchema } from './schema/person.schema';
import { NotificationModule } from '../notification/notification.module';
import { RoleModule } from '../role/role.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Person.name,
                schema: PersonSchema,
            },
        ]),
        forwardRef(() => NotificationModule),
        forwardRef(() => RoleModule),
    ],
    providers: [PersonService],
    controllers: [PersonController],
    exports: [PersonService],
})
export class PersonModule {}
