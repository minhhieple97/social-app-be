import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@root/config';
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

  static generateJwtToken(payload: Object, options: SignOptions = {}): string {
    const privateKey = Buffer.from(config.ACCESS_TOKEN_PRIVATE_KEY!, 'base64').toString('ascii');
    return jwt.sign(payload, privateKey, {
      ...(options && options),
      algorithm: 'RS256'
    });
  }

  static verifyJwtToken<T>(token: string): T | null {
    try {
      const publicKey = Buffer.from(config.ACCESS_TOKEN_PUBLIC_KEY!, 'base64').toString('ascii');
      return jwt.verify(token, publicKey) as T;
    } catch (error) {
      return null;
    }
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

  static handleErrorPromiseAllSettled(listRes: any): void {
    for (let i = 0; i < listRes.length; i++) {
      const response = listRes[i];
      if (response.status! === 'rejected') {
        throw response.reason!;
      }
    }
  }
}
