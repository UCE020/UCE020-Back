import { Module } from '@nestjs/common';
import { ParticipationController } from './controller/participation.controller';
import { ParticipationService } from './service/participation.service';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService],
  exports: [ParticipationService],
})
export class ParticipationModule {}
