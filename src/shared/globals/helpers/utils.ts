import jwt from 'jsonwebtoken';
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

  static generateJwtToken(payload: object, expiresIn: number | string = '7d'): string {
    return jwt.sign(
      {
        ...payload
      },
      config.JWT_TOKEN!,
      { expiresIn }
    );
  }

  static parseJson(str: string) {
    try {
      return JSON.parse(str);
    } catch (error) {
      return str;
    }
  }
}
