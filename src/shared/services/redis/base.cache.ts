import { createClient } from 'redis';
import { config } from '@root/config';
const Logger = config.createLogger('cache');
const client = createClient();
export type RedisClient = ReturnType<typeof createClient>;
export abstract class BaseCache {
  client: RedisClient;
  log: Logger;
}
