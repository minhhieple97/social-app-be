import Utils from '@global/helpers/utils';
import { IUserDocument } from '@user/interfaces/user.interface';
import { BaseCache } from './base.cache';

export class UserCache extends BaseCache {
  constructor() {
    super('user');
  }
  public async saveUserToCache(createUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const { _id, score } = createUser;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response = await Promise.allSettled([
        this.client.ZADD('leaderboard', { score: parseInt(score!, 10), value: `${_id}` }),
        this.client.json.set(`users:${_id}`, '.', { ...createUser, createdAt } as any)
      ]);
      Utils.handleErrorPromiseAllSettled(response);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    const response: IUserDocument = (await this.client.json.get(`users:${userId}`, {
      path: '.'
    })) as unknown as IUserDocument;
    return response;
  }
}

export const userCache: UserCache = new UserCache();
