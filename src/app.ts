import express, { Express } from 'express'
import { Server } from './server'

class Application {
  public initialize(): void {
    const app: Express = express()
    const server: Server = new Server(app)
    server.start()
  }
}

const application: Application = new Application()
application.initialize()
