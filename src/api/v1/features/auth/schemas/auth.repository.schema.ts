import { config } from '@root/config';
import { IAuthDocument } from '@authV1/interfaces/auth.interface';
import { AuthModel } from '@authV1/schemas/auth.schema';
import Utils from '@globalV1/helpers/utils';
import { Logger } from 'winston';
class AuthRepository {
  logger: Logger;
  constructor() {
    this.logger = config.createLogger('auth.repository');
  }

  public async getAuthInfoUsernameOrEmail(conditional: { email?: string; username?: string }): Promise<IAuthDocument> {
    const params = [];
    if (conditional.email) {
      params.push({ email: Utils.lowerCase(conditional.email) });
    }
    if (conditional.username) {
      params.push({ username: Utils.firstLetterUppercase(conditional.username) });
    }
    const query = {
      $or: params
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthByConditional(conditional: object): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ ...conditional }).exec()) as IAuthDocument;
    return user;
  }

  public async updatePasswordResetToken(authId: string, data: { passwordResetToken: string; passwordResetExpires: number }): Promise<void> {
    await AuthModel.updateOne(
      { _id: authId },
      { passwordResetToken: data.passwordResetExpires, passwordResetExpires: data.passwordResetExpires }
    );
  }
}

export const authRepository: AuthRepository = new AuthRepository();
