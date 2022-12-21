import { config } from '@root/config';
import { signinSchema } from '@authV1/validations/signin.validation';
import { joiValidation } from '@globalV1/decorators/joi-validation.decorator';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
import { authService } from '@authV1/services/auth.service';
import { signupSchema } from '@authV1/validations/signup.validation';
import Utils from '@globalV1/helpers/utils';
class AuthController {
  @joiValidation(signinSchema)
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userDocumet, accessToken: access_token, refreshToken: refresh_token } = await authService.loginHandler(req.body, req.ip);
      const cookieOptionAccessToken = Utils.generateCookieOptionForAuth(+config.ACCESS_TOKEN_EXPIRES_IN!);
      const cookieOptionRefreshToken = Utils.generateCookieOptionForAuth(+config.REFRESH_TOKEN_EXPIRES_IN!);
      res.cookie('access_token', access_token, cookieOptionAccessToken);
      res.cookie('refresh_token', refresh_token, cookieOptionRefreshToken);
      res.cookie('logged_in', true, {
        ...cookieOptionAccessToken,
        httpOnly: false
      });
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'User login successfully', data: { ...userDocumet }, access_token });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutHandler(req, res);
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logout successfully' });
    } catch (error) {
      next(error);
    }
  }

  @joiValidation(signupSchema)
  public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, refreshToken, userInfo } = await authService.signupHandler(req.body, req.ip);
      const cookieOptionAccessToken = Utils.generateCookieOptionForAuth(+config.ACCESS_TOKEN_EXPIRES_IN!);
      const cookieOptionRefreshToken = Utils.generateCookieOptionForAuth(+config.REFRESH_TOKEN_EXPIRES_IN!);
      res.cookie('access_token', accessToken, cookieOptionAccessToken);
      res.cookie('refresh_token', refreshToken, cookieOptionRefreshToken);
      res.cookie('logged_in', true, {
        ...cookieOptionAccessToken,
        httpOnly: false
      });
      res.status(HTTP_STATUS_CODE.CREATED).json({ message: 'User created successfully', data: { ...userInfo }, accessToken });
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, refreshToken } = await authService.refreshTokenHandler(req);
      const cookieOptionAccessToken = Utils.generateCookieOptionForAuth(+config.ACCESS_TOKEN_EXPIRES_IN!);
      const cookieOptionRefreshToken = Utils.generateCookieOptionForAuth(+config.REFRESH_TOKEN_EXPIRES_IN!);
      res.cookie('access_token', accessToken, cookieOptionAccessToken);
      res.cookie('refresh_token', refreshToken, cookieOptionRefreshToken);
      res.cookie('logged_in', true, {
        ...cookieOptionAccessToken,
        httpOnly: false
      });
      res.status(HTTP_STATUS_CODE.ACCEPTED).json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
}
export const authController: AuthController = new AuthController();
