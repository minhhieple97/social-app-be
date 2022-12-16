import { IAuthJob } from '@authV1/interfaces/auth.interface';
import { QUEUE } from '@globalV1/constants';
import { BaseQueue } from '@serviceV1/queues/base.queue';
import { authWorker } from '@workerV1/auth.worker';

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
