import { authController } from '@auth/controllers/auth.controller';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', authController.signup);
    this.router.post('/login', authController.login);
    this.router.post('/logout', authController.logout);
    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
