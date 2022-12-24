import { CookieOptions } from 'express';
import { config } from '@root/config';
import { v4 as uuidv4 } from 'uuid';

export default class Utils {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toLowerCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }

  static lowerCase(str: string): string {
    return str.toLowerCase();
  }

  static generateRandomIntegers(length: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }

  static parseJson(str: string) {
    try {
      return JSON.parse(str);
    } catch (error) {
      return str;
    }
  }

  static capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static handleErrorPromiseAllSettled(
    listRes: {
      status: 'fulfilled' | 'rejected';
      value?: any;
      reason?: Error | null;
    }[]
  ): void {
    for (let i = 0; i < listRes.length; i++) {
      const response = listRes[i];
      if (response.status === 'rejected') {
        throw response.reason;
      }
    }
  }

  static generateCookieOptionForAuth(expiresIn: number, options?: CookieOptions): CookieOptions {
    return {
      ...config.BASE_COOKIE_OPTION,
      ...options,
      expires: new Date(Date.now() + expiresIn),
      maxAge: expiresIn
    };
  }

  static randomTokenString(): string {
    return uuidv4();
  }
}
