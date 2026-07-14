import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-acitivity.dto';
import { FindAllActivitiesDto } from './dto/find-activities.dto';
import type { RequestWithUser } from 'src/common/types/request-with-user.type';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { SupabaseStorageService } from 'src/common/storage/supabase-storage.service';
import 'multer';

@ApiTags('activity')
@ApiBearerAuth()
@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly storage: SupabaseStorageService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateActivityDto })
  @ApiOperation({ summary: 'Criar uma nova atividade para um evento' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas organizadores podem realizar esta ação.',
  })
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    await this.activityService.assertAuthenticatedUserExists(req.user.sub);

    let uploadedPhotoUrl: string | undefined;

    if (file) {
      uploadedPhotoUrl = await this.storage.uploadMulterFile(
        'Atividades',
        file,
        req.user.sub,
      );
      createActivityDto.foto = uploadedPhotoUrl;
    } else if (createActivityDto.foto?.startsWith('data:')) {
      uploadedPhotoUrl = await this.storage.uploadDataUrl(
        'Atividades',
        createActivityDto.foto,
        req.user.sub,
      );
      createActivityDto.foto = uploadedPhotoUrl;
    }

    try {
      return await this.activityService.create({
        dto: createActivityDto,
        userId: req.user.sub,
      });
    } catch (error) {
      if (uploadedPhotoUrl) {
        await this.storage.tryRemoveByPublicUrl(uploadedPhotoUrl);
      }

      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as atividades (com filtros opcionais)',
  })
  @ApiResponse({ status: 200, description: 'Atividades listadas com sucesso.' })
  findAll(@Query() query: FindAllActivitiesDto) {
    return this.activityService.findAll(query);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Listar participantes inscritos em uma atividade' })
  @ApiResponse({
    status: 200,
    description: 'Participantes da atividade listados com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada.' })
  findParticipants(@Param('id') id: string): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      presenceStatus: 'pending' | 'confirmed';
    }>;
  }> {
    return this.activityService.findParticipants(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar os detalhes de uma atividade pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Atividade encontrada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada.' })
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activityService.findOne(+id, req.user.sub);
  }

  @Post(':id/subscribe')
  @ApiOperation({ summary: 'Inscrever usuário autenticado em uma atividade' })
  @ApiResponse({ status: 201, description: 'Inscrição realizada com sucesso.' })
  subscribe(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activityService.subscribe(+id, req.user.sub);
  }

  @Delete(':id/unsubscribe')
  @ApiOperation({
    summary: 'Cancelar inscrição do usuário autenticado na atividade',
  })
  @ApiResponse({ status: 200, description: 'Inscrição cancelada com sucesso.' })
  unsubscribe(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activityService.unsubscribe(+id, req.user.sub);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateActivityDto })
  @ApiOperation({ summary: 'Atualizar os dados de uma atividade' })
  @ApiResponse({
    status: 200,
    description: 'Atividade atualizada com sucesso.',
  })
  @ApiResponse({
    status: 403,
    description: 'Apenas organizadores podem realizar esta ação.',
  })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada.' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    await this.activityService.assertAuthenticatedUserExists(req.user.sub);

    let uploadedPhotoUrl: string | undefined;

    if (file) {
      uploadedPhotoUrl = await this.storage.uploadMulterFile(
        'Atividades',
        file,
        id,
      );
      updateActivityDto.foto = uploadedPhotoUrl;
    } else if (updateActivityDto.foto?.startsWith('data:')) {
      uploadedPhotoUrl = await this.storage.uploadDataUrl(
        'Atividades',
        updateActivityDto.foto,
        id,
      );
      updateActivityDto.foto = uploadedPhotoUrl;
    }

    try {
      return await this.activityService.update({
        id: +id,
        dto: updateActivityDto,
        userId: req.user.sub,
      });
    } catch (error) {
      if (uploadedPhotoUrl) {
        await this.storage.tryRemoveByPublicUrl(uploadedPhotoUrl);
      }

      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma atividade' })
  @ApiResponse({ status: 200, description: 'Atividade removida com sucesso.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas organizadores podem realizar esta ação.',
  })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada.' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activityService.remove({ id: +id, userId: req.user.sub });
  }
}
