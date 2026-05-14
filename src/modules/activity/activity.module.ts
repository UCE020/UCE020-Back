import { Module } from '@nestjs/common';
import { ActivityController} from './controller/activity.controller';
import { ActivityService } from './service/activity.service';

@Module({
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
