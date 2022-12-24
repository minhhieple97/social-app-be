import { userService } from '@userV1/services/user.service';
import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
class UserController {
  public async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getCurrentUser(req.user!);
      res.status(HTTP_STATUS_CODE.OK).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}
export const userController: UserController = new UserController();
