import { config } from '@root/config';
import { IAuthDocument, IAuthPayload } from '@auth/interfaces/auth.interface';
import { UnAuthorizedError } from '@global/helpers/error-handler';
import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

export class AuthMiddleware {
  public async verifyUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session?.token) {
        throw new UnAuthorizedError('Token is not available, please login first');
      }
      const payload: IAuthPayload = verify(req.session?.token, config.JWT_TOKEN!) as IAuthPayload;
      req.currentUser = payload;
      next();
    } catch (error) {
      next(error);
    }
  }

  public async checkAuthentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.currentUser) {
        throw new UnAuthorizedError('Authentication is require to access this route');
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}
