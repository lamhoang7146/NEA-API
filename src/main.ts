import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

import { AppModule } from '@/bootstrap';
import { Endpoint } from '@/common/constants';
import { Main } from '@/common/interfaces';

const logger = new Logger('App');

async function bootstrap(): Promise<Main> {
  const app = await NestFactory.create(AppModule);

  app.use(
    graphqlUploadExpress({
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message:
            Object.values(error.constraints || {})[0] || 'Validation error',
        }));
        return new BadRequestException(result);
      },
    }),
  );

  const corsOptions: CorsOptions = {
    origin: [
      configService.get<string>(
        'EXPLORER_SANDBOX_GRAPHQL_ENDPOINT',
        Endpoint.EXPLORER_SANDBOX_GRAPHQL_ENDPOINT,
      ),
      configService.get<string>('FE_APP_URL', Endpoint.FE_APP_URL),
    ],
    credentials: true,
  };

  app.enableCors(corsOptions);
  app.use(cookieParser());

  const port = configService.get<number>('APP_PORT', 6002);
  await app.listen(port);

  return {
    endpoint: `${configService.get<number>('APP_URL')}/graphql`,
    sandbox: configService.get<string>(
      'EXPLORER_SANDBOX_GRAPHQL_ENDPOINT',
      Endpoint.EXPLORER_SANDBOX_GRAPHQL_ENDPOINT,
    ),
  };
}

bootstrap()
  .then((data: Main) => {
    logger.log(`🚀 Server: ${data.endpoint}`);
    logger.log(`🔧 Apollo Studio: ${data.sandbox}/sandbox/explorer`);
  })
  .catch((error) => {
    logger.error('❌ Server failed to start:', error);
    process.exit(1);
  });
