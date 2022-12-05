import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IAuthDocument, IAuthInput, IAuthPayload, ISignUpData, ISignUpInput } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/schemas/auth.schema';
import { BadRequestError } from '@global/helpers/error-handler';
import Utils from '@global/helpers/utils';
import { userService } from '@user/services/user.service';
import { QUEUE } from '@global/constants';
import { authQueue } from '@service/queues/auth.queue';
import { userQueue } from '@service/queues/user.queue';
import { omit } from 'lodash';
import { UploadApiResponse } from 'cloudinary';
import { uploads } from '@global/helpers/cloudinary-upload';
import { ObjectId } from 'mongodb';
import { userCache } from '@service/redis/user.cache';
class AuthService {
  public async create(signUpInput: ISignUpInput): Promise<{ userInfo: IUserDocument; jwtToken: string }> {
    const { username, password, email, avatarColor, avatarImage } = signUpInput;
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const scoreUser = Utils.generateRandomIntegers(12);
    const authData: IAuthDocument = AuthService.prototype.signUpData({
      _id: authObjectId,
      scoreUser: `${scoreUser}`,
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
      throw error;
    }

    // const checkUserExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    // create auth document
    // create user document
    // store info user to redis (add to queue)
    // if (checkUserExists) {
    //   throw new BadRequestError('Invalid credentials');
    // }

    const responseUpload: UploadApiResponse = (await uploads(avatarImage, userObjectId.toString(), true, true)) as UploadApiResponse;

    if (!responseUpload.public_id) {
      throw new BadRequestError('File upload: Error occurred while uploading, please try again');
    }
    // add user info to cache
    const userInfoForCache = AuthService.prototype.userData(authData, userObjectId);
    userInfoForCache.profileImgVersion = responseUpload.version;
    await userCache.saveUserToCache(`${userObjectId}`, `${scoreUser}`, userInfoForCache);

    // add user info to database
    authQueue.addAuthUserJob(QUEUE.ADD_AUTH_USER_TO_DB, { value: authData });
    omit(userInfoForCache, ['scoreUser', 'username', 'email', 'avatarColor', 'password']);
    userQueue.addUserJob(QUEUE.ADD_USER_TO_DB, { value: userInfoForCache });
    // sign jwt token
    const payloadJwtToken = {
      userId: userObjectId,
      uId: authData.scoreUser,
      email: authData.email,
      username: authData.username,
      avatarColor: authData.avatarColor
    };
    const jwtToken: string = Utils.generateJwtToken(
      { ...payloadJwtToken },
      {
        expiresIn: `${config.ACCESS_TOKEN_EXPIRES_IN}m`
      }
    );
    return { userInfo: userInfoForCache, jwtToken };
  }

  public async read(authInput: IAuthInput): Promise<{ userDocumet: IUserDocument; userJwt: string }> {
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

    const userJwt = Utils.generateJwtToken(
      {
        userId: user._id,
        uId: userAuthInfo.scoreUser,
        username: userAuthInfo.username,
        email: userAuthInfo.email,
        avatarColor: userAuthInfo.avatarColor
      },
      {
        expiresIn: `${config.ACCESS_TOKEN_EXPIRES_IN}m`
      }
    );
    const userDocumet: IUserDocument = {
      ...user,
      authId: userAuthInfo._id,
      username: userAuthInfo.username,
      email: userAuthInfo.email,
      avatarColor: userAuthInfo.avatarColor,
      scoreUser: userAuthInfo.scoreUser,
      createdAt: userAuthInfo.createdAt
    } as IUserDocument;
    return { userDocumet, userJwt };
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, scoreUser, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      username: Utils.firstLetterUppercase(username),
      email,
      avatarColor,
      scoreUser,
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
    const { _id, username, email, scoreUser, password, avatarColor } = data;
    return {
      _id,
      scoreUser,
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

  public async getCurrentUser(currentUser: IAuthPayload): Promise<IUserDocument | null> {
    let user = null;
    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${currentUser.userId}`)) as IUserDocument;
    const existingUser: IUserDocument = cachedUser ? cachedUser : await userService.getUserById(currentUser.userId);
    if (Object.keys(existingUser).length > 0) {
      user = existingUser;
    }
    return user;
  }
}
export const authService: AuthService = new AuthService();
