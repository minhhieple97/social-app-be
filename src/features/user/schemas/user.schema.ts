import { config } from '@root/config';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose, { model, Model, Schema } from 'mongoose';

const userSchema: Schema = new Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auth', index: true },
  postsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  passwordResetToken: { type: String, default: '' },
  passwordResetExpires: { type: Number },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: {
    messages: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    follows: { type: Boolean, default: true }
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  work: { type: String, default: '' },
  school: { type: String, default: '' },
  location: { type: String, default: '' },
  quote: { type: String, default: '' },
  bgImageVersion: { type: String, default: '' },
  bgImageId: { type: String, default: '' },
  profileImgVersion: { type: String, default: '' }
});

userSchema.methods.getProfilePicture = function (): string {
  return `https://res.cloudinary.com/${config.CLOUDINARY_PROJECT_NAME}/image/upload/v${this.profilePictureVersion}/${this._id}.jpg`;
};

const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'User');
export { UserModel };
