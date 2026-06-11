import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

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
