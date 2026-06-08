import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail({}, {message: 'O e-mail deve seguir o formato válido.'})
  @IsNotEmpty({message: 'O e-mail é obrigatório.'})
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString({message: 'O código deve ser uma string.'})
  @IsNotEmpty({message: 'O código é obrigatório.'})
  code!: string;
}