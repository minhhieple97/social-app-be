import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { ObjectId } from 'mongodb';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { signupSchema } from '@auth/validations/signup.validation';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { BadRequestError } from '@global/helpers/error-handler';
import { Request, Response, NextFunction } from 'express';
import { uploads } from '@global/helpers/cloudinary-upload';
import Utils from '@global/helpers/utils';
import HTTP_STATUS_CODE from 'http-status-codes';
import { UserCache } from '@service/redis/user.cache';
import { omit } from 'lodash';
import { authQueue } from '@service/queues/auth.queue';
import { QUEUE } from '@global/constants';
import { userQueue } from '@service/queues/user.queue';
import { authService } from '@auth/services/auth.service';
export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jwtToken, userInfo } = await authService.create(req.body);
      req.session = { token: jwtToken };
      res.status(HTTP_STATUS_CODE.CREATED).json({ message: 'User created successfully', data: { ...userInfo }, token: jwtToken });
    } catch (error) {
      next(error);
    }
  }
}
