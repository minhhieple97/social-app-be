import { IUserDocument } from '@user/interfaces/user.interface';
import { BaseCache } from './base.cache';

export class UserCache extends BaseCache {
  constructor() {
    super('user.cache');
  }
  public async saveUserToCache(key: string, userId: string, createUser: IUserDocument): Promise<void> {}
}
