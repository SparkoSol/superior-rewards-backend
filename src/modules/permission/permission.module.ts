import { PermissionService } from './permission.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionController } from './permission.controller';
import { Permission, PermissionSchema } from './schema/permission.schema';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Permission.name, schema: PermissionSchema }])],
    controllers: [PermissionController],
    providers: [PermissionService],
    exports: [PermissionService],
})
export class PermissionModule {}
