import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable} from '@nestjs/common';
import { User } from '../types/user';
import { JwtPayload } from 'src/common/types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'sua-chave-secreta-super-segura',
    });
  }

  validate(payload: User): JwtPayload {
    return { 
      sub: payload.id, 
      name: payload.name, 
      email: payload.email, 
    };
  }
}