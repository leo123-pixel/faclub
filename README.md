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

O workflow `.github/workflows/backup.yml` roda toda segunda às 3h (Brasília) e pode ser disparado à mão em **Actions → Backup semanal → Run workflow**. Ele precisa de três segredos do repositório (**Settings → Secrets and variables → Actions**):

| Segredo | Valor |
| --- | --- |
| `SUPABASE_DB_URL` | string de conexão do **Session pooler** (Supabase → Connect), com a senha do banco; a conexão direta não funciona nos runners do GitHub, que não têm IPv6 |
| `SUPABASE_URL` | URL do projeto |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role` |

Cada execução guarda um artefato `faclub-backup-<n>` por 90 dias, com `public.sql` (estrutura e dados do site), `auth.sql` (logins do painel) e `storage/product-images/` (fotos e logos). O artefato tem nomes e veículos dos pedidos: só quem tem acesso ao repositório consegue baixá-lo. Se o backup falhar, o job fica vermelho e o GitHub manda e-mail para quem tem as notificações de Actions ligadas (**Settings → Notifications → Actions** de cada pessoa).

Para restaurar num projeto novo do Supabase:

```bash
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -f public.sql
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -f auth.sql
psql "$NOVO_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261028000300_storage.sql
```

Depois, envie a pasta `storage/product-images/` para o bucket `product-images`, mantendo os caminhos.

Para rodar o backup localmente: `SUPABASE_DB_URL=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backup.mjs [pasta]`.
