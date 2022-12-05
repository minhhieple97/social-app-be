import { config } from '@root/config';
import { Logger } from 'winston';
export class BaseWorker {
  logger: Logger;
  constructor(workerName: string) {
    this.logger = config.createLogger(`${workerName}.worker`);
  }
}
