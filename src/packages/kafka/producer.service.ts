import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  Kafka,
  Partitioners,
  Producer,
  ProducerRecord,
  RecordMetadata,
} from 'kafkajs';
import { KafkaAdminService } from './admin.service';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(private readonly kafkaAdminService: KafkaAdminService) {
    this.kafka = new Kafka({
      brokers: this.kafkaAdminService.getBrokers(),
    });

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.DefaultPartitioner,
    });
  }

  async onModuleInit() {
    await this.kafkaAdminService.ensureTopicsExist();
    await this.producer.connect();
  }

  async produce(record: ProducerRecord): Promise<RecordMetadata[]> {
    return this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
