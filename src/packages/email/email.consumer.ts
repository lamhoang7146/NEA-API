import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConsumerService } from '@/packages/kafka/consumer.service';
import { KafkaAdminService } from '@/packages/kafka/admin.service';
import { EmailService } from '@/packages/email/email.service';
import { KAFKA_TOPICS } from '@/common/constants';
import {
  AccountVerificationPayload,
  ForgotPasswordPayload,
} from '@/modules/auth/interfaces';
import { EmailTemplateEnum } from '@/packages/email/email-template.enum';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    private readonly consumerService: ConsumerService,
    private readonly kafkaAdminService: KafkaAdminService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.kafkaAdminService.ensureTopicsExist();
    await this.consumerService.consume(
      {
        topics: [KAFKA_TOPICS.EMAIL],
      },
      {
        eachMessage: async ({ message }) => {
          const value: {
            type: EmailTemplateEnum;
            payload: AccountVerificationPayload | ForgotPasswordPayload;
            timestamp: number;
            id: string;
          } = JSON.parse(message.value?.toString() ?? '{}');
          if (!value) return;

          const { type, payload, timestamp, id } = value;
          try {
            switch (type) {
              case 'account-verification': {
                const { email, accessToken } = payload;
                const verificationUrl: string = `${this.configService.get<string>('FE_APP_URL')}/auth/verify-email?token=${accessToken}`;

                await this.emailService.sendEmail(
                  email,
                  'Account verification',
                  'Click the link to verify your email',
                  type,
                  {
                    verificationUrl,
                  },
                );
                break;
              }

              case 'forgot-password': {
                const { email, accessToken } = payload;
                const resetUrl: string = `${this.configService.get<string>('FE_APP_URL')}/auth/reset-password?token=${accessToken}`;

                await this.emailService.sendEmail(
                  email,
                  'Password reset request',
                  'Click the link to reset your password',
                  type,
                  {
                    resetUrl,
                  },
                );
                break;
              }
            }
          } catch (err) {
            this.logger.error('Failed to process forgot-password message', err);
          } finally {
            this.logger.log(
              `Processed message ${id} at ${new Date(timestamp).toISOString()}`,
            );
          }
        },
      },
    );
  }
}
