import { IRefreshToken } from '@authV1/interfaces/auth.interface';
import { config } from '@root/config';
import { BaseCache } from './base.cache';

export class RefreshToken extends BaseCache {
  constructor() {
    super('refresh-token');
  }
  public async saveRefreshTokenToCache(refreshTokenInfo: IRefreshToken): Promise<void> {
    const createdAt = new Date();
    const expires = Date.now() + config.REFRESH_TOKEN_EXPIRES_IN!;
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.json.set(`refresh-token:${refreshTokenInfo.token}`, '.', { ...refreshTokenInfo, createdAt, expires } as any);
    } catch (error) {
      this.logger.error(error);
    }
  }

  public async getRefreshTokenFromCache(token: string, path: string | string[]): Promise<IRefreshToken | null> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    const response: IRefreshToken = (await this.client.json.get(`refresh-token:${token}`, {
      path
    })) as unknown as IRefreshToken;
    return response;
  }

  public async deleteRefreshTokenFromCache(token: string): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    await this.client.json.DEL(`refresh-token:${token}`);
  }

  public async updateRefreshTokenFromCache(token: string, path: string, value: any): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
    await this.client.json.SET(`refresh-token:${token}`, path, value, { XX: true });
  }
}

export const refreshTokenCache: RefreshToken = new RefreshToken();
