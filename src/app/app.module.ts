import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '../config/db/db.module';
import { PersonModule } from '../modules/person/person.module';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    // Config modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.' + process.env.NODE_ENVIRONMENT,
    }),
    DbModule,
    AuthModule,
    PersonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
