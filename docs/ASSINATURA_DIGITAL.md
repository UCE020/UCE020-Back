# Assinatura digital de certificados

Fluxo de **assinatura em lote** dos certificados de um evento. A assinatura é
**lógica + hash**: cada certificado é marcado como assinado no banco (quem
assinou, quando, com um código e um hash de integridade) e o PDF é **regerado**
com o bloco de assinatura **centralizado** no corpo do certificado (onde antes
ficavam as linhas). Não usa certificado criptográfico (.pfx/ICP‑Brasil).

Os PDFs ficam no **Supabase Storage** (não mais no disco local). Como cada upload
gera um objeto novo, ao assinar o back **sobe o PDF assinado, atualiza a coluna
`arquivo_pdf` com a nova URL e remove o arquivo antigo do bucket**.

## O que foi implementado (back)

- **Schema** (`src/db/schema.ts`): novas colunas nas 3 tabelas de certificado
  (`certificado_evento`, `certificado_atividade`, `certificado_convidado`):
  `assinado`, `assinado_em`, `assinado_por`, `assinatura_nome`,
  `codigo_verificacao`, `hash_verificacao`.
- **`signature/verification-hash.ts`**: gera o código público
  (`XXXX-XXXX-XXXX`) e o hash SHA‑256 de integridade.
- **`signature/qr.ts`** (usa `qrcode`): gera o PNG do QR Code com a URL de
  verificação.
- **Templates** (`pdf/participant-certificate.pdf.ts`, `pdf/guest-certificate.pdf.ts`
  e `pdf/certificate.styles.ts`): as duas **linhas de assinatura** pré‑impressas
  foram removidas. No lugar, um bloco central reservado que, quando o certificado
  é assinado, mostra **centralizado**: o **QR Code**, a **logo do sistema**
  (Assinaê), o **nome completo de quem assina**, a **data** e o **código** de
  verificação. O bloco é preenchido re‑renderizando o PDF no ato da assinatura
  (nada de carimbo por cima), o que garante o alinhamento central.
- **`storage/certificate-file-storage.service.ts`** (via
  `common/storage/supabase-storage.service.ts`): faz upload do PDF para o bucket
  do Supabase e remove arquivos antigos.
- **`signature/certificate-signature.service.ts`**: orquestra a assinatura em
  lote (só organizador). Re‑renderiza o PDF com a assinatura, faz upload no
  Supabase, atualiza `arquivo_pdf`, remove o arquivo antigo e faz a verificação
  pública.
- **`repository/certificate.respository.ts`**: buscas dos certificados (com os
  dados para re‑render), gravação/reset da assinatura e busca por código.
- **Controllers**: assinatura em lote (protegido) e verificação (público),
  registrados no `certificate.module.ts`.

## 1) Aplicar a migração do banco

As colunas novas precisam existir no banco. No terminal do projeto:

```bash
npm install            # instala pdf-lib e qrcode (já estão no package.json)
npm run db:push        # aplica o schema atual no banco
# ou, se preferir migração versionada:
# npm run db:generate && npm run db:migrate
```

SQL equivalente, caso queira aplicar à mão:

```sql
ALTER TABLE certificado_evento
  ADD COLUMN assinado boolean NOT NULL DEFAULT false,
  ADD COLUMN assinado_em timestamp,
  ADD COLUMN assinado_por integer REFERENCES usuario(id) ON DELETE SET NULL,
  ADD COLUMN assinatura_nome text,
  ADD COLUMN codigo_verificacao text,
  ADD COLUMN hash_verificacao text;
-- repita o mesmo bloco para certificado_atividade e certificado_convidado
```

## 2) Variáveis de ambiente (opcionais)

```env
# Segredo usado no hash de integridade (cai no JWT_SECRET se ausente)
SIGNATURE_SECRET=algum-segredo-forte
# Base do link de verificação codificado no QR Code do certificado.
# Default: {FRONTEND_URL}/certificate/verify  (rota do front)
# O código é anexado ao final: {FRONTEND_URL}/certificate/verify/AD1F-0DC8-9771
# Só defina CERTIFICATE_VERIFY_URL se quiser uma base diferente do FRONTEND_URL.
# CERTIFICATE_VERIFY_URL=https://app.seudominio.com/certificate/verify
```

## 3) Endpoints

