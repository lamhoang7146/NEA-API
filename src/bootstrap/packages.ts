import { EmailModule } from '@/packages/email/email.module';
import { MinioModule } from '@/packages/minio/minio.module';
import { RedisModule } from '@/packages/redis/redis.module';
import { KafkaModule } from '@/packages/kafka/kafka.module';

export const PackagesModule = [
  EmailModule,
  MinioModule,
  RedisModule,
  KafkaModule,
];
