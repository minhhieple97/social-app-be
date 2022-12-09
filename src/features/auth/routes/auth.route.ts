import { AuthController } from '@auth/controllers/auth.controller';
import { AuthMiddleware } from '@auth/middlewares/auth.middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', AuthController.prototype.signup);
    this.router.post('/login', AuthController.prototype.login);
    this.router.post('/logout', AuthController.prototype.logout);
    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
