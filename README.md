# 🚀 Assinaê — Back-end

Repositório back-end do **Assinaê**, construído com NestJS e PostgreSQL serverless via Neon.tech.

---

## 🛠️ Tecnologias

| Camada        | Tecnologia                                              |
|---------------|---------------------------------------------------------|
| Framework     | [NestJS](https://nestjs.com/)                           |
| ORM           | [Drizzle ORM](https://orm.drizzle.team/)                |
| Banco de Dados| [PostgreSQL — Neon.tech](https://neon.tech/)            |
| Linguagem     | TypeScript                                              |

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v18+
- npm v9+
- Conta e banco criado no [Neon.tech](https://neon.tech/)

---

## ⚙️ Configuração do Ambiente

### 1. Clonar e instalar dependências
```bash
git clone https://github.com/UCE020/UCE020-Back.git
cd UCE020-Back
npm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com a string de conexão do Neon:

```env
DATABASE_URL=postgres://usuario:senha@ep-nome-da-db.neon.tech/neondb?sslmode=require
```

### 3. Sincronizar o banco de dados

Aplica o schema diretamente no banco (sem migrations manuais):

```bash
npm run db:push
```

### 4. Iniciar o servidor em modo desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.

---

## 📜 Scripts Disponíveis

| Comando               | Descrição                                          |
|-----------------------|----------------------------------------------------|
| `npm run start:dev`   | Inicia em modo watch (desenvolvimento)             |
| `npm run start:prod`  | Inicia em modo produção                            |
| `npm run build`       | Compila o projeto                                  |
| `npm run db:push`     | Aplica o schema no banco sem gerar migration       |
| `npm run db:studio`   | Abre o Drizzle Studio (gerenciador visual)         |
| `npm run test`        | Roda os testes unitários                           |
| `npm run test:e2e`    | Roda os testes de integração                       |

---

## 🗄️ Banco de Dados com Drizzle

**Alterar tabelas:**  
Edite o arquivo `src/db/schema.ts` e rode:

```bash
npm run db:push
```

**Visualizar dados no navegador:**

```bash
npm run db:studio
```

---

## 📂 Estrutura do Projeto
src/
├── db/
│   ├── index.ts        # Conexão com o banco
│   └── schema.ts       # Definição das tabelas
├── modules/
│   └── [recurso]/
│       ├── [recurso].controller.ts
│       ├── [recurso].service.ts
│       └── [recurso].module.ts
└── main.ts             # Entry point da aplicação
test/
└── ...                 # Testes unitários e de integração

---

## 🧪 Verificando o Setup

Com a aplicação rodando, acesse:
GET http://localhost:3000/health

Resposta esperada:

```json
{
  "status":"ok",
  "database":"connected",
  "data": {
    "result":2
  }
}
```

Se esse JSON aparecer, o NestJS e o banco de dados estão conectados corretamente. ✅