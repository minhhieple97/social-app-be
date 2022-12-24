import { uploads } from '@globalV1/helpers/cloudinary-upload';
import { BadRequestError } from '@globalV1/helpers/error-handler';
import Utils from '@globalV1/helpers/utils';
import { userCache } from '@serviceV1/redis/user.cache';
import { IUserDocument } from '@userV1/interfaces/user.interface';
import { userService } from '@userV1/services/user.service';
import { Job, DoneCallback } from 'bull';
import { UploadApiResponse } from 'cloudinary';
import { BaseWorker } from './base.worker';
class UserWorker extends BaseWorker {
  constructor() {
    super('user');
  }
  async addUserToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userInfo, avatarImage }: { userInfo: IUserDocument; avatarImage: string } = await job.data;
      // upload avatar to cloudinary
      const responseUpload: UploadApiResponse = (await uploads(avatarImage, userInfo._id.toString(), true, true)) as UploadApiResponse;
      if (!responseUpload.public_id) {
        throw new BadRequestError('File upload: Error occurred while uploading, please try again');
      }
      // add user to leaderboard (sorted set) && add user to HSET && add user to mongodb
      userInfo.profileImgVersion = responseUpload.version;
      const resultInsert = (await Promise.allSettled([userCache.saveUserToCache(userInfo), userService.createUser(userInfo)])) as {
        status: 'fulfilled' | 'rejected';
        value: any;
      }[];
      Utils.handleErrorPromiseAllSettled(resultInsert);
      done(null, job.data);
    } catch (error) {
      this.logger.error(error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
