import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  login(loginDto: LoginDto) {
    return { success: true, data: loginDto };
  }

  register(registerDto: RegisterDto) {
    return { success: true, data: registerDto };
  }
}
