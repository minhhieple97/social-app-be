import { authController } from '@authV1/controllers/auth.controller';
import { authMiddleware } from '@authV1/middlewares/auth.middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', authController.signup);
    this.router.post('/login', authController.login);
    this.router.post('/refresh-token', authController.refreshToken);
    this.router.post('/logout', authMiddleware.deserializeUser, authMiddleware.checkAuthentication, authController.logout);
    this.router.post('/request-reset-password', authController.requestResetPassword);
    this.router.post('/reset-password/:token', authController.resetPassword);
    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
