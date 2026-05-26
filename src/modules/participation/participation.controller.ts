import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@Controller('participation')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Post()
  create(@Body() createParticipationDto: CreateParticipationDto) {
    return this.participationService.create(createParticipationDto);
  }

  @Get()
  findAll() {
    return this.participationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParticipationDto: UpdateParticipationDto,
  ) {
    return this.participationService.update(+id, updateParticipationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participationService.remove(+id);
  }
}
