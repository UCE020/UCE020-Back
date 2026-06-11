import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name!: string;

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, { message: 'O e-mail deve seguir o formato válido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  password!: string;
}
