import { QUEUE } from '@globalV1/constants';
import { BaseQueue } from '@serviceV1/queues/base.queue';
import { userWorker } from '@workerV1/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob(QUEUE.ADD_USER_TO_DB, 5, userWorker.addUserToDb);
  }
  public addUserJob(name: string, data: any) {
    this.addJob(name, data);
  }
}
export const userQueue: UserQueue = new UserQueue();
