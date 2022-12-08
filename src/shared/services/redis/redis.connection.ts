import { BaseCache } from './base.cache';

class RedisConnection extends BaseCache {
  constructor() {
    super('redis.connection');
    this.client.on('error', (err) => this.logger.error(err));
  }
  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error(error);
      setTimeout(this.connect, 5000);
    }
  }
}
export const redisConnection: RedisConnection = new RedisConnection();
