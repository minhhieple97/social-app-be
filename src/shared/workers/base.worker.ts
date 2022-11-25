import { config } from '@root/config';
import { Job, DoneCallback } from 'bull';
import { Logger } from 'winston';
export class BaseWorker {
  logger: Logger;
  constructor(workerName: string) {
    this.logger = config.createLogger(`${workerName}.worker`);
  }
}
