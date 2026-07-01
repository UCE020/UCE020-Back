import { Injectable } from "@nestjs/common";
import { db } from "src/db";
import { tabelaUsuario } from "src/db/schema";
import { UpdateUserDto } from "../dto/update-user.dto";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { eq, ne, and, sql } from "drizzle-orm";

const camposSeguros = {
  id:        tabelaUsuario.id,
  name:      sql<string>`${tabelaUsuario.nome}`.as('name'),
  email:     tabelaUsuario.email,
  createdAt: tabelaUsuario.createdAt,
  updatedAt: tabelaUsuario.updatedAt,
};

@Injectable()
export class UserRepository {
  async findById(id: number) {
    return db
      .select(camposSeguros)
      .from(tabelaUsuario)
      .where(eq(tabelaUsuario.id, id))
      .limit(1)
      .then(r => r[0] ?? null);
  }

  async emailInUse(email: string, excludeId: number): Promise<boolean> {
    const found = await db
      .select({ id: tabelaUsuario.id })
      .from(tabelaUsuario)
      .where(and(
        eq(tabelaUsuario.email, email.toLowerCase()),
        ne(tabelaUsuario.id, excludeId),
      ))
      .limit(1);
    return found.length > 0;
  }

  async update(id: number, data: Partial<UpdateUserDto> | Partial<UpdateProfileDto>) {
    // mapeia "name" de volta para "nome" antes de salvar
    const { name, ...rest } = data as { name?: string; email?: string };
    
    const payload: { nome?: string; email?: string; updatedAt: Date } = {
      ...rest,
      ...(name !== undefined && { nome: name }),
      updatedAt: new Date(),
    };

    const rows = await db
      .update(tabelaUsuario)
      .set(payload)
      .where(eq(tabelaUsuario.id, id))
      .returning(camposSeguros);
    return rows[0] ?? null;
  }

  async findAll() {
    return db
      .select(camposSeguros)
      .from(tabelaUsuario)
      .orderBy(tabelaUsuario.createdAt);
  }

  async delete(id: number) {
    await db
      .delete(tabelaUsuario)
      .where(eq(tabelaUsuario.id, id));
  }
}