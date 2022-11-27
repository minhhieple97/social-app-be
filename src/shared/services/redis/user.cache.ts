import { IUserDocument } from '@user/interfaces/user.interface';
import { BaseCache } from './base.cache';

export class UserCache extends BaseCache {
  constructor() {
    super('user.cache');
  }
  public async saveUserToCache(key: string, userUId: string, createUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      authId,
      username,
      email,
      avatarColor,
      uId,
      postsCount,
      work,
      school,
      quote,
      location,
      blocked,
      blockedBy,
      followersCount,
      followingCount,
      notifications,
      social,
      bgImageVersion,
      bgImageId
    } = createUser;
    const dataUserCache: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'authId',
      `${authId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'avatarColor',
      `${avatarColor}`,
      'createdAt',
      `${createdAt}`,
      'postsCount',
      `${postsCount}`,
      'work',
      `${work}`,
      'blocked',
      `${JSON.stringify(blocked)}`,
      'blockedBy',
      `${JSON.stringify(blockedBy)}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'notifications',
      `${JSON.stringify(notifications)}`,
      'social',
      `${JSON.stringify(social)}`,
      'location',
      `${location}`,
      'school',
      `${school}`,
      'quote',
      `${quote}`,
      'bgImageVersion',
      `${bgImageVersion}`,
      'bgImageId',
      `${bgImageId}`
    ];
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataUserCache);
    } catch (error) {}
  }
}

export const userCache: UserCache = new UserCache();
