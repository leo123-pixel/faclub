# Painel: banners, cupom e configurações Specification

**Approved**: 2026-10-28 - user: "ok para todas as recomendações, pode seguir"

## Problem Statement

O telefone, o endereço, os horários, o cupom e a oferta da semana aparecem em várias partes do site. Se ficarem no código, qualquer mudança depende da Onbind. Esta feature dá à loja três telas no painel para trocar o banner do topo da Home, o cupom e os dados da loja; o site público lê tudo daqui.

## Goals

- [ ] A loja troca a foto e o texto do topo da Home sem ajuda (US08)
- [ ] WhatsApp, endereço, horário e links do site vêm de um só lugar (RF26)

## Out of Scope

| Feature | Reason |
| --- | --- |
| Agendar a troca do banner por data | Não pedido no PRD |
| Vários cupons ativos ao mesmo tempo no site | O PRD trata um cupom, o FACLUB10; o site mostra o primeiro ativo |
| Aplicar o cupom no carrinho | O cupom vale só para serviços na loja (PRD, Decisões) |
| Editar os seis cards de "Nossos serviços" e "Por que a FAC LUB" | Não estão no modelo de dados do PRD; ficam no código |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Quantos banners aparecem na Home | Só o banner ativo de menor `position`; sem carrossel | A captura da Home desenha um único topo | y |
| Sem banner ativo | O topo usa título, texto e foto padrão definidos no código | A Home nunca fica sem topo | y |
| Cupom exibido no site | O cupom ativo de menor `id` | Só existe o FACLUB10 no MVP | y |
| Sem cupom ativo | Os blocos de cupom da Home e da página do produto somem | Não mostrar código que não vale | y |
| Formato dos horários | Texto livre em duas linhas, "Seg a Sex" e "Sábado", cada uma com o horário | A Home mostra exatamente esses dois blocos | y |
| Valores iniciais | WhatsApp (11) 2954-5764, telefone (11) 2954-5764, contato@faclubrificantes.com.br, Rua Cabo Antônio Alves, 50, Parque Novo Mundo, São Paulo, Seg a Sex 7h às 18h, Sábado 8h às 13h | PRD (Decisões) e captura da Home | y |
| Link do grupo de ofertas e do Instagram | Começam vazios; o site esconde o botão enquanto o campo estiver vazio | Os links não estão no PRD | y |
| Mensagem pré-escrita do WhatsApp de agendamento | Configurável, padrão "Olá! Quero agendar uma troca de óleo." | US01 | y |

**Open questions:** none - all resolved or logged above (os defaults com `n` esperam a correção da loja).

---

## User Stories

### P2: Trocar o banner da Home

**User Story**: Como administrador, quero trocar a foto e o texto do topo da Home para divulgar a oferta da semana.

**Why P2**: US08 e RF23 (Should).

**Acceptance Criteria**:

1. WHEN o administrador abre "Banners e ofertas" THEN o sistema SHALL listar os banners na ordem do campo Ordem, com foto, título, interruptor "Ativo" e ordem
2. WHEN o administrador salva um banner com foto, título, texto, link e ordem THEN o sistema SHALL gravá-lo, voltar à lista com "Banner salvo." e revalidar as páginas públicas
3. IF o banner não tiver foto ou título THEN o sistema SHALL não salvar e mostrar "Campo obrigatório" abaixo de cada campo que falta
4. IF o link não começar com `/`, `https://` ou `http://` THEN o sistema SHALL não salvar e mostrar "Use um link do site (começando com /) ou um endereço completo."
5. WHEN o administrador aciona o interruptor "Ativo" de um banner THEN o sistema SHALL gravar o novo `is_active` sem recarregar a página
6. WHEN o administrador exclui um banner THEN o sistema SHALL perguntar "Excluir este banner?" e só excluir se ele confirmar
7. The foto do banner SHALL passar pela mesma redução e conversão para WebP das fotos de produto, com lado maior de até 2400 px

**Independent Test**: Trocar o título do banner ativo e salvar: a lista mostra o novo título e "Banner salvo." (o efeito na Home é provado em site-publico, HOME-01 AC 12 a 15).

