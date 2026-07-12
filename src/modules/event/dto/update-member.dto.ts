import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import type { TipoParticipante } from '../event.service';

const TIPOS_PARTICIPANTE: TipoParticipante[] = [
  'participante',
  'organizador',
  'monitor',
];

export class UpdateMemberDto {
  @ApiProperty({
    description: 'Novo papel/tipo do membro no evento',
    example: 'organizador',
    enum: TIPOS_PARTICIPANTE,
  })
  @IsNotEmpty()
  @IsEnum(TIPOS_PARTICIPANTE, {
    message:
      'Tipo inválido. Deve ser um dos seguintes valores: participante, organizador, monitor.',
  })
  tipo!: TipoParticipante;
}
