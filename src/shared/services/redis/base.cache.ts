import { createClient } from 'redis';

const client = createClient();
export type RedisClient = ReturnType<typeof createClient>;
export abstract class BaseCache {
  client: RedisClient;
}