---

### P2: Editar o cupom

**User Story**: Como administrador, quero editar o código, o percentual e o texto do cupom e ligar ou desligar.

**Why P2**: RF24 (Should).

**Acceptance Criteria**:

1. WHEN o administrador abre "Cupons" THEN o sistema SHALL listar os cupons com código, percentual, texto e ativo ou inativo
2. WHEN o administrador salva um cupom THEN o sistema SHALL gravar o código em maiúsculas, sem espaços
3. IF o percentual não for inteiro de 1 a 100 THEN o sistema SHALL não salvar e mostrar "Use um número de 1 a 100."
4. IF o código já existir em outro cupom THEN o sistema SHALL não salvar e mostrar "Já existe um cupom com esse código."
5. WHEN o administrador aciona o interruptor "Ativo" de um cupom THEN o sistema SHALL gravar o novo `is_active` sem recarregar a página e revalidar as páginas públicas

**Independent Test**: Desligar o FACLUB10 e recarregar: o interruptor continua desligado (o bloco sumir da Home é provado em site-publico).

---

### P1: Editar as configurações da loja ⭐ MVP

**User Story**: Como administrador, quero editar WhatsApp, telefone, e-mail, endereço, horários, link do grupo e redes para o site mostrar sempre o dado certo.

**Why P1**: RF26 (Must); o botão de agendar e o envio do pedido dependem do número de WhatsApp.

**Acceptance Criteria**:

1. WHEN o administrador abre "Configurações" THEN o sistema SHALL mostrar um formulário com WhatsApp, telefone, e-mail, endereço, horários, link do grupo, Instagram e mensagem de agendamento preenchidos com os valores atuais
2. WHEN o administrador salva THEN o sistema SHALL gravar a única linha de `settings`, mostrar "Configurações salvas." e revalidar todas as páginas públicas
3. IF o WhatsApp não tiver 10 ou 11 dígitos depois de remover espaços, parênteses e hífens THEN o sistema SHALL não salvar e mostrar "Informe o WhatsApp com DDD, por exemplo (11) 2954-5764."
4. IF o e-mail não tiver formato válido THEN o sistema SHALL não salvar e mostrar "Informe um e-mail válido."
5. IF o link do grupo ou do Instagram não começar com `https://` THEN o sistema SHALL não salvar e mostrar "Use o endereço completo, começando com https://."
6. The sistema SHALL guardar o WhatsApp só com dígitos e montar os links `https://wa.me/55<dígitos>` a partir dele
7. The banco SHALL ter no máximo uma linha em `settings`

**Independent Test**: Mudar o horário de sábado no painel e recarregar: o formulário mostra o novo horário (a Home é provada em site-publico).

---

## Edge Cases

- IF o envio da foto do banner falhar THEN o sistema SHALL manter o banner anterior e mostrar "Não foi possível enviar a foto. Tente de novo."

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| BAN-01 | P2: Trocar o banner (AC 1-7) | Tasks | Pending |
| CUP-01 | P2: Editar o cupom (AC 1-5) | Tasks | Pending |
| CONF-01 | P1: Configurações da loja (AC 1-7) | Tasks | Pending |

**Coverage:** 3 total, 0 mapped to tasks, 3 unmapped ⚠️ (tasks vêm depois da aprovação)

Os efeitos no site público ("aparece na Home em até 1 minuto", topo padrão sem banner ativo, blocos de cupom que somem, valores iniciais com `settings` vazia) ficam em site-publico, HOME-01 AC 12 a 15 e Edge Cases: só existe como prová-los quando o site existir. O painel já revalida as páginas a cada gravação.

PRD coberto aqui: RF23, RF24, RF26, US08.

---

## Sources

- `docs/referencias/PRD.md` - RF23, RF24, RF26, tabelas banners, coupons e settings
- Sem captura: o protótipo não desenha estas telas; o layout segue o padrão das telas do painel em painel-catalogo

---

## Success Criteria

- [ ] A loja troca o banner da semana sem ajuda
- [ ] Mudar o WhatsApp nas configurações muda todos os botões do site em até 1 minuto
