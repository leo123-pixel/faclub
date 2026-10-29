# Lançamento: medição, SEO técnico e backup Specification

**Approved**: 2026-10-28 - user: "ok para todas as recomendações, pode seguir"

## Problem Statement

O site atual não mede conversão, e trocar o WordPress pelo site novo pode derrubar a posição no Google. Esta feature fecha o MVP para ir ao ar: aviso de cookies antes de GA4 e Meta Pixel, os eventos de conversão do PRD, sitemap, robots, dados estruturados, redirecionamento 301 das URLs antigas e backup semanal do banco e das imagens.

## Goals

- [ ] Os 6 eventos do PRD chegam ao GA4 e ao Pixel só depois do consentimento
- [ ] Nenhuma URL antiga indexada no Google cai em 404 depois da troca
- [ ] Existe um backup do banco e das imagens com no máximo 7 dias

## Out of Scope

| Feature | Reason |
| --- | --- |
| Apontar o domínio e mexer no DNS do registro.br | Operação remota; feita pela Onbind com autorização explícita, fora do código |
| Metas numéricas dos KPIs | PRD seção 9: definidas depois do 1º mês |
| Painel de métricas dentro do site | As métricas ficam no GA4 e na tabela orders |
| Gerenciador de consentimento por categoria | O MVP tem só aceitar ou recusar |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| IDs do GA4 e do Pixel | Variáveis de ambiente `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID`; sem valor, o script não carrega | Os IDs ainda não existem no PRD | y |
| Escolha de cookies | Botões "Aceitar" e "Recusar"; a escolha vale 180 dias | LGPD pede escolha antes de GA4 e Pixel | y |
| Lista de URLs antigas | Levantada do sitemap do WordPress e do Search Console antes do lançamento; cada uma vai para a página nova equivalente ou para a Home | O ambiente de desenvolvimento não acessa o site atual; a lista é um fato a buscar, não uma decisão | y |
| Onde roda o backup | GitHub Actions toda segunda às 3h (horário de Brasília): `pg_dump` do banco e cópia do bucket `product-images`, guardados como artefato por 90 dias | PRD seção 8; o plano gratuito do Supabase não tem backup diário | y |
| Dados estruturados | `LocalBusiness` (AutoRepair) na Home e `Product` com `Offer` em BRL em cada produto | PRD seção 8 | y |

**Open questions:** none - all resolved or logged above (os defaults com `n` esperam a correção da loja e da Onbind).

---

## User Stories

### P1: Aviso de cookies e medição ⭐ MVP

**User Story**: Como loja, quero medir agendamentos, pedidos e cupom sem desrespeitar a LGPD.

**Why P1**: RF10 e a Medição do PRD seção 8 (Must).

**Acceptance Criteria**:

1. WHEN o visitante abre o site pela primeira vez THEN o sistema SHALL mostrar o aviso de cookies com "Aceitar", "Recusar" e o link "Política de privacidade"
2. WHILE o visitante não aceitou os cookies o sistema SHALL não carregar os scripts do GA4 nem do Meta Pixel
3. WHEN o visitante usa "Aceitar" THEN o sistema SHALL carregar GA4 e Pixel e esconder o aviso por 180 dias
4. WHEN o visitante usa "Recusar" THEN o sistema SHALL esconder o aviso por 180 dias sem carregar GA4 nem Pixel
5. WHILE os cookies estão aceitos, WHEN o visitante abre uma página de produto THEN o sistema SHALL enviar `view_item` com id, nome, marca e preço
6. WHILE os cookies estão aceitos, WHEN o visitante adiciona ao carrinho THEN o sistema SHALL enviar `add_to_cart` com id, embalagem, quantidade e preço
7. WHILE os cookies estão aceitos, WHEN o visitante envia o pedido THEN o sistema SHALL enviar `send_order_whatsapp` com número de itens e total estimado
8. WHILE os cookies estão aceitos, WHEN o visitante usa qualquer botão que abre o WhatsApp fora do envio do pedido THEN o sistema SHALL enviar `click_whatsapp` com o local do botão
9. WHILE os cookies estão aceitos, WHEN o visitante copia o cupom THEN o sistema SHALL enviar `copy_coupon`
10. WHILE os cookies estão aceitos, WHEN o visitante usa "Entrar no grupo de ofertas" THEN o sistema SHALL enviar `join_group`
11. The rodapé SHALL ter o link "Preferências de cookies" que mostra o aviso de novo

**Independent Test**: Recusar os cookies e conferir na aba de rede que nenhum pedido vai para o Google ou a Meta; aceitar e ver `view_item` no DebugView do GA4.

---

### P1: Recusar depois de aceitar

**User Story**: Como visitante, quero que recusar os cookies pare a medição na hora, mesmo depois de ter aceitado.

**Why P1**: Achado do Verifier em 2026-10-29: depois de "Aceitar", usar "Preferências de cookies" e "Recusar" só gravava a escolha; GA4 e Pixel seguiam medindo a navegação até recarregar, e os cookies deles ficavam (LGPD).

**Acceptance Criteria**:

1. WHEN o visitante que aceitou os cookies usa "Recusar" THEN o sistema SHALL parar o GA4 e o Pixel na mesma visita, sem nenhum pedido a eles nas páginas seguintes, e apagar os cookies deles (`_ga`, `_ga_*`, `_gid`, `_gat*`, `_gcl_*`, `_fbp`, `_fbc`)

