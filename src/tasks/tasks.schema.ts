import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  done: boolean;

  @Prop()
  dateAdded: Date;

  @Prop()
  dateUpdated: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);