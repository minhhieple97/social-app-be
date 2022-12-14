import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IAuthDocument, IAuthInput, IAuthPayload, ISignUpData, ISignUpInput } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/schemas/auth.schema';
import { BadRequestError } from '@global/helpers/error-handler';
import Utils from '@global/helpers/utils';
import { userService } from '@user/services/user.service';
import { QUEUE } from '@global/constants';
import { userQueue } from '@service/queues/user.queue';
import { omit } from 'lodash';
import { ObjectId } from 'mongodb';
import { Logger } from 'winston';
import { redisConnection } from '@service/redis/redis.connection';
import { Request, Response } from 'express';
class AuthService {
  logger: Logger;
  constructor() {
    this.logger = config.createLogger('auth.service');
  }
  public async signup(signUpInput: ISignUpInput): Promise<{ userInfo: IUserDocument; accessToken: string; refreshToken: string }> {
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
    const payloadJwtToken = {
      userId: userObjectId.toString(),
      score: authData.score,
      email: authData.email,
      username: authData.username,
      avatarColor: authData.avatarColor
    };
    const { accessToken, refreshToken } = await this.signToken(payloadJwtToken);
    return { userInfo: userInfoForCache, accessToken, refreshToken };
  }

  public async login(authInput: IAuthInput): Promise<{ userDocumet: IUserDocument; accessToken: string; refreshToken: string }> {
    const { username, email, password } = authInput;
    let userAuthInfo: IAuthDocument | null = null;
    if (username) {
      userAuthInfo = await authService.getUserByConditional({ username: Utils.firstLetterUppercase(username) });
    } else if (email) {
      userAuthInfo = await authService.getUserByConditional({ email: Utils.lowerCase(email) });
    }
    if (!userAuthInfo) {
      throw new BadRequestError('User does not exist');
    }
    // check password match
    const passwordMatch = await userAuthInfo.comparePassword(password, userAuthInfo.salt);
    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const user: IUserDocument = await userService.getUserByAuthId(userAuthInfo._id.toString());
    const payloadJwtToken = {
      userId: user._id.toString(),
      score: user.score!,
      email: userAuthInfo.email,
      username: userAuthInfo.username,
      avatarColor: userAuthInfo.avatarColor
    };
    const { accessToken, refreshToken } = await this.signToken(payloadJwtToken);
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

  public async logout(req: Request, res: Response) {
    // delete key in redis
    const user = req.user;
    await redisConnection.client.del(user!.userId);
    res.cookie('access_token', '', { maxAge: 1 });
    res.cookie('refresh_token', '', { maxAge: 1 });
    res.cookie('logged_in', '', {
      maxAge: 1
    });
  }

  private async signToken(user: IAuthPayload): Promise<{ accessToken: string; refreshToken: string }> {
    // Sign the access token
    const accessToken = Utils.generateJwtToken(
      config.ACCESS_TOKEN_PRIVATE_KEY!,
      {
        sub: user.userId
      },
      {
        expiresIn: `${config.ACCESS_TOKEN_EXPIRES_IN}m`
      }
    );

    const refreshToken = Utils.generateJwtToken(
      config.REFRESH_TOKEN_PRIVATE_KEY!,
      {
        sub: user.userId
      },
      {
        expiresIn: `${config.REFRESH_TOKEN_EXPIRES_IN}m`
      }
    );

    // Create a Session
    await redisConnection.client.set(user.userId, JSON.stringify(user), {
      EX: 60 * 60
    });

    // Return access token
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

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Utils.firstLetterUppercase(username) }, { email: Utils.lowerCase(email) }]
    };
    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;
    return user;
  }

  public async getUserByConditional(conditional: object): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ ...conditional }).exec()) as IAuthDocument;
    return user;
  }
}
export const authService: AuthService = new AuthService();
