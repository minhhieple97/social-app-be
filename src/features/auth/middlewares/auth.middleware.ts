import Utils from '@global/helpers/utils';
import { IAuthPayload } from '@auth/interfaces/auth.interface';
import { UnAuthorizedError } from '@global/helpers/error-handler';
import { NextFunction, Request, Response } from 'express';
import { redisConnection } from '@service/redis/redis.connection';

export class AuthMiddleware {
  public async deserializeUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      let accessToken;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        accessToken = req.headers.authorization.split(' ')[1];
      } else if (req.cookies.access_token) {
        accessToken = req.cookies.access_token;
      }

      if (!accessToken) {
        return next(new UnAuthorizedError('You are not logged in'));
      }

      // Validate Access Token
      const decoded = Utils.verifyJwtToken<{ sub: string }>(accessToken);

      if (!decoded) {
        return next(new UnAuthorizedError(`Invalid token or user doesn't exist`));
      }

      if (!redisConnection.client.isOpen) {
        await redisConnection.client.connect();
      }

      // Check if user has a valid session
      const rawUser = await redisConnection.client.get(decoded.sub);

      if (!rawUser) {
        return next(new UnAuthorizedError(`User session has expired`));
      }
      const user = JSON.parse(rawUser);

      // Check if user still exist

      if (!user) {
        return next(new UnAuthorizedError(`User with that token no longer exist`));
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  }

  public async checkAuthentication(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnAuthorizedError('Authentication is require to access this route');
      }
      next();
    } catch (error) {
      next(error);
    }
  }
}
