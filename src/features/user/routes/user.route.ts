import { UserController } from '@user/controllers/user.controller';
import { AuthMiddleware } from '@auth/middlewares/auth.middleware';
import express, { Router } from 'express';

class UserRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.get('/me', AuthMiddleware.prototype.deserializeUser, UserController.prototype.getCurrentUser);
    return this.router;
  }
}
export const userRoutes: UserRoutes = new UserRoutes();
