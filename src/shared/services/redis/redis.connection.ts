import { BaseCache } from './base.cache';

class RedisConnection extends BaseCache {
  constructor() {
    super('redis_connection');
  }
  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
export const redisConnection: RedisConnection = new RedisConnection();
