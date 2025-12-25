import { EmailTemplateEnum } from '@/packages/email/email-template.enum';
import { v4 as uuidv4 } from 'uuid';

interface EventEnvelope<TPayload> {
  type: EmailTemplateEnum;
  payload: TPayload;
  timestamp: number;
  id: string;
}

export function buildEventProducer<TPayload>(
  type: EmailTemplateEnum,
  payload: TPayload,
): EventEnvelope<TPayload> {
  return {
    type,
    payload,
    timestamp: Date.now(),
    id: uuidv4(),
  };
}
