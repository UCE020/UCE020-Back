import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'token_recebido_no_email' })
  @IsString()
  @IsNotEmpty({ message: 'O token de recuperação é obrigatório.' })
  token!: string;

  @ApiProperty({ example: 'nova_senha_123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'A nova senha deve conter no mínimo 6 caracteres.' })
  @IsNotEmpty({ message: 'A nova senha é obrigatória.' })
  newPassword!: string;
}