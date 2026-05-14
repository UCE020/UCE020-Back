import { Module } from '@nestjs/common';
import { CertificateController } from './controller/certificate.controller';
import { CertificateService } from './service/certificate.service';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class CertificateModule {}
