import { config } from '@root/config';
import { signinSchema } from '@auth/validations/signin.validation';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
import { authService } from '@auth/services/auth.service';
import { signupSchema } from '@auth/validations/signup.validation';
export class AuthController {
  @joiValidation(signinSchema)
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userDocumet, accessToken } = await authService.login(req.body);
      res.cookie('accessToken', accessToken, config.COOKIE_ACCESS_TOKEN_OPTION);
      res.cookie('loggedIn', true, {
        ...config.COOKIE_ACCESS_TOKEN_OPTION,
        httpOnly: false
      });
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'User login successfully', data: { ...userDocumet }, accessToken });
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session = null;
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logout successfully', token: null, user: {} });
    } catch (error) {
      next(error);
    }
  }

  @joiValidation(signupSchema)
  public async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { accessToken, userInfo } = await authService.signup(req.body);
      res.cookie('accessToken', accessToken, config.COOKIE_ACCESS_TOKEN_OPTION);
      res.cookie('loggedIn', true, {
        ...config.COOKIE_ACCESS_TOKEN_OPTION,
        httpOnly: false
      });
      res.status(HTTP_STATUS_CODE.CREATED).json({ message: 'User created successfully', data: { ...userInfo }, accessToken });
    } catch (error) {
      next(error);
    }
  }
}
