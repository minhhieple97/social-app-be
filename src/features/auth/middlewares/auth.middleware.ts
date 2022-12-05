import Utils from '@global/helpers/utils';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { UnAuthorizedError } from '@global/helpers/error-handler';
import { NextFunction, Request, Response } from 'express';

export class AuthMiddleware {
  public async authentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session?.token) {
        throw new UnAuthorizedError('Token is not available, please login first');
      }
      const payload: IAuthPayload = Utils.verifyJwtToken(req.session?.token) as IAuthPayload;
      if (!payload) {
        throw new UnAuthorizedError(`Invalid token or user doesn't exist`);
      }
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
