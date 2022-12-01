import { signinSchema } from '@auth/validations/signin.validation';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
import { authService } from '@auth/services/auth.service';
import { signupSchema } from '@auth/validations/signup.validation';
export class AuthController {
  @joiValidation(signinSchema)
  public async read(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userDocumet, userJwt } = await authService.read(req.body);
      req.session = { token: userJwt };
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'User login successfully', data: { ...userDocumet }, token: userJwt });
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session = null;
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logout successfully', token: null, user: {} });
    } catch (error) {
      next(error);
    }
  }

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

  public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    const user = authService.getCurrentUser(req.currentUser!);
    res.status(HTTP_STATUS_CODE.OK).json({ data: user });
  }
}
