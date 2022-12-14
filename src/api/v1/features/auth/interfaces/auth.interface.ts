import { Document } from 'mongoose';
import { ObjectId } from 'mongodb';
import { IUserDocument } from '@userV1/interfaces/user.interface';
declare global {
  namespace Express {
    interface Request {
      user?: IAuthPayload;
    }
  }
}

export interface IAuthPayload {
  userId: string;
  score: number;
  email: string;
  username: string;
  avatarColor: string;
}

export interface IAuthDocument extends Document {
  _id: string | ObjectId;
  score: string;
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
  score: string;
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

export interface IRefreshToken {
  userId: string;
  token: string;
  createdByIp: string;
  revoked?: number;
  revokedByIp?: string;
  replacedByToken?: string;
  isActive: boolean;
  expires?: number;
}

export interface IAuthJob {
  value?: string | IAuthDocument | IUserDocument;
}
