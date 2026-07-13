import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { ActivityModule } from '../activity/activity.module';
import { SupabaseStorageModule } from 'src/common/storage/supabase-storage.module';

@Module({
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
  imports: [ActivityModule, SupabaseStorageModule],
})
export class EventModule {}
