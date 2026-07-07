import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EventService } from './event.service';
import type { TipoParticipante } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';
import { User } from 'src/common/decorators/usuario.decorator';

const TIPOS_PARTICIPANTE: TipoParticipante[] = [
  'participante',
  'organizador',
  'monitor',
];

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo evento' })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async create(
    @Body() createEventDto: CreateEventDto,
    @User() user: JwtPayload,
  ) {
    const userId = Number(user.sub);
    return await this.eventService.create(createEventDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os eventos' })
  @ApiResponse({ status: 200, description: 'Eventos listados com sucesso' })
  async findAll() {
    return await this.eventService.findAll();
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Buscar evento pelo código (ex: SCM2025)' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async findByCodigo(@Param('codigo') codigo: string) {
    return await this.eventService.findByCodigo(codigo);
  }

  @Get('participating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar eventos nos quais o usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos do usuário listados com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TIPOS_PARTICIPANTE,
    description: 'Filtra os eventos pelo tipo de participação do usuário',
  })
  async findParticipatingEvents(
    @User() user: JwtPayload,
    @Query('tipo') tipo?: TipoParticipante,
  ) {
    const userId = Number(user.sub);

    if (!Number.isInteger(userId)) {
      throw new UnauthorizedException('Token de autenticação inválido.');
    }

    if (tipo && !TIPOS_PARTICIPANTE.includes(tipo)) {
      throw new BadRequestException(
        'Tipo de participação inválido. Use participante, organizador ou monitor.',
      );
    }

    return await this.eventService.findEventsByUser(userId, tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evento pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  async findOne(@Param('id') id: string) {
    return await this.eventService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover evento pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async remove(@Param('id') id: string) {
    return await this.eventService.remove(+id);
  }

  // --- Rotas de Gerenciamento de Membros ---

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os membros do evento' })
  @ApiResponse({ status: 200, description: 'Membros listados com sucesso' })
  async getMembers(@Param('id') id: string) {
    return await this.eventService.getEventMembers(+id);
  }

  @Patch(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar papel/tipo de um membro (apenas organizadores)',
  })
  @ApiResponse({ status: 200, description: 'Membro atualizado com sucesso' })
  async updateMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @User() user: JwtPayload,
  ) {
    const requesterId = Number(user.sub);
    return await this.eventService.updateEventMember(
      +id,
      +userId,
      updateMemberDto.tipo,
      requesterId,
    );
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover um membro do evento (apenas organizadores)',
  })
  @ApiResponse({ status: 200, description: 'Membro removido com sucesso' })
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @User() user: JwtPayload,
  ) {
    const requesterId = Number(user.sub);
    return await this.eventService.removeEventMember(+id, +userId, requesterId);
  }
}
