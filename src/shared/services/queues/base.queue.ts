import { Logger } from 'winston';
import Queue, { Job } from 'bull';
import { config } from '@root/config';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { IAuthJob } from '@auth/interfaces/auth.interface';
let bullAdapters: BullAdapter[] = [];
export let serverAdapter: ExpressAdapter;
type IBaseJobData = IAuthJob;
export abstract class BaseQueue {
  queue: Queue.Queue;
  logger: Logger;
  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = [...new Set(bullAdapters)];
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');
    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });
    this.logger = config.createLogger(`${queueName}.queue`);
    this.queue.on('completed', (job: Job) => {
      job.remove();
    });
    this.queue.on('global:completed', (job: Job) => {
      this.logger.info(`Job ${job} is completed`);
    });
    this.queue.on('global:stalled', (job: Job) => {
      this.logger.info(`Job ${job} is stalled`);
    });
  }
  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, cb: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, cb);
  }
}
