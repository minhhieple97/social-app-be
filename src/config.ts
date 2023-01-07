import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { CookieOptions } from 'express';
dotenv.config({});
class Config {
  public DATABASE_URL: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_COOKIE: string | undefined;
  public CLIENT_URL: string | undefined;
  public DATABASE_URL_DEFAULT: string | undefined;
  public REDIS_HOST: string | undefined;
  public CLOUDINARY_API_KEY: string | undefined;
  public CLOUDINARY_SECRET_KEY: string | undefined;
  public CLOUDINARY_PROJECT_NAME: string | undefined;
  public PEPPER_SECRET: string | undefined;
  public ACCESS_TOKEN_PRIVATE_KEY: string | undefined;
  public ACCESS_TOKEN_PUBLIC_KEY: string | undefined;
  public ACCESS_TOKEN_EXPIRES_IN: number | undefined;
  public REFRESH_TOKEN_EXPIRES_IN: number | undefined;
  public BASE_COOKIE_OPTION: CookieOptions;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;
  public SENDGRID_SENDER: string | undefined;
  public SENDER_EMAIL_HOST: string | undefined;
  public SENDER_EMAIL_USER: string | undefined;
  public SENDER_EMAIL_PORT: number | undefined;
  public IS_PRODUCTION: boolean;
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.SECRET_KEY_COOKIE = process.env.SECRET_KEY_COOKIE;
    this.CLOUDINARY_PROJECT_NAME = process.env.CLOUDINARY_PROJECT_NAME;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    this.CLOUDINARY_SECRET_KEY = process.env.CLOUDINARY_SECRET_KEY;
    this.PEPPER_SECRET = process.env.PEPPER_SECRET;
    this.ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY;
    this.ACCESS_TOKEN_PUBLIC_KEY = process.env.ACCESS_TOKEN_PUBLIC_KEY;
    this.ACCESS_TOKEN_EXPIRES_IN = +process.env.ACCESS_TOKEN_EXPIRES_IN!;
    this.REFRESH_TOKEN_EXPIRES_IN = +process.env.REFRESH_TOKEN_EXPIRES_IN!;
    this.IS_PRODUCTION = this.NODE_ENV === 'production';
    this.BASE_COOKIE_OPTION = {
      httpOnly: this.IS_PRODUCTION,
      sameSite: this.IS_PRODUCTION ? 'strict' : 'lax',
      secure: this.IS_PRODUCTION, // only https ?
      signed: this.IS_PRODUCTION // encode cookie ?
    };
    this.SENDER_EMAIL_HOST = process.env.SENDER_EMAIL_HOST!;
    this.SENDER_EMAIL_USER = process.env.SENDER_EMAIL_USER;
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD;
    this.SENDER_EMAIL = process.env.SENDER_EMAIL;
    this.SENDER_EMAIL_PORT = +process.env.SENDER_EMAIL_PORT!;
  }

  public validateConfig() {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) throw new Error(`Configuration ${key} is undefined`);
    }
  }

  public createLogger(category: string, level: string = 'debug') {
    const transport: DailyRotateFile = new DailyRotateFile({
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      maxSize: '5m',
      maxFiles: '7d'
    });
    const jsonLogFileFormat = format.combine(format.errors({ stack: true }), format.prettyPrint(), format.label({ label: category }));
    const logger = winston.createLogger({
      transports: [transport],
      level,
      format: jsonLogFileFormat
    });

    // When running locally, write everything to the console
    // with proper stacktraces enabled
    if (!this.IS_PRODUCTION) {
      logger.add(
        new winston.transports.Console({
          format: format.combine(
            format.errors({ stack: true }),
            format.label({ label: category }),
            format.timestamp({
              format: 'DD-MM-YYYY HH:mm:ss'
            }),
            format.colorize(),
            format.printf(({ level, message, timestamp, stack, label }) => {
              if (stack) {
                return `${timestamp} [${label}] ${level}: ${message} - ${stack}`;
              }
              return `${timestamp} [${label}] ${level}: ${message}`;
            })
          )
        })
      );
    }
    return logger;
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
