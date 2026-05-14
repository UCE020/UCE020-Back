import { Injectable } from '@nestjs/common';
import { CreateParticipationDto } from '../dto/create-participation.dto';
import { UpdateParticipationDto } from '../dto/update-participation.dto';

@Injectable()
export class ParticipationService {
  create(createParticipationDto: CreateParticipationDto) {
    return { success: true, data: createParticipationDto };
  }

  findAll() {
    return { success: true, data: [] };
  }

  findOne(id: number) {
    return { success: true, data: { id } };
  }

  update(id: number, updateParticipationDto: UpdateParticipationDto) {
    return { success: true, data: { id, ...updateParticipationDto } };
  }

  remove(id: number) {
    return { success: true, data: { id } };
  }
}
