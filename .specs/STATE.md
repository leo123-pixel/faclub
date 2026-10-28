# STATE

## Decisions

### AD-001
- **Decision**: O site é um Next.js (App Router, TypeScript) com Tailwind CSS, Supabase (Postgres, Auth, Storage) na conta do cliente e deploy na Vercel na conta da Onbind.
- **Reason**: Decisão do PRD (seção 8): mesma stack do projeto Cake 67, que a Onbind já opera; o plano gratuito do Supabase cobre o MVP.
- **Trade-off**: Fica preso ao Supabase para login, banco e imagens; o plano gratuito não tem backup diário, então o backup semanal é responsabilidade do projeto.
- **Scope**: todas as features
- **Date**: 2026-10-28
- **Status**: active

### AD-002
- **Decision**: O MVP é entregue em cinco features, nesta ordem: painel-catalogo, painel-conteudo, site-publico, carrinho-pedidos, lancamento.
- **Reason**: O cronograma do PRD põe o painel antes do site para a loja cadastrar produtos enquanto as páginas públicas são montadas; cada feature termina com uma aprovação.
- **Trade-off**: O site público só aparece na terceira entrega; até lá a loja vê apenas o painel.
- **Scope**: planejamento do MVP
- **Date**: 2026-10-28
- **Status**: active

## Handoff

- **Feature**: MVP inteiro (`.specs/features/*`)
- **Phase / Task**: Specify, aguardando respostas às perguntas Q1 a Q10 e a aprovação das specs
- **Completed**: none
- **In-progress** (file:line): none
- **Next step**: registrar as respostas nas specs (critério, Assumptions ou AD-NNN), rodar `validate_spec.py` em cada feature e pedir a aprovação de painel-catalogo
- **Blockers**: perguntas Q1 a Q10 em aberto
- **Uncommitted files**: none
- **Branch**: claude/festive-sagan-40ifio
