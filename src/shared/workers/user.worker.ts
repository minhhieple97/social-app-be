import { authService } from '@service/db/auth.service';
import { userService } from '@service/db/user.service';
import { Job, DoneCallback } from 'bull';
import { BaseWorker } from './base.worker';
class UserWorker extends BaseWorker {
  constructor() {
    super('user');
  }
  async addUserToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.createUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      this.logger.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
