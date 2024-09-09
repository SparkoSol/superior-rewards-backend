import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '../config/db/db.module';

@Module({
  imports: [
    // Config modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.' + process.env.NODE_ENVIRONMENT,
    }),
    DbModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
