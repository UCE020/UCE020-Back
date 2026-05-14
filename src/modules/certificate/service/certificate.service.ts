import { Injectable } from '@nestjs/common';
import { CreateCertificateDto } from '../dto/create-certificate.dto';
import { UpdateCertificateDto } from '../dto/update-certificate.dto';

@Injectable()
export class CertificateService {
  create(createCertificateDto: CreateCertificateDto) {
    return { success: true, data: createCertificateDto };
  }

  findAll() {
    return { success: true, data: [] };
  }

  findOne(id: number) {
    return { success: true, data: { id } };
  }

  update(id: number, updateCertificateDto: UpdateCertificateDto) {
    return { success: true, data: { id, ...updateCertificateDto } };
  }

  remove(id: number) {
    return { success: true, data: { id } };
  }
}
