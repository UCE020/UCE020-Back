import { Module } from '@nestjs/common';
import { ParticipationController } from './participation.controller';
import { ParticipationService } from './participation.service';
import { ParticipationRepository } from './repository/participation.repository';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService, ParticipationRepository],
  exports: [ParticipationService],
})
export class ParticipationModule {}
