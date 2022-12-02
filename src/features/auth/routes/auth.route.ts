import { AuthController } from '@auth/controllers/auth.controller';
import { AuthMiddleware } from '@auth/middlewares/auth.middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', AuthController.prototype.create);
    this.router.post('/signin', AuthController.prototype.read);
    this.router.post('/signout', AuthController.prototype.update);
    this.router.get('/current-user', AuthMiddleware.prototype.verifyUser, AuthController.prototype.getCurrentUser);
    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
