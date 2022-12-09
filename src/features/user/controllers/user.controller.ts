import { userService } from '@user/services/user.service';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
export class UserController {
  public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getCurrentUser(req.user!);
      res.status(HTTP_STATUS_CODE.OK).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}
