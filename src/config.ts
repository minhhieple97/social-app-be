import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { format, createLogger, transports } from 'winston';
const { combine, timestamp, label, printf } = format;
const colorizer = format.colorize();
const customFormat = printf(({ level, message, label, timestamp }) => {
  return colorizer.colorize(level, `${timestamp} [${label}] : ${message}`);
});
dotenv.config({});
class Config {
  public DATABASE_URL: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_COOKIE_1: string | undefined;
  public SECRET_KEY_COOKIE_2: string | undefined;
  public CLIENT_URL: string | undefined;
  public DATABASE_URL_DEFAULT: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUDINARY_API_KEY: string | undefined;
  public CLOUDINARY_SECRET_KEY: string | undefined;
  public CLOUDINARY_PROJECT_NAME: string | undefined;
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.JWT_TOKEN = process.env.JWT_TOKEN || 'jwt-token-default';
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.SECRET_KEY_COOKIE_1 = process.env.SECRET_KEY_COOKIE_1 || 'SECRET_KEY_COOKIE_1_DEFAULT';
    this.SECRET_KEY_COOKIE_2 = process.env.SECRET_KEY_COOKIE_2 || 'SECRET_KEY_COOKIE_2_DEFAULT';
    this.CLOUDINARY_PROJECT_NAME = process.env.CLOUDINARY_PROJECT_NAME;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    this.CLOUDINARY_SECRET_KEY = process.env.CLOUDINARY_SECRET_KEY;
  }

  public validateConfig() {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) throw new Error(`Configuration ${key} is undefined`);
    }
  }

  public createLogger(category: string) {
    return createLogger({
      level: 'debug',
      format: combine(
        label({ label: category }),
        timestamp({
          format: 'DD-MM-YYYY HH:mm:ss'
        }),
        customFormat
      ),
      transports: [new transports.Console({})]
    });
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: config.CLOUDINARY_PROJECT_NAME,
      api_key: config.CLOUDINARY_API_KEY,
      api_secret: config.CLOUDINARY_SECRET_KEY
    });
  }
}
export const config: Config = new Config();