### Assinar em lote (protegido — só organizador)

```
POST /api/v1/event/:eventoId/certificate/sign
Authorization: Bearer <token>
```

Assina **todos** os certificados ainda não assinados do evento (participantes e
convidados). Idempotente: rodar de novo só assina os que faltam.

Para **reassinar** os que já estão assinados (regera o PDF do zero — útil após
mudança de layout), use `?force=true`:

```
POST /api/v1/event/:eventoId/certificate/sign?force=true
```

Resposta:

```json
{
  "data": {
    "message": "12 certificado(s) assinado(s) em lote.",
    "data": {
      "assinados": 12,
      "semArquivo": 0,
      "assinante": "Maria Organizadora",
      "certificados": [
        { "tipo": "evento", "certificadoId": 45, "titular": "João Silva", "codigoVerificacao": "A1B2-C3D4-E5F6" }
      ]
    }
  },
  "statusCode": 201
}
```

Erros: `403` (não é organizador), `404` (nada pendente), `401` (sem token).

### Reemitir certificados (protegido — só organizador)

Regera o PDF de certificados **já existentes** com o layout novo e invalida a
assinatura anterior (para você poder reassinar em seguida):

```
POST /api/v1/event/:eventoId/certificate/participants?force=true
POST /api/v1/activity/:atividadeId/certificate/guests?force=true
```

Sem `force`, o comportamento é o de antes (só emite os que ainda não existem).

### Verificar um certificado (público)

```
GET /api/v1/certificate/verify/:codigo
```

`:codigo` é o código estampado no PDF (com ou sem hífens). Retorna
`{ valido: true|false, ... }` com titular, evento/atividade, datas e hash.

## 4) Como chamar no front (botão "Assinar em lote")

O botão fica na tela de certificados de um evento, então ele já tem o `eventoId`.

```ts
async function assinarEmLote(eventoId: number) {
  const res = await fetch(
    `${API_URL}/event/${eventoId}/certificate/sign`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) {
    const erro = await res.json();
    throw new Error(erro?.message ?? "Falha ao assinar certificados");
  }

  const { data } = await res.json();
  return data.data; // { assinados, assinante, certificados: [...] }
}
```

Exemplo com o botão (React):

```tsx
const [carregando, setCarregando] = useState(false);

async function onAssinarEmLote() {
  try {
    setCarregando(true);
    const r = await assinarEmLote(eventoId);
    toast.success(`${r.assinados} certificado(s) assinado(s)!`);
    await recarregarCertificados(); // reflete o "assinado" na lista
  } catch (e) {
    toast.error((e as Error).message);
  } finally {
    setCarregando(false);
  }
}

<button onClick={onAssinarEmLote} disabled={carregando}>
  {carregando ? "Assinando..." : "Assinar em lote"}
</button>
```

Verificação pública (tela/QR de validação):

```ts
async function verificarCertificado(codigo: string) {
  const res = await fetch(`${API_URL}/certificate/verify/${codigo}`);
  const { data } = await res.json();
  return data; // { valido, message, data? }
}
```

### Observações

- Depois de assinar, a coluna `arquivo_pdf` passa a apontar para a **nova URL** do
  Supabase (o PDF assinado) e o arquivo antigo é removido do bucket. O front deve
  reler a lista para pegar a URL atualizada.
- Só assina certificados que já têm PDF gerado. Emita os certificados antes de assinar.
- Requer `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env` (o service falha no
  boot sem elas). Bucket em `SUPABASE_STORAGE_BUCKET`; os PDFs vão para a pasta `Outros/`.
- O front pode esconder/desabilitar o botão quando não houver pendências.

### Re-testar em certificados antigos (ex.: nº 32/34)

Certificados emitidos/assinados **antes** dessa mudança têm o layout antigo
"queimado" no arquivo. Para atualizá‑los sem criar dados novos, com o servidor já
reconstruído (`npm install` + `npm run build`/restart):

1. Reassine em lote: `POST /event/:eventoId/certificate/sign?force=true` — como a
   assinatura **regera o PDF do zero**, isso já produz o certificado novo, limpo,
   com a assinatura centralizada (sem resquício do carimbo antigo).

Se quiser apenas deixá‑los como "não assinados" com o layout novo, use a
reemissão forçada (`participants?force=true`) e depois assine normalmente.
