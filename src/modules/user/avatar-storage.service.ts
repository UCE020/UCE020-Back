import { BadRequestException, Injectable } from '@nestjs/common';
import { extname } from 'path';
import { SupabaseStorageService } from 'src/common/storage/supabase-storage.service';
import 'multer';

const EXTENSOES_PERMITIDAS = ['.png', '.jpg', '.jpeg', '.webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class AvatarStorageService {
  constructor(private readonly storage: SupabaseStorageService) {}

  async save(userId: number, file: Express.Multer.File): Promise<string> {
    if (!file) throw new BadRequestException('Nenhuma imagem enviada');

    const extensao = extname(file.originalname).toLowerCase();
    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
      throw new BadRequestException(
        `Formato de imagem invalido. Use: ${EXTENSOES_PERMITIDAS.join(', ')}`,
      );
    }

    if (file.size > TAMANHO_MAXIMO_BYTES) {
      throw new BadRequestException('Imagem excede o tamanho maximo de 5MB');
    }

    return this.storage.uploadMulterFile('Perfil', file, userId);
  }

  async remove(avatarUrl?: string | null): Promise<void> {
    await this.storage.tryRemoveByPublicUrl(avatarUrl);
  }
}
