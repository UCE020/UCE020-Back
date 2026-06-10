import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserService } from './user.service';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/common/decorators/usuario.decorator';

@ApiTags('user')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me') 
  @ApiOkResponse({ description: 'Perfil do usuário autenticado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  getUserProfile(@User() usuario: JwtPayload) {
    return this.userService.getUserProfile(usuario.sub);
  }

  @Patch('me')
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiBadRequestResponse({ description: 'Body vazio ou campo inválido' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  updateUserProfile(
    @User() usuario: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUserProfile(usuario.sub, dto);
  }
}
