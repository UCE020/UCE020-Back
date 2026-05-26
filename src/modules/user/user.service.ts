import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return { success: true, data: createUserDto };
  }

  findAll() {
    return { success: true, data: [] };
  }

  findOne(id: number) {
    return { success: true, data: { id } };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return { success: true, data: { id, ...updateUserDto } };
  }

  remove(id: number) {
    return { success: true, data: { id } };
  }
}
