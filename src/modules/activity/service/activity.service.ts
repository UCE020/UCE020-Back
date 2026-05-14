import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from '../dto/create-activity.dto';
import { UpdateActivityDto } from '../dto/update-acitivity.dto';

@Injectable()
export class ActivityService {
  create(createActivityDto: CreateActivityDto) {
    return { success: true, data: createActivityDto };
  }

  findAll() {
    return { success: true, data: [] };
  }

  findOne(id: number) {
    return { success: true, data: { id } };
  }

  update(id: number, updateActivityDto: UpdateActivityDto) {
    return { success: true, data: { id, ...updateActivityDto } };
  }

  remove(id: number) {
    return { success: true, data: { id } };
  }
}
