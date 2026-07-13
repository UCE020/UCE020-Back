import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { writeFile, unlink, access } from 'fs/promises';
import { extname, join } from 'path';
import 'multer';

// Pasta física onde os arquivos ficam salvos. Ajuste conforme o deploy
// (ex: montar um volume persistente ou trocar por S3/Cloud Storage).
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');

// Base pública usada para montar a URL retornada ao front-end.
// Em produção, isso normalmente é o domínio da API ou de um CDN.
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? 'http://localhost:3001';

const EXTENSOES_PERMITIDAS = ['.png', '.jpg', '.jpeg', '.webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5MB

@Injectable()
export class AvatarStorageService {
  constructor() {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  /**
   * Salva a foto de perfil enviada e retorna a URL pública do arquivo.
   * Contrato simples (userId, file) -> url, para poder trocar a implementação
   * (S3, disco, etc.) sem alterar o controller/service que a utilizam.
   */
  async save(userId: number, file: Express.Multer.File): Promise<string> {
    if (!file) throw new BadRequestException('Nenhuma imagem enviada');

    const extensao = extname(file.originalname).toLowerCase();
    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
      throw new BadRequestException(
        `Formato de imagem inválido. Use: ${EXTENSOES_PERMITIDAS.join(', ')}`,
      );
    }

    if (file.size > TAMANHO_MAXIMO_BYTES) {
      throw new BadRequestException('Imagem excede o tamanho máximo de 5MB');
    }

    const nomeArquivo = `${userId}-${randomUUID()}${extensao}`;
    const caminhoCompleto = join(UPLOAD_DIR, nomeArquivo);

    await writeFile(caminhoCompleto, file.buffer);

    return `${PUBLIC_BASE_URL}/uploads/avatars/${nomeArquivo}`;
  }

  /**
   * Remove um avatar antigo do disco, se existir.
   * Chame antes de salvar um novo, caso queira evitar arquivos órfãos.
   */
  async remove(avatarUrl?: string | null): Promise<void> {
    if (!avatarUrl) return;

    const nomeArquivo = avatarUrl.split('/').pop();
    if (!nomeArquivo) return;

    const caminhoCompleto = join(UPLOAD_DIR, nomeArquivo);

    try {
      await access(caminhoCompleto);
      await unlink(caminhoCompleto);
    } catch {
      // Arquivo já não existe — nada a fazer.
    }
  }
}