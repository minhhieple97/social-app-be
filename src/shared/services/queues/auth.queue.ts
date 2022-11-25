import { IAuthJob } from '@auth/interfaces/auth.interface';
import { QUEUE } from '@global/constants';
import { BaseQueue } from '@service/queues/base.queue';
import { authWorker } from '@worker/auth.worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    this.processJob(QUEUE.ADD_AUTH_USER_TO_DB, 5, authWorker.addAuthUserToDb);
  }
  public addAuthUserJob(name: string, data: IAuthJob) {
    this.addJob(name, data);
  }
}
export const authQueue: AuthQueue = new AuthQueue();
