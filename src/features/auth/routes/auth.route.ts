import { AuthController } from '@auth/controllers/auth.controller';
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
    this.router.post('/current-user', AuthController.prototype.getCurrentUser);
    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
