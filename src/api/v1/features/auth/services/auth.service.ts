import { tokenService } from '@authV1/services/token.service';
import { config } from '@root/config';
import { IResetPasswordParams, IUserDocument } from '@userV1/interfaces/user.interface';
import { IAuthDocument, IAuthInput, ISignUpData, ISignUpInput } from '@authV1/interfaces/auth.interface';
import { AuthModel } from '@authV1/schemas/auth.schema';
import { BadRequestError, UnAuthorizedError } from '@globalV1/helpers/error-handler';
import Utils from '@globalV1/helpers/utils';
import { QUEUE } from '@globalV1/constants';
import { userQueue } from '@serviceV1/queues/user.queue';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { Request, Response } from 'express';
import { refreshTokenCache } from '@serviceV1/redis/refresh-token.cache';
import { emailService } from '@serviceV1/emails/email.service';
import { emailQueue } from '@serviceV1/queues/email.queue';
import publicIP from 'ip';
import moment from 'moment';
import { authRepository } from '@authV1/schemas/auth.repository.schema';
import { userRepository } from '@userV1/schemas/user.repository.schema';
import crypto from 'crypto';
class AuthService {
  logger: Logger;
  constructor() {
    this.logger = config.createLogger('auth.service');
  }
  public async signupHandler(
    signUpInput: ISignUpInput,
    ip: string
  ): Promise<{ userInfo: IUserDocument; accessToken: string; refreshToken: string }> {
    const { username, password, email, avatarColor, avatarImage } = signUpInput;
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const score = Utils.generateRandomIntegers(12);
    const authData: IAuthDocument = AuthService.prototype.signUpData({
      _id: authObjectId,
      score: `${score}`,
      username,
      email,
      password,
      avatarColor
    });

    try {
      await AuthModel.create(authData);
    } catch (error: any) {
      if (error.code === 11000) {
        const [key] = Object.keys(error.keyValue);
        const [value] = Object.values(error.keyValue);
        throw new BadRequestError(`${Utils.capitalizeFirstLetter(key)} ${value} already exists, please choose a different ${key}`);
      }
      this.logger.error(error);
      throw error;
    }

    // generate user info to cache
    const userInfoForCache = AuthService.prototype.userData(authData, userObjectId);

    omit(userInfoForCache, ['score', 'username', 'email', 'avatarColor', 'password']);
    // add user info to mongodb,redis && upload image
    userQueue.addUserJob(QUEUE.ADD_USER_TO_DB, { userInfo: userInfoForCache, avatarImage });
    // sign jwt token
    const { accessToken, refreshToken } = await this.signToken(userObjectId.toString(), ip);
    return { userInfo: userInfoForCache, accessToken, refreshToken };
  }

  public async loginHandler(
    authInput: IAuthInput,
    ip: string
  ): Promise<{ userDocumet: IUserDocument; accessToken: string; refreshToken: string }> {
    const { username, email, password } = authInput;
    let userAuthInfo: IAuthDocument | null = null;
    if (username) {
      userAuthInfo = await authRepository.getAuthInfoUsernameOrEmail({ username: Utils.firstLetterUppercase(username) });
    } else if (email) {
      userAuthInfo = await authRepository.getAuthInfoUsernameOrEmail({ email: Utils.lowerCase(email) });
    }
    if (!userAuthInfo) {
      throw new BadRequestError('User does not exist');
    }
    // check password match
    const passwordMatch = await userAuthInfo.comparePassword(password, userAuthInfo.salt);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const user: IUserDocument = await userRepository.getUserByAuthId(userAuthInfo._id.toString());
    const { accessToken, refreshToken } = await this.signToken(user._id.toString(), ip);

    const userDocumet: IUserDocument = {
      ...user,
      authId: userAuthInfo._id,
      username: userAuthInfo.username,
      email: userAuthInfo.email,
      avatarColor: userAuthInfo.avatarColor,
      score: userAuthInfo.score,
      createdAt: userAuthInfo.createdAt
    } as IUserDocument;
    return { userDocumet, accessToken, refreshToken };
  }

