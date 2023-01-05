import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import compression from 'compression';
import { config } from '@root/config';
import { Server as ServerSocket } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import HTTP_STATUS_CODE from 'http-status-codes';
import { CustomError, IErrorResponse } from '@globalV1/helpers/error-handler';
import applicationRoutes from '@root/routes';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
const SERVER_PORT = 8000;
const logger = config.createLogger('server');
export class Server {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }
  private securityMiddleware(app: Application) {
    app.use(cookieParser(config.SECRET_KEY_COOKIE));
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.NODE_ENV === 'production' ? config.CLIENT_URL : true,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application) {
    app.use(compression());
    if (config.NODE_ENV === 'development') app.use(morgan('dev'));
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  private routesMiddleware(app: Application): void {
    applicationRoutes(app);
  }

  private globalErrorHandler(app: Application): void {
    app.get('/health-checker', (req: Request, res: Response, _next: NextFunction) => {
      res.status(200).json({
        status: 'success',
        message: 'Welcome to Onlymemes Server :)'
      });
    });
    app.all('*', (req: Request, res: Response) => {
      res.status(HTTP_STATUS_CODE.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      if (config.NODE_ENV !== 'production') {
        logger.error(error);
      }
      return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).end();
    });
  }

  private async startServer(app: Application) {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketServerIO: ServerSocket = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      this.socketIOConnections(socketServerIO);
    } catch (error) {
      logger.error(error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<ServerSocket> {
    const io: ServerSocket = new ServerSocket(httpServer, {
      cors: {
        origin: config.CLIENT_URL,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      }
    });
    const pubClient = createClient({ url: config.REDIS_HOST });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      logger.info('Successfully connected to redis host');
    });
    io.adapter(createAdapter(pubClient, subClient));
    return io;
  }

  private startHttpServer(httpServer: http.Server) {
    httpServer.listen(SERVER_PORT, () => {
      logger.info(`Server runing on port ${SERVER_PORT} with process ${process.pid}`);
    });
  }

  private socketIOConnections(io: ServerSocket): void {}
}
