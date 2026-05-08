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

- [Node.js](https://nodejs.org/) v22+
- npm v11+

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

```bash
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
```

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


## 🌿 Fluxo de Trabalho (Git)

### Branches

| Branch | Descrição |
|--------|-----------|
| `main` | Produção — nunca commitar direto |
| `dev`  | Desenvolvimento — base para todas as tasks |

### Criando sua branch

Sempre a partir da `dev`:

```bash
git checkout dev
git pull origin dev
git checkout -b task/nome-da-task
```

Exemplos de nomes:
- `task/criar-modulo-usuarios`
- `task/configurar-autenticacao`
- `task/corrigir-health-check`

### Abrindo o Pull Request

Ao finalizar, suba a branch e abra o PR:

```bash
git push origin task/nome-da-task
```

Depois acesse o repositório no GitHub e abra um **Pull Request** de `task/nome-da-task` → `dev`.