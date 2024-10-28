import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as process from 'process';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableCors();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        })
    );

    console.log(`${process.env.APP_NAME_SLUG}-uploads`);

    app.useStaticAssets(join(process.cwd(), '..', `${process.env.APP_NAME_SLUG}-uploads`), {
        prefix: '/uploads/',
    });

    if (
        process.env.NODE_ENVIRONMENT === 'development' ||
        process.env.NODE_ENVIRONMENT === 'staging'
    ) {
        const config = new DocumentBuilder()
            .setTitle(process.env.APP_NAME)
            .setVersion('1.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
            .build();

        const options: SwaggerDocumentOptions = {
            operationIdFactory: (_: string, methodKey: string) => methodKey,
        };
        const document = SwaggerModule.createDocument(app, config, options);
        SwaggerModule.setup('swagger', app, document, {
            swaggerOptions: {
                defaultModelsExpandDepth: -1,
                persistAuthorization: true,
            },
        });
    }

    const port = process.env.APP_PORT;
    await app.listen(port);

    Logger.log('<=====================================================================>');
    Logger.log(`App is running on Port [${port}] & Environment is set to [${process.env.NODE_ENVIRONMENT}]`);
    Logger.log('<====================================================================>');
}
bootstrap().then((r) => console.log(r));
