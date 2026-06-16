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
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string | number;
    name: string;
    email: string;
  };
}

@ApiTags('event')
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo evento' })
  @ApiResponse({ status: 201, description: 'Evento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
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
  @ApiOperation({
    summary: 'Listar eventos nos quais o usuário autenticado está inscrito',
  })
  @ApiResponse({
    status: 200,
    description: 'Eventos do usuário listados com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Token de autenticação inválido ou ausente',
  })
  async findParticipatingEvents(@Req() req: RequestWithUser) {
    const userId = Number(req.user.id);
    return await this.eventService.findEventsByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evento pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento encontrado' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar evento pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover evento pelo ID' })
  @ApiResponse({ status: 200, description: 'Evento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Evento não encontrado' })
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
