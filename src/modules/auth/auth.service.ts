import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, or, and, gt } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { db } from '../../db';
import { tabelaUsuario } from '../../db/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    const [userExists] = await db
      .select()
      .from(tabelaUsuario)
      .where(or(eq(tabelaUsuario.email, email)))
      .limit(1);

    if (userExists) {
      throw new ConflictException('E-mail já cadastrado.');
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const [user] = await db
      .select()
      .from(tabelaUsuario)
      .where(eq(tabelaUsuario.email, email))
      .limit(1);
    if (!user) {
      return {
        message:
          'Se o e-mail existir em nosso sistema, um link de recuperação será enviado.',
        data: {},
      };
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await db
      .update(tabelaUsuario)
      .set({ resetPasswordToken: token, resetPasswordExpires: expires })
      .where(eq(tabelaUsuario.id, user.id));

    const frontUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontUrl}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recuperação de Senha',
      html: `
        <p>Olá, ${user.nome}!</p>
        <p>Você solicitou a alteração de sua senha.</p>
        <p>Clique no link abaixo para cadastrar uma nova senha (válido por 15 minutos):</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
      `,
    });

    return {
      message:
        'Se o e-mail existir em nosso sistema, um link de recuperação será enviado.',
      data: {},
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const [user] = await db
      .select()
      .from(tabelaUsuario)
      .where(
        and(
          eq(tabelaUsuario.resetPasswordToken, token),
          gt(tabelaUsuario.resetPasswordExpires, new Date()),
        ),
      )
      .limit(1);

    if (!user) {
      throw new BadRequestException(
        'O token de recuperação é inválido ou já expirou.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db
      .update(tabelaUsuario)
      .set({
        senha: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(tabelaUsuario.id, user.id));

    return {
      message: 'Senha alterada com sucesso! Você já pode fazer login.',
      data: {},
    };
  }
}
