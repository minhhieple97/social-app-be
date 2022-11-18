import express, { Express } from 'express'
import { Server } from './server'
import databaseConnection from './databases'
class Application {
  public initialize(): void {
    databaseConnection()
    const app: Express = express()
    const server: Server = new Server(app)
    server.start()
  }
}

const application: Application = new Application()
application.initialize()
