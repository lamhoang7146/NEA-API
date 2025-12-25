import { Kafka, Admin } from 'kafkajs';
import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { KAFKA_TOPICS } from '@/common/constants';

@Injectable()
export class KafkaAdminService implements OnModuleInit {
  private readonly kafka: Kafka;
  private readonly logger = new Logger(KafkaAdminService.name);

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: 'kafka-admin',
      brokers: this.getBrokers(),
    });
  }

  async onModuleInit() {
    await this.ensureTopicsExist();
  }

  public getBrokers(): string[] {
    const brokers = this.configService.get<string>('KAFKA_BROKERS');

    if (!brokers) {
      throw new Error('KAFKA_BROKERS is not defined');
    }

    return brokers.split(',').map((b) => b.trim());
  }

  private getRequiredTopics(): string[] {
    return Object.values(KAFKA_TOPICS);
  }

  private async getExistingTopics(admin: Admin): Promise<Set<string>> {
    const topics = await admin.listTopics();
    return new Set(topics);
  }

  private getTopicsToCreate(
    requiredTopics: string[],
    existingTopics: Set<string>,
  ): string[] {
    return requiredTopics.filter((topic) => !existingTopics.has(topic));
  }

  private async createTopics(admin: Admin, topics: string[]): Promise<void> {
    await admin.createTopics({
      topics: topics.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
      waitForLeaders: true,
    });
  }

  async ensureTopicsExist(): Promise<void> {
    const admin = this.kafka.admin();
    try {
      await admin.connect();
      this.logger.log('Connected to Kafka admin');

      const requiredTopics = this.getRequiredTopics();
      const existingTopics = await this.getExistingTopics(admin);
      const topicsToCreate = this.getTopicsToCreate(
        requiredTopics,
        existingTopics,
      );

      if (topicsToCreate.length > 0) {
        await this.createTopics(admin, topicsToCreate);
        this.logger.log(`Created topics: ${topicsToCreate.join(', ')}`);
      } else {
        this.logger.log(
          `All topics already exist: ${requiredTopics.join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to ensure topics exist: ${error.message}`,
        error.stack,
      );
      throw error;
    } finally {
      await admin.disconnect();
    }
  }

  async createTopic() {
    await this.ensureTopicsExist();
  }
}
