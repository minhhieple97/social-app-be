import { QUEUE } from '@global/constants';
import { BaseQueue } from '@service/queues/base.queue';
import { userWorker } from '@worker/user.worker';

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
