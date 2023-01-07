/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { IAuthDocument, IAuthPayload } from '@authV1/interfaces/auth.interface';
import { IPayloadJwt } from '@userV1/interfaces/user.interface';
import { NextFunction, Response } from 'express';
import { jest } from '@jest/globals';
export const authMockRequest = (cookieData: IPayloadJwt | {}, body: IAuthMock, currentUser?: IAuthPayload | null, params?: any) => ({
  session: cookieData,
  body,
  params,
  currentUser
});

export interface IJWT {
  access_token?: string;
}

export const authMockResponse = (): Response => {
  const res: any = {} as any;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

export const authMockNext = (): NextFunction => {
  const next: NextFunction = jest.fn();
  return next;
};

export interface IAuthMock {
  _id?: string;
  username?: string;
  email?: string;
  score?: string;
  avatarColor?: string;
  avatarImage?: string;
  createdAt?: Date | string;
  password: string;
}

export const authUserPayload: IAuthPayload = {
  userId: '60263f14648fed5246e322d9',
  score: 1621613119252066,
  username: 'Manny',
  email: 'manny@me.com',
  avatarColor: '#9c27b0'
};

export const authMock = {
  _id: '60263f14648fed5246e322d3',
  uId: '1621613119252066',
  username: 'Manny',
  email: 'manny@me.com',
  avatarColor: '#9c27b0',
  createdAt: '2022-08-31T07:42:24.451Z',
  save: () => {},
  comparePassword: () => false
} as unknown as IAuthDocument;
