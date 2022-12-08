import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
import { authService } from '@auth/services/auth.service';
export class UserController {
  public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getCurrentUser(req.currentUser!);
      res.status(HTTP_STATUS_CODE.OK).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}
