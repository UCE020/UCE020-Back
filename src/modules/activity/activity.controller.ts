import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-acitivity.dto';
import { FindAllActivitiesDto } from './dto/find-activities.dto';
import type { RequestWithUser } from 'src/common/types/request-with-user.type';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { SubscribeActivityDto } from './dto/subscribe-activity.dto';

@ApiTags('activity')
@ApiBearerAuth() // 🚀 Indica que o Swagger precisa do Token JWT para testar estes endpoints
@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private getAuthenticatedUserId(req: RequestWithUser): number {
    const userId = req.user?.id;

    if (userId === undefined) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    return userId;
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova atividade para um evento' })
  @ApiResponse({ status: 201, description: 'Atividade criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos.' })
  @ApiResponse({
    status: 403,
    description: 'Apenas organizadores podem realizar esta ação.',
  })
  create(
    @Body() createActivityDto: CreateActivityDto,
    @Req() req: RequestWithUser,
  ) {
    return this.activityService.create({
      dto: createActivityDto,
      userId: this.getAuthenticatedUserId(req),
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as atividades (com filtros opcionais)',
  })
  @ApiResponse({ status: 200, description: 'Atividades listadas com sucesso.' })
  findAll(@Query() query: FindAllActivitiesDto) {
    return this.activityService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar os detalhes de uma atividade pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Atividade encontrada com sucesso.',
  })
  @ApiResponse({ status: 404, description: 'Atividade não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(+id);
  }

  @Post(':id/subscribe')
  subscribe(
    @Param('id') id: string,
    @Body() subscribeActivityDto: SubscribeActivityDto,
    @Req() req: RequestWithUser,
  ) {
    return this.activityService.subscribe(+id, {
      userId: subscribeActivityDto?.userId ?? this.getAuthenticatedUserId(req),
    });
  }

  @Delete(':id/unsubscribe')
  unsubscribe(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activityService.unsubscribe(
      +id,
      this.getAuthenticatedUserId(req),
    );
  }

  @Delete(':id/unsubscribe/:userId')
  unsubscribeByUserId(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.activityService.unsubscribe(+id, +userId);
  }

  @Patch(':id')
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
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req: RequestWithUser,
  ) {
    return this.activityService.update({
      id: +id,
      dto: updateActivityDto,
      userId: this.getAuthenticatedUserId(req),
    });
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
    return this.activityService.remove({
      id: +id,
      userId: this.getAuthenticatedUserId(req),
    });
  }
}
