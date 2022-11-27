import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemas/signup.schema';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response, NextFunction } from 'express';
import { uploads } from '@global/helpers/cloudinary-upload';
import Utils from '@global/helpers/utils';
import HTTP_STATUS_CODE from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { omit } from 'lodash';
import { authQueue } from '@service/queues/auth.queue';
import { QUEUE } from '@global/constants';
import { userQueue } from '@service/queues/user.queue';
import jwt from 'jsonwebtoken';
const userCache: UserCache = new UserCache();
export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password, email, avatarColor, avatarImage } = req.body;
      const checkUserExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
      if (checkUserExists) {
        throw new BadRequestError('Invalid credentials');
      }
      const authObjectId: ObjectId = new ObjectId();
      const userObjectId: ObjectId = new ObjectId();
      const uId = Utils.generateRandomIntegers(12);
      const authData: IAuthDocument = SignUp.prototype.signUpData({
        _id: authObjectId,
        uId: `${uId}`,
        username,
        email,
        password,
        avatarColor
      });
      const responseUpload: UploadApiResponse = (await uploads(avatarImage, userObjectId.toString(), true, true)) as UploadApiResponse;

      if (!responseUpload.public_id) {
        throw new BadRequestError('File upload: Error occurred while uploading, please try again');
      }
      // add user info to cache
      const userInfoForCache = SignUp.prototype.userData(authData, userObjectId);
      // userInfoForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUDINARY_PROJECT_NAME}/image/upload/v${responseUpload.version}/${userObjectId}.jpg`;
      await userCache.saveUserToCache(`${userObjectId}`, `${uId}`, userInfoForCache);

      // add user info to database
      authQueue.addAuthUserJob(QUEUE.ADD_AUTH_USER_TO_DB, { value: authData });
      omit(userInfoForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
      userQueue.addUserJob(QUEUE.ADD_USER_TO_DB, { value: userInfoForCache });
      // sign jwt token
      const userJwtToken: string = Utils.generateJwtToken({ ...authData, userId: userObjectId });
      req.session = { token: userJwtToken };
      res.status(HTTP_STATUS_CODE.CREATED).json({ message: 'User created successfully', ...authData, token: userJwtToken });
    } catch (error) {
      next(error);
    }
  }

  private signUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Utils.firstLetterUppercase(username),
      email: Utils.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as unknown as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      username: Utils.firstLetterUppercase(username),
      email,
      avatarColor,
      uId,
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
      bgImageId: ''
    } as unknown as IUserDocument;
  }
}
