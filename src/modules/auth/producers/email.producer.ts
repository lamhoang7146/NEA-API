import { Injectable } from '@nestjs/common';

import { ProducerService } from '@/packages/kafka/producer.service';
import { KAFKA_TOPICS } from '@/common/constants';
import { buildEventProducer } from '@/common/helpers';
import { EmailTemplateEnum } from '@/packages/email/email-template.enum';
import {
  AccountVerificationPayload,
  ForgotPasswordPayload,
} from '../interfaces';

@Injectable()
export class EmailProducer {
  constructor(private readonly producerService: ProducerService) {}

  async sendForgotPasswordEmail(
    type: EmailTemplateEnum,
    payload: ForgotPasswordPayload,
  ) {
    return await this.producerService.produce({
      topic: KAFKA_TOPICS.EMAIL,
      messages: [
        {
          value: JSON.stringify(
            buildEventProducer<ForgotPasswordPayload>(type, payload),
          ),
        },
      ],
    });
  }

  async sendAccountVerificationEmail(
    type: EmailTemplateEnum,
    payload: AccountVerificationPayload,
  ) {
    return await this.producerService.produce({
      topic: KAFKA_TOPICS.EMAIL,
      messages: [
        {
          value: JSON.stringify(
            buildEventProducer<AccountVerificationPayload>(type, payload),
          ),
        },
      ],
    });
  }
}
