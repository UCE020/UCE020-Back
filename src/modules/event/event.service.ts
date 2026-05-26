import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  create(createEventDto: CreateEventDto) {
    return { success: true, data: createEventDto };
  }

  findAll() {
    return { success: true, data: [] };
  }

  findOne(id: number) {
    return { success: true, data: { id } };
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return { success: true, data: { id, ...updateEventDto } };
  }

  remove(id: number) {
    return { success: true, data: { id } };
  }
}
