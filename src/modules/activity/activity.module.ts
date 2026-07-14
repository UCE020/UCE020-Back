import { Module } from '@nestjs/common';
import { ActivityController} from './activity.controller';
import { ActivityService } from './activity.service';
import { SupabaseStorageModule } from 'src/common/storage/supabase-storage.module';

@Module({
  imports: [SupabaseStorageModule],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
