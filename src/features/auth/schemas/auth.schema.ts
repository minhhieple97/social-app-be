import { hash, verify } from 'argon2';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { model, Model, Schema } from 'mongoose';
import crypto from 'crypto';
import { config } from '@root/config';
const authSchema: Schema = new Schema(
  {
    username: { type: String },
    uId: { type: String },
    email: { type: String },
    password: { type: String },
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

authSchema.pre('save', async function (this: IAuthDocument, next: () => void) {
  const salt = crypto.randomBytes(20);
  const hashedPassword: string = await hash(this.password! + config.SECRET_KEY, { salt });
  this.salt = salt.toString('hex');
  this.password = hashedPassword;
  next();
});

authSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const hashedPassword: string = (this as unknown as IAuthDocument).password!;
  const salt: String = (this as unknown as IAuthDocument).salt!;
  return verify(config.SECRET_KEY + password, hashedPassword, { salt: Buffer.from(salt, 'hex') });
};

authSchema.methods.hashPassword = async function (password: string, salt: String): Promise<string> {
  return hash(config.SECRET_KEY + password, { salt: Buffer.from(salt, 'hex') });
};

const AuthModel: Model<IAuthDocument> = model<IAuthDocument>('Auth', authSchema, 'Auth');
export { AuthModel };
