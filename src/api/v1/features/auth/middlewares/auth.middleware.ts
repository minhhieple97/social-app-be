import { config } from '@root/config';
import { UnAuthorizedError } from '@globalV1/helpers/error-handler';
import { NextFunction, Request, Response } from 'express';
import { userCache } from '@serviceV1/redis/user.cache';
import { tokenService } from '@authV1/services/token.service';

class AuthMiddleware {
  public async deserializeUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const cookieAccessToken = config.IS_PRODUCTION ? req.signedCookies.access_token : req.cookies.access_token;

      const accessToken =
        req.headers.authorization && req.headers.authorization.startsWith('Bearer')
          ? req.headers.authorization.split(' ')[1]
          : cookieAccessToken;

      if (!accessToken) {
        return next(new UnAuthorizedError('You are not logged in'));
      }

      // Validate Access Token
      const decoded = tokenService.verifyJwtToken<{ sub: string }>(accessToken, config.ACCESS_TOKEN_PUBLIC_KEY!);

      if (!decoded) {
        return next(new UnAuthorizedError(`Invalid token or user doesn't exist`));
      }

      const rawUser = (await userCache.getUserFromCache(decoded.sub, [`.email`, `.username`, `.score`, `.avatarColor`])) as {
        '.email': string;
        '.username': string;
        '.score': number;
        '.avatarColor': string;
      } | null;
      if (!rawUser) {
        return next(new UnAuthorizedError(`User session has expired`));
      }
      const username = rawUser['.username'];
      const email = rawUser['.email'];
      const score = rawUser['.score'];
      const avatarColor = rawUser['.avatarColor'];
      req.user = { userId: decoded.sub, username, email, score, avatarColor };
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
export const authMiddleware: AuthMiddleware = new AuthMiddleware();
