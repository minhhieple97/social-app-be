import dotenv from 'dotenv'
dotenv.config({})
class Config {
  public DATABASE_URL: string | undefined
  public JWT_TOKEN: string | undefined
  public NODE_ENV: string | undefined
  public SECRET_KEY_COOKIE_1: string | undefined
  public SECRET_KEY_COOKIE_2: string | undefined
  public CLIENT_URL: string | undefined
  public DATABASE_URL_DEFAULT = 'mongodb://127.0.0.1:27017/social'
  public REDIS_HOST: string | undefined
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || this.DATABASE_URL_DEFAULT
    this.JWT_TOKEN = process.env.JWT_TOKEN || 'jwt-token-default'
    this.NODE_ENV = process.env.NODE_ENV || 'development'
    this.SECRET_KEY_COOKIE_1 =
      process.env.SECRET_KEY_COOKIE_1 || 'SECRET_KEY_COOKIE_1_DEFAULT'
    this.SECRET_KEY_COOKIE_2 =
      process.env.SECRET_KEY_COOKIE_2 || 'SECRET_KEY_COOKIE_2_DEFAULT'
    this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
    this.REDIS_HOST = process.env.REDIS_HOST || 'redis://localhost:6379'
  }

  public validateConfig() {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined)
        throw new Error(`Configuration ${key} is undefined`)
    }
  }
}
export const config: Config = new Config()
