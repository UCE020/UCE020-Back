import {
  BadRequestException, ConflictException,
  Injectable, NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const CAMPOS_PROIBIDOS_PERFIL = ['senha', 'senhaHash'] as const;

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  // ── perfil (contexto /me) ──────────────────────────────────────────

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    if (Object.keys(dto).length === 0)
      throw new BadRequestException('Nenhum campo informado para atualização');

    for (const campo of CAMPOS_PROIBIDOS_PERFIL) {
      if (campo in dto)
        throw new BadRequestException(`O campo '${campo}' não pode ser alterado neste endpoint`);
    }

    if (dto.email) {
      dto.email = dto.email.toLowerCase();
      if (await this.repo.emailInUse(dto.email, userId))
        throw new ConflictException('E-mail já está em uso');
    }

    const atualizado = await this.repo.update(userId, dto);
    if (!atualizado) throw new NotFoundException('Usuário não encontrado');
    return atualizado;
  }

  // ── admin (contexto /user) ─────────────────────────────────────────

  async getUser(id: number) {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    if (Object.keys(dto).length === 0)
      throw new BadRequestException('Nenhum campo informado para atualização');

    if (dto.email) {
      dto.email = dto.email.toLowerCase();
      if (await this.repo.emailInUse(dto.email, id))
        throw new ConflictException('E-mail já está em uso');
    }

    const atualizado = await this.repo.update(id, dto);
    if (!atualizado) throw new NotFoundException('Usuário não encontrado');
    return atualizado;
  }

  async deleteUser(id: number) {
    const usuario = await this.repo.findById(id);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    await this.repo.delete(id);
  }

  async listAllUsers() {
    return this.repo.findAll();
  }
}