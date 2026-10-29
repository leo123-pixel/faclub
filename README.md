# faclub
Site institucional da Fac Lubrificantes 

## Lançamento

### Variáveis na Vercel

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto no Supabase (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave `anon` do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role`; só no servidor, nunca com `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SITE_URL` | `https://faclubrificantes.com.br`, sem barra final. Obrigatória: sitemap, robots, JSON-LD e o link de troca de senha usam este endereço |
| `REVALIDATE_SECRET` | um texto aleatório longo; `POST /api/revalidar` com `Authorization: Bearer <segredo>` atualiza o site depois de importar dados direto no banco |
| `NEXT_PUBLIC_GA4_ID` | ID de medição do GA4 (`G-...`); vazio, o GA4 não carrega |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID do Pixel da Meta; vazio, o Pixel não carrega |

GA4 e Pixel só carregam depois que o visitante clica em "Aceitar" no aviso de cookies. Os eventos são `view_item`, `add_to_cart`, `send_order_whatsapp`, `click_whatsapp` (com o local do botão), `copy_coupon` e `join_group`; no Pixel chegam como eventos personalizados com os mesmos nomes.

### Antes de apontar o DNS

1. Publique na Vercel e confira `/sitemap.xml` e `/robots.txt` no endereço novo.
2. No Search Console do domínio antigo, abra **Indexação → Páginas** e exporte as URLs indexadas. Cada uma que não esteja em `redirects/legacy-urls.json` entra no arquivo (`from` e `to`); `npx vitest run src/lib/domain/legacy-redirects.test.ts` confere a lista. Endereços sob `/wp-content`, `/wp-admin` e `/feed` já vão para a Home.
3. Depois da troca do DNS, envie `https://faclubrificantes.com.br/sitemap.xml` no Search Console.

### Backup semanal

O workflow `.github/workflows/backup.yml` roda toda segunda às 3h (Brasília) e pode ser disparado à mão em **Actions → Backup semanal → Run workflow**. Ele precisa de quatro segredos do repositório (**Settings → Secrets and variables → Actions**):

| Segredo | Valor |
| --- | --- |
| `SUPABASE_DB_URL` | string de conexão do **Session pooler** (Supabase → Connect), com a senha do banco; a conexão direta não funciona nos runners do GitHub, que não têm IPv6 |
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role` |
| `BACKUP_PASSPHRASE` | senha longa e aleatória que cifra o backup. Guarde uma cópia fora do GitHub (gerenciador de senhas da Onbind): sem ela o backup não abre. Sem o segredo, o job falha e nada é guardado |

Cada execução guarda um artefato `faclub-backup-<n>` por 90 dias com um único arquivo `faclub-backup-<data>.tar.gz.enc`, cifrado com AES-256. Dentro dele estão `public.sql` (estrutura e dados do site), `auth.sql` (logins do painel) e `storage/product-images/` (fotos e logos). O backup é cifrado porque tem e-mails e senhas (em hash) do painel e nomes e veículos dos pedidos, e **o repositório é público: qualquer conta do GitHub consegue baixar os artefatos**.

Se o backup falhar, o job fica vermelho e o GitHub manda e-mail para quem tem as notificações de Actions ligadas (**Settings → Notifications → Actions** de cada pessoa).

**Atenção, repositório público:** o GitHub desliga sozinho os agendamentos de um repositório público que passa 60 dias sem atividade (commits, por exemplo), e aí o backup para sem nenhum job vermelho. Duas saídas: tornar o repositório privado (**Settings → General → Danger Zone → Change visibility**), o que também tira os artefatos do alcance de qualquer um; ou conferir todo mês em **Actions → Backup semanal** que a última execução tem menos de 7 dias e, se aparecer o aviso de agendamento desativado, usar **Enable workflow**.

Para abrir um backup baixado (o `.zip` do artefato contém o `.enc`):

```bash
mkdir restaurado
BACKUP_PASSPHRASE='a senha' openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -pass env:BACKUP_PASSPHRASE -in faclub-backup-AAAA-MM-DD.tar.gz.enc | tar -xzf - -C restaurado
```

Para restaurar num projeto novo do Supabase, de dentro de `restaurado/`:

```bash
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -f public.sql
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -f auth.sql
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261028000300_storage.sql
```

O terceiro arquivo é deste repositório: ajuste o caminho até ele. Depois, envie a pasta `storage/product-images/` para o bucket `product-images`, mantendo os caminhos.

Para rodar o backup localmente: `SUPABASE_DB_URL=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup.mjs [pasta]`.