  public async refreshTokenHandler(req: Request): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = config.IS_PRODUCTION ? req.signedCookies.refresh_token : req.cookies.refresh_token;
    const refreshTokenObj = await refreshTokenCache.getRefreshTokenFromCache(refreshToken, '.');
    if (!refreshTokenObj || Date.now() > refreshTokenObj.expires! || !refreshTokenObj.isActive) {
      throw new UnAuthorizedError('Refresh token not valid');
    }
    // generate new refresh token and access token
    const { accessToken, refreshToken: newRefreshToken } = await this.signToken(refreshTokenObj.userId, req.ip);
    // update old refresh token
    refreshTokenObj.revoked = Date.now();
    refreshTokenObj.revokedByIp = req.ip;
    refreshTokenObj.replacedByToken = newRefreshToken;
    refreshTokenObj.isActive = false;
    await refreshTokenCache.updateRefreshTokenFromCache(refreshToken, '.', refreshTokenObj);
    return { accessToken, refreshToken: newRefreshToken };
  }

  public async logoutHandler(req: Request, res: Response) {
    const refreshToken = config.IS_PRODUCTION ? req.signedCookies.refresh_token : req.cookies.refresh_token;
    await refreshTokenCache.updateRefreshTokenFromCache(refreshToken, '.isActive', false);
  }

  public async requestResetPasswordHandler(email: string) {
    const authInfo = await authRepository.getAuthInfoUsernameOrEmail({ email });
    if (!authInfo) throw new BadRequestError('User does not exist!');
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomString: string = randomBytes.toString('hex');
    const passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await authRepository.updatePasswordResetToken(authInfo.id.toString(), { passwordResetToken: randomString, passwordResetExpires });
    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomString}`;
    const template = emailService.renderPasswordResetTemplate(authInfo.username, resetLink);
    emailQueue.addEmailJob(QUEUE.SEND_RESET_PASSWORD_EMAIL, {
      template,
      receiverEmail: authInfo.email,
      subject: 'Reset your password'
    });
  }

  public async resetPasswordHandler(password: string, token: string) {
    const auth = await authRepository.getAuthInfoByPasswordResetToken(token);
    if (!auth) {
      throw new BadRequestError('Reset token has expired!');
    }
    auth.password = password;
    auth.passwordResetExpires = undefined;
    auth.passwordResetToken = undefined;
    await auth.save();
    const templateParams: IResetPasswordParams = {
      username: auth.username,
      email: auth.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };
    const template: string = emailService.renderPasswordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob(QUEUE.SEND_RESET_PASSWORD_EMAIL, {
      template,
      receiverEmail: auth.email,
      subject: 'Password Reset Confirmation'
    });
  }

  private async signToken(userId: string, ip: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = tokenService.generateAccessToken(userId);
    const refreshToken = await tokenService.generateRefreshToken(userId, ip);
    return { accessToken, refreshToken };
  }
  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id: authId, username, email, score, avatarColor } = data;
    return {
      _id: userObjectId,
      authId,
      username: Utils.firstLetterUppercase(username),
      email,
      avatarColor,
      score,
      postsCount: 0,
      work: '',
      school: '',
      quote: '',
      location: '',
      blocked: [],
      blockedBy: [],
      followersCount: 0,
      followingCount: 0,
      notifications: { messages: true, reactions: true, comments: true, follows: true },
      social: { facebook: '', twitter: '', instagram: '', youtube: '' },
      bgImageVersion: '',
      bgImageId: '',
      profileImgVersion: ''
    } as unknown as IUserDocument;
  }

  private signUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, score, password, avatarColor } = data;
    return {
      _id,
      score,
      username: Utils.firstLetterUppercase(username!),
      email: Utils.lowerCase(email!),
      password,
      avatarColor,
      createdAt: new Date()
    } as unknown as IAuthDocument;
  }
}
export const authService: AuthService = new AuthService();
