import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ObjectId } from 'mongodb';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { signinSchema } from '@auth/schemas/signin.schema';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response, NextFunction } from 'express';
import Utils from '@global/helpers/utils';
import HTTP_STATUS_CODE from 'http-status-codes';
import jwt from 'jsonwebtoken';
export class SignIn {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;
      let userExisting: IAuthDocument | null = null;
      if (username) {
        userExisting = await authService.getUserByConditional({ username: Utils.firstLetterUppercase(username) });
      } else if (email) {
        userExisting = await authService.getUserByConditional({ email: Utils.lowerCase(email) });
      }
      if (!userExisting) {
        throw new BadRequestError('User does not exist');
      }
      // check password match
      const passwordMatch = await userExisting.comparePassword(password, userExisting.salt);
      if (!passwordMatch) {
        throw new BadRequestError('Invalid credentials');
      }
      const userJwt = Utils.generateJwtToken({
        userId: userExisting._id,
        uId: userExisting.uId,
        username: userExisting.username,
        email: userExisting.email,
        avatarColor: userExisting.avatarColor
      });
      req.session = { token: userJwt };
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'User login successfully', ...userExisting, token: userJwt });
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

  private signJwtToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return jwt.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
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
