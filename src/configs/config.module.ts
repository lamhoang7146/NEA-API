import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      envFilePath: (() => {
        switch (process.env.APP_ENV) {
          case 'production':
            return '.env';
          case 'development':
            return '.env.dev';
          default:
            return '.env';
        }
      })(),
      validationSchema: Joi.object({
        // App
        APP_ENV: Joi.string().valid('development', 'production').required(),
        APP_PORT: Joi.number().default(6002),
        APP_URL: Joi.string().uri().required(),
        FE_APP_URL: Joi.string().uri().required(),

        // Database PostgreSQL
        DB_POSTGRESQL_VERSION: Joi.string().optional(),
        DB_POSTGRESQL_DATABASE: Joi.string().required(),
        DB_POSTGRESQL_HOST: Joi.string().default('localhost'),
        DB_POSTGRESQL_USERNAME: Joi.string().required(),
        DB_POSTGRESQL_PASSWORD: Joi.string().required(),
        DB_POSTGRESQL_PORT: Joi.number().default(5432),
        DB_POSTGRESQL_SYNCHRONIZE: Joi.boolean().default(false),
        DB_POSTGRESQL_LOGGING: Joi.boolean().default(false),
        DATABASE_URL: Joi.string().uri().optional(),

        // Database MongoDB
        DB_MONGODB_VERSION: Joi.string().optional(),
        DB_MONGODB_DATABASE: Joi.string().optional(),
        DB_MONGODB_HOST: Joi.string().default('localhost'),
        DB_MONGODB_USERNAME: Joi.string().optional(),
        DB_MONGODB_PASSWORD: Joi.string().optional(),
        DB_MONGODB_PORT: Joi.number().default(27017),
        MONGODB_URL: Joi.string().uri().optional(),

        // Redis
        REDIS_VERSION: Joi.string().optional(),
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),
        REDIS_SESSION_EXPIRES_IN: Joi.number().default(1296000),
        REDIS_SCAN_COUNT: Joi.number().default(100),
        REDIS_DB: Joi.number().default(0),

        // MinIO
        MINIO_VERSION: Joi.string().optional(),
        MINIO_BASE_URL: Joi.string().default('localhost'),
        MINIO_HOST: Joi.string().default('localhost'),
        MINIO_PORT: Joi.number().default(9000),
        MINIO_CONSOLE_PORT: Joi.number().default(9001),
        MINIO_USE_SSL: Joi.boolean().default(false),
        MINIO_ROOT_USER: Joi.string().required(),
        MINIO_ROOT_PASSWORD: Joi.string().required(),

        // Kafka Configuration
        KAFKA_BROKERS: Joi.string().required(),
        KAFKA_PORT: Joi.number().default(9092),

        // Kafka UI Configuration
        KAFKA_UI_VERSION: Joi.string().optional(),
        KAFKA_UI_PORT: Joi.number().default(8080),
        KAFKA_CLUSTER_NAME: Joi.string().default('local'),

        // Mail
        MAIL_HOST: Joi.string().default('smtp.gmail.com'),
        MAIL_PORT: Joi.number().default(465),
        MAIL_USER: Joi.string().email().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().default('no-reply@nova.com'),

        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('24h'),

        MODEL_ID: Joi.string().required(),
        MODEL_VERSION: Joi.string().required(),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
  ],
})
export class ConfigCustomModule {}
