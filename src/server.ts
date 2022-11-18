import { Application, json, urlencoded } from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import cookieSession from 'cookie-session'
import compression from 'compression'
const SERVER_PORT = 8000
export class Server {
  private app: Application
  constructor(app: Application) {
    this.app = app
  }
  public start(): void {
    this.securityMiddleware(this.app)
    this.standardMiddleware(this.app)
    this.routesMiddleware(this.app)
    this.globalErrorHandler(this.app)
    this.startServer(this.app)
  }
  private securityMiddleware(app: Application) {
    app.use(
      cookieSession({
        name: 'session',
        keys: ['test1', 'test2'],
        maxAge: 24 * 7 * 3600000,
        secure: false,
      })
    )
    app.use(hpp())
    app.use(helmet())
    app.use(
      cors({
        origin: '*',
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      })
    )
  }

  private standardMiddleware(app: Application) {
    app.use(compression())
    app.use(json({ limit: '50mb' }))
    app.use(urlencoded({ extended: true, limit: '50mb' }))
  }

  private routesMiddleware(app: Application) {}

  private globalErrorHandler(app: Application) {}

  private startServer(app: Application) {
    try {
      const httpServer: http.Server = new http.Server(app)
      this.startHttpServer(httpServer)
    } catch (error) {
      console.log(error)
    }
  }

  private createSocketIO(httpServer: http.Server) {}

  private startHttpServer(httpServer: http.Server) {
    httpServer.listen(SERVER_PORT, () => {
      console.log(`Server runing on Port ${SERVER_PORT}`)
    })
  }
}