**Independent Test**: Aceitar, abrir "Preferências de cookies", recusar e navegar: a aba de rede não mostra pedidos ao Google nem à Meta e os cookies `_ga` e `_fbp` somem.

---

### P1: Sitemap, robots e dados estruturados ⭐ MVP

**User Story**: Como loja, quero que o Google encontre e entenda as páginas novas.

**Why P1**: PRD seção 8, SEO (Must).

**Acceptance Criteria**:

1. WHEN alguém abre `/sitemap.xml` THEN o sistema SHALL listar a Home, o catálogo, a política e todos os produtos visíveis com a data da última alteração
2. The sitemap SHALL deixar de fora os produtos ocultos e qualquer rota sob `/admin`
3. WHEN alguém abre `/robots.txt` THEN o sistema SHALL permitir tudo, bloquear `/admin` e `/carrinho` e apontar o sitemap
4. The Home SHALL ter JSON-LD `LocalBusiness` com nome, endereço, telefone e horários vindos das configurações
5. The página de cada produto SHALL ter JSON-LD `Product` com nome, marca, imagem, SKU e `Offer` com preço em BRL e disponibilidade

**Independent Test**: Passar a Home e um produto no Teste de pesquisa aprimorada do Google sem erros.

---

### P1: Redirecionar as URLs antigas ⭐ MVP

**User Story**: Como loja, quero que os links antigos do WordPress levem à página nova certa.

**Why P1**: PRD, Riscos: queda de posição no Google.

**Acceptance Criteria**:

1. WHEN alguém abre uma URL da lista de URLs antigas THEN o sistema SHALL responder 301 para a página nova mapeada
2. WHEN alguém abre uma URL antiga sob `/wp-content/`, `/wp-admin/` ou `/feed/` que não está na lista THEN o sistema SHALL responder 301 para a Home
3. The lista de redirecionamentos SHALL ficar num arquivo versionado no repositório, com um teste que confere cada par

**Independent Test**: `curl -I` em cada URL antiga da lista devolve 301 com o destino certo.

---

### P2: Backup semanal

**User Story**: Como Onbind, quero um backup semanal do banco e das imagens para recuperar o site se algo der errado.

**Why P2**: PRD seção 8, Backup.

**Acceptance Criteria**:

1. WHEN chega segunda-feira às 3h no horário de Brasília THEN o job de backup SHALL exportar o banco com `pg_dump` e copiar o bucket `product-images`
2. IF o job falhar THEN o GitHub SHALL avisar por e-mail a conta dona do repositório
3. The backup SHALL ficar guardado por 90 dias

**Independent Test**: Rodar o job à mão e restaurar o dump num Supabase local.

---

### P2: Backup cifrado

**User Story**: Como Onbind, quero que só quem tem a senha consiga ler o backup.

**Why P2**: Achado do Verifier em 2026-10-29: o repositório é público, e o artefato do Actions com logins do painel e nomes dos pedidos podia ser baixado por qualquer conta do GitHub.

**Acceptance Criteria**:

1. The backup guardado no GitHub SHALL ser um único arquivo cifrado com a senha do segredo `BACKUP_PASSPHRASE`, que o comando do README abre; IF o segredo faltar THEN o job SHALL falhar sem guardar nada

**Independent Test**: Baixar o artefato, ver que não abre sem a senha e abrir com o comando do README.

---

## Edge Cases

- IF `NEXT_PUBLIC_GA4_ID` ou `NEXT_PUBLIC_META_PIXEL_ID` estiverem vazios THEN o sistema SHALL seguir sem erro e sem carregar o script correspondente
- IF o armazenamento local estiver bloqueado THEN o aviso de cookies SHALL aparecer em toda visita e nada SHALL ser carregado sem o aceite

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CONS-01 | P1: Aviso de cookies e medição (AC 1-11) | Design | Pending |
| CONS-02 | P1: Recusar depois de aceitar (AC 1) | Execute | Pending |
| SITEMAP-01 | P1: Sitemap, robots e dados estruturados (AC 1-5) | Tasks | Pending |
| REDIR-01 | P1: Redirecionar as URLs antigas (AC 1-3) | Tasks | Pending |
| BKP-01 | P2: Backup semanal (AC 1-3) | Tasks | Pending |
| BKP-02 | P2: Backup cifrado (AC 1) | Execute | Pending |

**Coverage:** 4 total, 0 mapped to tasks, 4 unmapped ⚠️ (tasks vêm depois da aprovação)

CONS-02 e BKP-02 entraram depois do Verifier (2026-10-29) e são provados por C23 e C24.

PRD coberto aqui: RF10 (aviso de cookies), seção 8 (SEO, LGPD, Medição, Backup).

---

## Sources

- `docs/referencias/PRD.md` - seção 8 (SEO, LGPD, Medição, Backup), seção 9 (KPIs), Riscos
- Sem captura: o protótipo não desenha o aviso de cookies

---

## Success Criteria

- [ ] Os 6 eventos aparecem no DebugView do GA4 com cookies aceitos e nenhum com cookies recusados
- [ ] Zero URLs antigas em 404 no Search Console 30 dias depois do lançamento
