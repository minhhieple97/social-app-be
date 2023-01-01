import { config } from '@root/config';
import { IUserDocument } from '@userV1/interfaces/user.interface';
import { UserModel } from '@userV1/schemas/user.schema';
import mongoose from 'mongoose';
import { Logger } from 'winston';
class UserRepository {
  logger: Logger;
  constructor() {
    this.logger = config.createLogger('user.repository');
  }

  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
  public async getUserByAuthId(authId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { authId: new mongoose.Types.ObjectId(authId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: '_id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return users[0];
  }

  private aggregateProject() {
    return {
      _id: 1,
      username: `$authId.username`,
      uId: `$authId.username`,
      email: `$authId.username`,
      avatarColor: `$authId.avatarColor`,
      createdAt: `$authId.createdAt`,
      postsCount: 1,
      work: 1,
      school: 1,
      quote: 1,
      location: 1,
      blockedBy: 1,
      blocked: 1,
      followersCount: 1,
      followingCount: 1,
      notifications: 1,
      social: 1,
      bgImageVersion: 1,
      bgImageId: 1,
      profileImgVersion: 1
    };
  }
  public async getUserById(userId: string): Promise<IUserDocument> {
    const users: IUserDocument[] = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: 'Auth', localField: 'authId', foreignField: 'id', as: 'authId' } },
      { $unwind: '$authId' },
      { $project: this.aggregateProject() }
    ]);
    return users[0];
  }
}
export const userRepository: UserRepository = new UserRepository();