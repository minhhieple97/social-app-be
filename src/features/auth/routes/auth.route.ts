import { SignOut } from './../controllers/signout.controller';
import { SignIn } from '@auth/controllers/signin.controller';
import { SignUp } from '@auth/controllers/signup.controller';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;
  constructor() {
    this.router = express.Router();
  }
  public routes(): Router {
    this.router.post('/signup', SignUp.prototype.create);
    this.router.post('/signin', SignIn.prototype.read);
    this.router.post('/signout', SignOut.prototype.update);
    return this.router;
  }
}
export const authRoutes: AuthRoutes = new AuthRoutes();
