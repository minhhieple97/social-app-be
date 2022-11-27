import { signinSchema } from '@auth/validations/signin.validation';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
import { authService } from '@auth/services/auth.service';
export class SignIn {
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
}
