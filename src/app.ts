import express, { Express } from 'express'
import { Server } from './server'
import databaseConnection from './databases'
import { config } from './config'
class Application {
  public initialize(): void {
    this.loadConfig()
    databaseConnection()
    const app: Express = express()
    const server: Server = new Server(app)
    server.start()
  }

  private loadConfig() {
    config.validateConfig()
  }
}

const application: Application = new Application()
application.initialize()
