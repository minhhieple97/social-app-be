import { authController } from '@authV1/controllers/auth.controller';
import { Response, NextFunction } from 'express';
import { authMockNext, authMockRequest, authMockResponse } from '@root/api/v1/mocks/auth.mock';
// import { BaseQueue } from '@serviceV1/queues/base.queue';
// BaseQueue
// // jest.mock('@serviceV1/queues/base.queue');
// jest.mock('@serviceV1/redis/user.cache');
// jest.mock('@serviceV1/queues/user.queue');
// jest.mock('@serviceV1/queues/auth.queue');
// jest.mock('@globalV1/helpers/cloudinary-upload');

describe('SignUp', () => {
  it('should throw an error if username is not available', () => {
    const req: any = authMockRequest(
      {},
      {
        username: '',
        email: 'hieplevuc@gmail.com',
        password: 'abc1234567',
        avatarImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/'
      }
    );
    const res: Response = authMockResponse();
    const next: NextFunction = authMockNext();
    authController.signup(req, res, next).catch((err) => {
      console.log(err);
    });
  });
});
