import { Module, Global } from '@nestjs/common';

import { KafkaAdminService } from './admin.service';
import { ProducerService } from './producer.service';
import { ConsumerService } from './consumer.service';

@Global()
@Module({
  providers: [KafkaAdminService, ProducerService, ConsumerService],
  exports: [KafkaAdminService, ProducerService, ConsumerService],
})
export class KafkaModule {}
