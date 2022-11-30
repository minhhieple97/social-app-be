import { Request, Response, NextFunction } from 'express';
import HTTP_STATUS_CODE from 'http-status-codes';
export class SignOut {
  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      req.session = null;
      res.status(HTTP_STATUS_CODE.OK).json({ message: 'Logout successfully', token: null, user: {} });
    } catch (error) {
      next(error);
    }
  }
}
