import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/schemas/auth.schema';
import Utils from '@global/helpers/utils';
class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Utils.firstLetterUppercase(username) }, { email: Utils.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }
  public async getUserByConditional(conditional: object): Promise<IAuthDocument> {
    console.log({ ...conditional });
    const user: IAuthDocument = (await AuthModel.findOne({ ...conditional }).exec()) as IAuthDocument;
    return user;
  }
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }
}
export const authService: AuthService = new AuthService();
