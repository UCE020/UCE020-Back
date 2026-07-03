// src/modules/certificate/certificate.module.ts
import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { AuthModule } from '../auth/auth.module';
import { CertificateRepository } from './repository/certificate.respository';

@Module({
  imports:     [AuthModule],
  controllers: [CertificateController],
  providers:   [CertificateService, CertificateRepository],
})
export class CertificateModule {}