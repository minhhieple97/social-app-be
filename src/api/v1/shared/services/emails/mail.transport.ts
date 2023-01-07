import { COMMON } from '@globalV1/constants';
import { config } from '@root/config';
import { Logger } from 'winston';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import sendGridMail from '@sendgrid/mail';
import { BadRequestError } from '@globalV1/helpers/error-handler';
interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

class MailTransport {
  logger: Logger;
  constructor() {
    this.logger = config.createLogger('mail');
  }

  public async sendMail(receiverEmail: string, body: string, subject: string): Promise<void> {
    if (config.IS_PRODUCTION) {
      return this.developmentEmailSender(receiverEmail, subject, body);
    }
    return this.productionEmailSender(receiverEmail, subject, body);
  }

  private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const transporter: Mail = nodemailer.createTransport({
      host: config.SENDER_EMAIL_HOST,
      port: config.SENDER_EMAIL_PORT,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL_USER,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });
    const mailOptions: IMailOptions = {
      from: `${COMMON.APP_NAME} App <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };
    try {
      const res = await transporter.sendMail(mailOptions);
      this.logger.info('Development email sent successfully', res);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }

  private async productionEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `${COMMON.APP_NAME} App <${config.SENDER_EMAIL}>`,
      to: receiverEmail,
      subject,
      html: body
    };
    try {
      const res = await sendGridMail.send(mailOptions);
      this.logger.info('Production email sent successfully', res);
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
}

export const mailTransport: MailTransport = new MailTransport();
