import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { EventModule } from '../event/event.module';
import { ParticipationModule } from '../participation/participation.module';
import { CertificateModule } from '../certificate/certificate.module';
import { EmailModule } from '../email/email.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from 'src/config/env.validation';
import { ActivityModule } from '../activity/activity.module';
import databaseConfig from '../../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: envValidationSchema,
      load: [databaseConfig],
    }),
    AuthModule,
    UserModule,
    EventModule,
    ActivityModule,
    ParticipationModule,
    CertificateModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
