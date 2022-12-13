import { authMiddleware } from '@auth/middlewares/auth.middleware';
import { userController } from '@user/controllers/user.controller';
import express, { Router } from 'express';

class UserRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/me', authMiddleware.deserializeUser, userController.getCurrentUser);
    return this.router;
  }
}
export const userRoutes: UserRoutes = new UserRoutes();
