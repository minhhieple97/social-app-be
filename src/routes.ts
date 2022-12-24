import { authRoutes as authRoutesV1 } from '@authV1/routes/auth.route';
import { userRoutes as userRoutesV1 } from '@userV1/routes/user.route';
import { serverAdapter } from '@serviceV1/queues/base.queue';
import { Application } from 'express';
const BASE_PATH = '/api/v1';
export default (app: Application) => {
  const routesV1 = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(`${BASE_PATH}/auth`, authRoutesV1.routes());
    app.use(`${BASE_PATH}/user`, userRoutesV1.routes());
  };
  routesV1();
};
