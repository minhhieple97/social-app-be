import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/schemas/user.schema';
class UserService {
  public async createUser(data: IUserDocument): Promise<void> {
    await UserModel.create(data);
  }
}
export const userService: UserService = new UserService();
