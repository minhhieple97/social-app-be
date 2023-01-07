import { mailTransport } from '@serviceV1/emails/mail.transport';
import { Job, DoneCallback } from 'bull';
import { BaseWorker } from './base.worker';
class EmailWorker extends BaseWorker {
  constructor() {
    super('mail');
  }
  async processSendMail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const value = job.data;
      const { receiverEmail, template, subject } = value;
      await mailTransport.sendMail(receiverEmail, template, subject);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      done(error as Error);
    }
  }
}

export const mailWorker: EmailWorker = new EmailWorker();
