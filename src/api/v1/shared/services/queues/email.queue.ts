import { QUEUE } from '@globalV1/constants';
import { BaseQueue } from '@serviceV1/queues/base.queue';
import { IEmailJob } from '@userV1/interfaces/user.interface';
import { mailWorker } from '@workerV1/email.worker';
class EmailQueue extends BaseQueue {
  constructor() {
    super('email');
    this.processJob(QUEUE.SEND_RESET_PASSWORD_EMAIL, 5, mailWorker.processSendMail);
  }
  public addEmailJob(name: string, data: IEmailJob) {
    this.addJob(name, data);
  }
}
export const emailQueue: EmailQueue = new EmailQueue();
