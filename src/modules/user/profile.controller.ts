import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiBadRequestResponse, ApiConflictResponse,
  ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/common/decorators/usuario.decorator';

@ApiTags('profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/me')
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({ description: 'Perfil do usuário autenticado', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  getProfile(@User() user: JwtPayload) {
    return this.userService.getUser(user.sub);
  }

  @Patch()
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Body vazio ou campo não permitido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  updateProfile(@User() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.sub, dto);
  }
}