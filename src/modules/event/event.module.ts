import { Module } from '@nestjs/common';
import { EventController } from './controller/event.controller';
import { EventService } from './service/event.service';

@Module({
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
