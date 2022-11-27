import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@user/interfaces/user.interface';
// import { IUserDocument } from '@user/interfaces/user.interface';

declare global {
  namespace Express {
    interface Request {
      currentUser?: AuthPayload;
    }
  }
}

export interface AuthPayload {
  userId: string;
  uId: string;
  email: string;
  username: string;
  avatarColor: string;
  iat?: number;
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  uId: string;
  username: string;
  email: string;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  comparePassword(password: string, salt: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  salt: string;
}

export interface ISignUpData extends Partial<ISignUpInput> {
  _id: ObjectId;
  uId: string;
}

// export type ISignUpData = Partial<ISignUpInput> & {
//   _id: ObjectId;
//   uId: string;
// };

export interface ISignUpInput {
  email: string;
  username: string;
  password: string;
  avatarColor: string;
  avatarImage: string;
}

export interface IAuthInput {
  email?: string;
  username?: string;
  password: string;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
