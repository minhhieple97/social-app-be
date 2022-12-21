import { IAuthPayload } from '@authV1/interfaces/auth.interface';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '@root/config';
import Utils from '@globalV1/helpers/utils';
import { refreshTokenCache } from '@serviceV1/redis/refresh-token.cache';
class TokenService {
  public generateJwtToken(key: string, payload: Object, options: SignOptions = {}): string {
    const privateKey = Buffer.from(key, 'base64').toString('ascii');
    return jwt.sign(payload, privateKey, {
      ...(options && options),
      algorithm: 'RS256'
    });
  }

  public verifyJwtToken<T>(token: string, key: string): T | null {
    try {
      const publicKey = Buffer.from(key, 'base64').toString('ascii');
      return jwt.verify(token, publicKey) as T;
    } catch (error) {
      return null;
    }
  }

  public generateAccessToken(userId: string): string {
    const accessToken = this.generateJwtToken(
      config.ACCESS_TOKEN_PRIVATE_KEY!,
      {
        sub: userId
      },
      {
        expiresIn: `${config.ACCESS_TOKEN_EXPIRES_IN! / 1000}s`
      }
    );
    return accessToken;
  }

  public async generateRefreshToken(userId: string, ip: string): Promise<string> {
    const refreshToken = Utils.randomTokenString();
    const refreshTokenInfo = {
      token: refreshToken,
      createdByIp: ip,
      userId: userId,
      isActive: true
    };
    await refreshTokenCache.saveRefreshTokenToCache(refreshTokenInfo);
    return refreshToken;
  }
}

export const tokenService = new TokenService();
