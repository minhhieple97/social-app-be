import Utils from '@global/helpers/utils';
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

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
    response.createdAt = new Date(Utils.parseJson(`${response.createdAt}`));
    // response.postsCount = Utils.parseJson(`${response.postsCount}`);
    response.blocked = Utils.parseJson(`${response.blocked}`);
    response.blockedBy = Utils.parseJson(`${response.blockedBy}`);
    response.notifications = Utils.parseJson(`${response.notifications}`);
    response.social = Utils.parseJson(`${response.social}`);
    // response.followersCount = Utils.parseJson(`${response.followersCount}`);
    // response.followingCount = Utils.parseJson(`${response.followingCount}`);
    // response.bgImageId = Utils.parseJson(`${response.bgImageId}`);
    // response.bgImageVersion = Utils.parseJson(`${response.bgImageVersion}`);
    // response.profileImgVersion = Utils.parseJson(`${response.profileImgVersion}`);
    response.work = Utils.parseJson(`${response.work}`);
    response.school = Utils.parseJson(`${response.school}`);
    response.location = Utils.parseJson(`${response.location}`);
    response.quote = Utils.parseJson(`${response.quote}`);
    return response;
  }
}

export const userCache: UserCache = new UserCache();
