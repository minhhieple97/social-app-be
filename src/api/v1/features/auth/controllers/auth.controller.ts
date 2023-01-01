import { config } from '@root/config';
import { signinSchema } from '@authV1/validations/signin.validation';
import { joiValidation } from '@globalV1/decorators/joi-validation.decorator';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
import { authService } from '@authV1/services/auth.service';
import { signupSchema } from '@authV1/validations/signup.validation';
import Utils from '@globalV1/helpers/utils';
import { emailSchema } from '@authV1/validations/password.validation';
class AuthController {
  @joiValidation(signinSchema)
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userDocumet, accessToken, refreshToken } = await authService.loginHandler(req.body, req.ip);
      const cookieOptionAccessToken = Utils.generateCookieOptionForAuth(+config.ACCESS_TOKEN_EXPIRES_IN!);
      const cookieOptionRefreshToken = Utils.generateCookieOptionForAuth(+config.REFRESH_TOKEN_EXPIRES_IN!);
      res.cookie('access_token', accessToken, cookieOptionAccessToken);
      res.cookie('refresh_token', refreshToken, cookieOptionRefreshToken);
      res.cookie('logged_in', true, {
        ...cookieOptionAccessToken,
        httpOnly: false
      });
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'User login successfully', data: { ...userDocumet }, accessToken });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutHandler(req, res);
      res.cookie('access_token', '', { maxAge: 1 });
      res.cookie('refresh_token', '', { maxAge: 1 });
      res.cookie('logged_in', '', {
        maxAge: 1
      });
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

  @joiValidation(emailSchema)
  public async requestResetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.requestResetPasswordHandler(email);
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'Password reset email sent.' });
    } catch (error) {
      next(error);
    }
  }
}
export const authController: AuthController = new AuthController();
