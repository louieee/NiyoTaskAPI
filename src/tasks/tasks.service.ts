import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './tasks.schema';
import { InjectModel } from '@nestjs/mongoose';
import { TaskDetailDTO, TaskDTO, TaskListQueryDTO, TaskListResponseDTO } from './tasks.dto';
import { APIResponse, UserJWTPayloadDTO } from '../common/common.dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TaskEvents } from './tasks.enums';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Task.name)
    private TaskModel: Model<TaskDocument>,
    private emitter: EventEmitter2,
  ) {}

  async createTask(
    user: UserJWTPayloadDTO,
    data: TaskDTO,
  ): Promise<APIResponse<TaskDetailDTO>> {
    const userId = new Types.ObjectId(user.Id);
    const titleExist = await this.TaskModel.exists({
      title: { $regex: data.title },
      userId: userId,
    });
    if (titleExist) {
      throw new BadRequestException('A task with this title already exists');
    }
    const newTask = new this.TaskModel({
      ...data,
      userId: userId,
      dateAdded: new Date(),
      dateUpdated: new Date(),
      done: false,
    });
    await newTask.save();
    const retData = TaskDetailDTO.map(newTask);
    await this.emitter.emitAsync(TaskEvents.NEW_TASK, retData, user);
    return {
      message: 'Task created successfully',
      data: retData,
      status: 201,
    };
  }

  async updateTask(
    user: UserJWTPayloadDTO,
    taskId: string,
    data: TaskDTO,
  ): Promise<APIResponse<TaskDetailDTO>> {
    const task = await this.getTask(taskId, user.Id);
    const titleExist = await this.TaskModel.exists({
      title: { $regex: data.title },
      userId: new Types.ObjectId(user.Id),
      _id: { $ne: new Types.ObjectId(taskId) },
    });
    if (titleExist) {
      throw new BadRequestException('A task with this title already exists');
    }
    task.set({
      ...data,
      dateUpdated: new Date(),
    });
    const retData = TaskDetailDTO.map(task);
    await task.save();
    await this.emitter.emitAsync(TaskEvents.UPDATE_TASK, retData, user);
    return {
      message: 'Task updated successfully',
      data: retData,
      status: 200,
    };
  }

  async deleteTasks(
    user: UserJWTPayloadDTO,
    taskIds: string[],
  ): Promise<APIResponse<null>> {
    const userId = new Types.ObjectId(user.Id);
    await this.TaskModel.deleteMany({
      userId: userId,
      _id: { $in: taskIds },
    });
    await this.emitter.emitAsync(TaskEvents.DELETE_TASKS, taskIds, user);
    return {
      message: 'Tasks deleted  successfully',
      data: null,
      status: 204,
    };
  }
  async getTask(taskId: string, userId?: string) {
    const task = await this.TaskModel.findById(taskId);
    if (!task) throw new HttpException('This task does not exist', 404);
    if (!userId) return task;
    const userId_ = new Types.ObjectId(userId);
    if (task.userId.toString() !== userId_.toString())
      throw new HttpException('This task does not belong to you', 403);
    return task;
  }
  async retrieveTask(
    userId: string,
    taskId: string,
  ): Promise<APIResponse<TaskDetailDTO>> {
    const task = await this.getTask(taskId, userId);
    return {
      message: 'Task retrieved successfully',
      data: TaskDetailDTO.map(task),
      status: 200,
    };
  }

  async retrieveTasks(
    userId: string,
    skip: number,
    limit: number,
    queryParam: TaskListQueryDTO,
  ): Promise<APIResponse<TaskListResponseDTO>> {
    const queryBuilder = { userId: new Types.ObjectId(userId) };
    if (queryParam.done) queryBuilder['done'] = queryParam.done;
    if (queryParam.startDate) {
      queryBuilder['dateUpdated'] = {
        $gte: queryParam.startDate,
      };
    }
    if (queryParam.endDate) {
      queryBuilder['dateUpdated'] = {
        $lte: queryParam.endDate,
      };
    }
    if (queryParam.search) {
      const searchRegex = new RegExp(queryParam.search, 'i');
      queryBuilder['$or'] = [
        {
          title: {
            $regex: searchRegex,
          },
        },
        {
          description: {
            $regex: searchRegex,
          },
        },
      ];
    }
    const count = await this.TaskModel.countDocuments(queryBuilder);
    const tasks = await this.TaskModel.find(queryBuilder)
      .skip(skip)
      .limit(limit)
      .select('_id title done');
    return {
      message: 'Tasks retrieved successfully',
      data: { count: count, result: tasks },
      status: 200,
    };
  }

  async toggleTaskDone(
    user: UserJWTPayloadDTO,
    taskId: string,
    done: boolean,
  ): Promise<APIResponse<TaskDetailDTO>> {
    const task = await this.getTask(taskId, user.Id);
    task.set({ done: done, dateUpdated: new Date() });
    task.save();
    const retData = TaskDetailDTO.map(task);
    await this.emitter.emitAsync(TaskEvents.UPDATE_TASK, retData, user);
    return {
      message: 'Task updated successfully',
      data: retData,
      status: 200,
    };
  }
}
