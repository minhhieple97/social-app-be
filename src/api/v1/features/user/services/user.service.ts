import { IAuthPayload } from '@authV1/interfaces/auth.interface';
import { userCache } from '@serviceV1/redis/user.cache';
import { IUserDocument } from '@userV1/interfaces/user.interface';
import { userRepository } from '@userV1/schemas/user.repository.schema';
import { UserModel } from '@userV1/schemas/user.schema';
import mongoose from 'mongoose';
class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await userRepository.createUser(data);
  }
  public async getCurrentUser(currentUser: IAuthPayload): Promise<IUserDocument | null> {
    let user = null;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${currentUser.userId}`, '.')) as IUserDocument;
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userRepository.getUserById(currentUser.userId);
    if (Object.keys(existingUser).length > 0) {
      user = existingUser;
    }
    return user;
  }
}
export const userService: UserService = new UserService();
