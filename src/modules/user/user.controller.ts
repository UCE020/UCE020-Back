import {
  Body, Controller, Delete, Get, HttpCode,
  HttpStatus, Param, ParseIntPipe, Patch, UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiBadRequestResponse, ApiConflictResponse,
  ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista de todos os usuários', type: [UserResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  listAllUsers() {
    return this.userService.listAllUsers();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Usuário encontrado', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  getUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUser(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Usuário deletado com sucesso' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}