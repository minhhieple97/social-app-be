import { createClient } from 'redis';
import { config } from '@root/config';
import { Logger } from 'winston';
export type RedisClient = ReturnType<typeof createClient>;
export abstract class BaseCache {
  client: RedisClient;
  logger: Logger;
  constructor(cacheName: string) {
    this.client = createClient({ url: config.REDIS_HOST });
    this.logger = config.createLogger(cacheName);
    this.cacheError();
  }
  private cacheError(): void {
    this.client.on('error', (error) => {
      this.logger.error(error);
    });
  }
}
