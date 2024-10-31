import { RoleService } from './role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleController } from './role.controller';
import { Role, RoleSchema } from './schema/role.schema';
import { forwardRef, Global, Module } from '@nestjs/common';
import { PersonModule } from '../person/person.module';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
        forwardRef(() => PersonModule),
    ],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule {}
