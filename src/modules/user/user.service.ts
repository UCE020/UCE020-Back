import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async getUserProfile(userId: number) {
    const usuario = await this.repo.findById(userId);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async updateUserProfile(userId: number, dto: UpdateUserDto) {
    if (Object.keys(dto).length === 0)
      throw new BadRequestException('Nenhum campo informado para atualização');

    if (dto.email) {
      dto.email = dto.email.toLowerCase();
      const emUso = await this.repo.emailInUse(dto.email, userId);
      if (emUso) throw new ConflictException('E-mail já está em uso');
    }

    const atualizado = await this.repo.update(userId, dto);
    if (!atualizado) throw new NotFoundException('Usuário não encontrado');
    return atualizado;
  }
}