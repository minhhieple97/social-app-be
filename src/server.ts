import { Application, json, NextFunction, Request, Response, urlencoded } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieSession from 'cookie-session';
import compression from 'compression';
import { config } from '@root/config';
import { Server as ServerSocket } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { StatusCodes } from 'http-status-codes';
import Logger from 'bunyan';
import { CustomError, IErrorResponse } from '@global/helpers/error-handler';
const SERVER_PORT = 8000;
const logger: Logger = config.createLogger('server');
export class Server {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }
  public start(): void {
    this.securityMiddleware(this.app);
    this.standardMiddleware(this.app);
    // this.routesMiddleware(this.app);
    this.globalErrorHandler(this.app);
    this.startServer(this.app);
  }
  private securityMiddleware(app: Application) {
    app.use(
      cookieSession({
        name: 'session',
        keys: [config.SECRET_KEY_COOKIE_1!, config.SECRET_KEY_COOKIE_2!],
        maxAge: 24 * 7 * 3600000,
        secure: config.NODE_ENV !== 'development'
      })
    );
    app.use(hpp());
    app.use(helmet());
    app.use(
      cors({
        origin: config.CLIENT_URL,
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      })
    );
  }

  private standardMiddleware(app: Application) {
    app.use(compression());
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));
  }

  // private routesMiddleware() {}

  private globalErrorHandler(app: Application) {
    app.all('*', (req: Request, res: Response) => {
      res.status(StatusCodes.NOT_FOUND).json({ message: `${req.originalUrl} not found` });
    });

    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      logger.error(error);
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
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
