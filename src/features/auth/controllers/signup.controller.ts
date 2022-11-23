import { UploadApiResponse } from 'cloudinary';
import { ISignUpData } from './../interfaces/auth.interface';
import { ObjectId } from 'mongodb';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/schemas/signup.schema';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { Request, Response, NextFunction } from 'express';
import { uploads } from '@global/helpers/cloudinary-upload';
import Utils from '@global/helpers/utils';
import HTTP_STATUS_CODE from 'http-status-codes';
export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const { username, password, email, avatarColor, avatarImage } = req.body;
    const checkUserExists: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkUserExists) {
      throw new BadRequestError('Invalid credentials');
    }
    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = Utils.generateRandomIntegers(12);
    const authData: IAuthDocument = SignUp.prototype.sinupData({
      _id: authObjectId,
      uId: `${uId}`,
      username,
      email,
      password,
      avatarColor
    });
    const result: UploadApiResponse = (await uploads(avatarImage, userObjectId.toString(), true, true)) as UploadApiResponse;
    if (!result.public_id) {
      throw new BadRequestError('File upload: Error occurred while uploading, please try again');
    }
    res.status(HTTP_STATUS_CODE.CREATED).json({ message: 'User created successfully', ...authData });
  }

  private sinupData(data: ISignUpData): IAuthDocument {
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
}
