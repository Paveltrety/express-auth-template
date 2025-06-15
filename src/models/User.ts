import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: number;
  email: string;
  password: string;
  refreshToken?: string;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>('User', UserSchema);
