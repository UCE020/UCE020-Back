// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { db } from '../../db'; // Seu arquivo index
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  async checkDatabase(): Promise<{
    status: string;
    database?: string;
    data?: any;
    message?: string;
  }> {
    try {
      // Faz uma query simples de "1+1" no Postgres do Neon
      const result = await db.execute(sql`SELECT 1 + 1 as result`);
      return {
        status: 'ok',
        database: 'connected',
        data: result.rows[0],
      };
    } catch (error) {
      if (error instanceof Error){
        return {
          status: 'error',
          message: error.message,
        };
      }
      return {
        status: 'error',
        message: 'Unknown error',
      };
    }
  }

  getHello(): string {
    return 'API';
  }
}
