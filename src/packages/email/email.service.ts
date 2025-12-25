import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

import { EmailTemplateEnum } from '@/packages/email/email-template.enum';

@Injectable()
export class EmailService {
  private readonly logger: Logger;

  constructor(private readonly mailerService: MailerService) {
    this.logger = new Logger(EmailService.name);
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    template: EmailTemplateEnum,
    context?: Record<string, any>,
  ): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
        template,
        context,
      });
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      return false;
    }
  }
}
