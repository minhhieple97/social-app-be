import { hash, verify } from 'argon2';
import { IAuthDocument } from '@authV1/interfaces/auth.interface';
import { model, Model, Schema } from 'mongoose';
import crypto from 'crypto';
import { config } from '@root/config';
const AuthSchema: Schema = new Schema(
  {
    username: { type: String, required: true, index: { unique: true } },
    score: { type: String, required: true },
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    salt: { type: String },
    avatarColor: { type: String },
    createdAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpires: { type: Number }
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        return ret;
      }
    }
  }
);

AuthSchema.virtual('isExpired').get(function () {
  return Date.now() >= this.passwordResetExpires;
});

AuthSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const salt = crypto.randomBytes(20);
  const hashedPassword: string = await hash(this.password! + config.PEPPER_SECRET, { salt });
  this.salt = salt.toString('hex');
  this.password = hashedPassword;
  next();
});

AuthSchema.methods.comparePassword = async function (password: string, salt: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!;
  return verify(hashedPassword, password + config.PEPPER_SECRET, { salt: Buffer.from(salt, 'hex') });
};

AuthSchema.methods.hashPassword = async function (password: string, salt: String): Promise<string> {
  return hash(config.PEPPER_SECRET + password, { salt: Buffer.from(salt, 'hex') });
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', AuthSchema, 'Auth');
export { AuthModel };
