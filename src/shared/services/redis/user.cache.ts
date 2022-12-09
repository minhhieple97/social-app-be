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
