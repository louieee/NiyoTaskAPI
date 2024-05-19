import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  username: string;

  @Prop()
  emailAddress: string;

  @Prop()
  profilePic: string | null;

  @Prop()
  emailVerified: boolean | false;

  @Prop()
  isActive: boolean | false;

  @Prop()
  passwordHash: string;

  fullName = () => `${this.firstName} ${this.lastName}`;
}

export const UserSchema = SchemaFactory.createForClass(User);
