import { authService } from '@auth/services/auth.service';
import { Job, DoneCallback } from 'bull';
import { BaseWorker } from './base.worker';
class AuthWorker extends BaseWorker {
  constructor() {
    super('auth');
  }
  async addAuthUserToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      // await authService.createAuthUser(value);
      done(null, job.data);
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
