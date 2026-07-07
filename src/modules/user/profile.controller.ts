import {
  Body, Controller, Get, HttpCode, HttpStatus, Patch, Post,
  Req, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth, ApiBadRequestResponse, ApiBody, ApiConflictResponse,
  ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
// TODO: trocar pelo serviço de storage real do projeto (S3, disco, etc.).
// Aqui ele é só um contrato: recebe o arquivo e devolve a URL final salva.
import { AvatarStorageService } from './avatar-storage.service';
import 'multer';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class UserProfileController {
  constructor(
    private readonly userService: UserService,
    private readonly avatarStorage: AvatarStorageService,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Perfil do usuário autenticado', type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  getProfile(@Req() req: any) {
    return this.userService.getUser(req.user.sub);
  }

  @Patch()
  @ApiOkResponse({ description: 'Perfil atualizado com sucesso', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiConflictResponse({ description: 'E-mail já está em uso' })
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.sub, dto);
  }

  @Patch('senha')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Senha alterada com sucesso' })
  @ApiBadRequestResponse({ description: 'Senha atual incorreta ou nova senha inválida' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.userService.changePassword(req.user.sub, dto);
  }

  @Post('foto')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { foto: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOkResponse({ description: 'Foto de perfil atualizada com sucesso', type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Nenhuma imagem enviada ou formato inválido' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  async updateAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = await this.avatarStorage.save(req.user.sub, file);
    return this.userService.updateAvatar(req.user.sub, avatarUrl);
  }
}