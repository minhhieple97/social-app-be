import express, { Express } from 'express';
import { Server } from '@root/server';
import databaseConnection from '@root/databases';
import { config } from '@root/config';
class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express();
    const server: Server = new Server(app);
    server.start();
  }

  private loadConfig() {
    config.validateConfig();
  }
}

const application: Application = new Application();
application.initialize();
