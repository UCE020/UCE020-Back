import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, or } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

import { db } from '../../db';
import { tabelaUsuario } from '../../db/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password} = registerDto;

    const [userExists] = await db
      .select()
      .from(tabelaUsuario)
      .where(
        or(eq(tabelaUsuario.email, email)),
      )
      .limit(1);

    if (userExists) {
      throw new ConflictException('E-mail ou CPF já cadastrado.');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [newUser] = await db
      .insert(tabelaUsuario)
      .values({
        nome: name,
        email: email,
        senha: hashedPassword,
      })
      .returning({
        id: tabelaUsuario.id,
        nome: tabelaUsuario.nome,
        email: tabelaUsuario.email,
      });

    return {
      message: 'Usuário cadastrado com sucesso!',
      data: newUser,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const [user] = await db
      .select()
      .from(tabelaUsuario)
      .where(eq(tabelaUsuario.email, email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.id, email: user.email, nome: user.nome };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
