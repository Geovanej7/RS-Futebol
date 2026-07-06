# RS Futebol Club

Plataforma de inteligência esportiva do RS Futebol Club, focada na gestão e avaliação de atletas das categorias de base (Sub-11 a Sub-20). Reconstrução em React/TypeScript de um protótipo estático original, agora componentizada, tipada, com RBAC de fato e dados mockados via API simulada (MSW).

> **Estado do projeto:** frontend completo com backend simulado (MSW). Não há servidor real — os dados cadastrados em runtime vivem em memória no navegador e são reiniciados a cada reload da página (sessão, tema e permissões persistem via `localStorage`).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Build | Vite |
| Linguagem | TypeScript |
| Roteamento | React Router v7 |
| Estado do servidor | TanStack Query |
| Estado global de UI/auth | Zustand (com persistência em `localStorage`) |
| Estilização | Tailwind CSS v4 (tokens customizados, tema dark) |
| Componentes acessíveis | Radix UI (Dialog, Tabs) |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Ícones | lucide-react |
| Notificações | sonner |
| Datas | date-fns (locale pt-BR) |
| Exportação | jsPDF + jspdf-autotable (PDF), SheetJS/xlsx (Excel) |
| Mock de API | MSW (Mock Service Worker) |

## Rodando o projeto

```bash
npm install
npm run dev       # servidor de desenvolvimento (http://localhost:5173)
npm run build     # typecheck + build de produção
npm run preview   # servir o build de produção localmente
npm run lint      # oxlint
```

Não é necessário nenhum backend: o MSW intercepta as chamadas `/api/*` no navegador e responde com dados mockados (ver [Camada de dados](#camada-de-dados-mock)).

## Login e contas de demonstração

A autenticação é obrigatória para acessar qualquer rota além de `/login`. Existem **6 contas fixas**, uma por perfil de acesso — a lista completa de e-mails/senhas está em **[CREDENCIAIS.md](CREDENCIAIS.md)**.

O perfil da conta autenticada determina o que ela pode ver e editar em toda a aplicação (RBAC — veja a seção [Permissões](#permissões-rbac) abaixo).

---

## Funcionalidades

### Layout e navegação
- Mobile-first: navegação inferior fixa (bottom nav) + drawer de menu em telas pequenas; sidebar fixa em desktop (`lg:`).
- Header com busca global (redireciona para Atletas já filtrado por nome), alternância de tema dark/light e atalho de exportação.
- Menu (sidebar/bottom-nav) mostra apenas os módulos que o perfil logado tem permissão de acessar.
- Rotas protegidas por autenticação e, individualmente, por permissão de módulo (`RequireModule`) — acesso negado exibe uma tela "Acesso restrito" em vez de redirecionar silenciosamente.

### Dashboard
- KPIs: total de atletas, média geral, IDA médio, destaque do mês.
- Filtro por categoria (Sub-11 a Sub-20).
- Gráfico de evolução da média geral (últimos 6 meses) e distribuição de atletas por faixa de IDA.
- Listas de atletas em evolução / em queda / últimas avaliações, com atalho para abrir o perfil.
- Exportação do relatório executivo em PDF direto do Dashboard.

### Atletas
- Listagem em **lista** (padrão) ou em **cards** (segunda opção, com o visual de "carta de jogador" e raridade), alternável por um toggle — com busca por nome, filtros por categoria/posição/status/raridade e ordenação (IDA, nome, idade, média), com foto do atleta (ou iniciais como fallback).
- Cadastro de **novo atleta** via formulário validado (nome, nascimento, categoria, posição, pé dominante, altura, peso, cidade, escola, responsável, contato, **foto**) — atleta entra com avaliação baseline e já pode ser aberto no perfil. A foto é enviada por upload (preview imediato) e guardada como data URL, já que não há backend real para armazenar arquivos.
- Exportação da base completa em Excel (`.xlsx`).
- Ambas as ações (cadastrar/exportar) respeitam a permissão do perfil logado.

### Perfil do atleta (drawer)
Drawer lateral com 7 abas:
1. **Perfil** — cabeçalho com foto do atleta, **card imersivo estilo "carta de jogador"** (tilt 3D, verso com atributos detalhados, tipografia de assinatura Kanit/Barlow Condensed) com **sistema de raridade** derivado automaticamente do IDA/tendência (Base / Prata / Ouro / Em Alta / Elite — nunca escolhido manualmente), radar de atributos, KPIs por dimensão, evolução histórica e mapa conceitual de zona de atuação.
2. **Técnica**, **3. Física**, **4. Tática**, **5. Psicológica** — sliders editáveis por atributo com botão de salvar; a edição é persistida de fato (grava no "banco" mockado e atualiza o histórico do atleta). Cada aba só é editável para os perfis com permissão de escrita naquele grupo específico (ver RBAC); sem permissão, os sliders ficam bloqueados com aviso.
6. **Médica** — histórico de lesões/afastamentos.
7. **Timeline** — linha do tempo cronológica combinando entrada no clube, avaliações e lesões.

Sempre que uma avaliação faz o atleta cruzar um limiar de raridade, uma animação de celebração (`RarityUpCelebration`) é exibida — respeita `prefers-reduced-motion`, caindo para um toast simples quando o usuário prefere menos movimento.

### Avaliações
- Notas em escala **0–10** por dimensão (Técnica/Física/Tática/Psicológica). Listagem cronológica com busca por nome do atleta e paginação — cards empilhados no mobile, tabela densa no desktop.
- **Nova avaliação**: formulário com 1 slider por dimensão (Técnica/Física/Tática/Psicológica), restrito por permissão de grupo (ex.: Preparador Físico só edita Física). A nota informada **não substitui** o valor atual do atleta — ela é combinada via **média acumulada**, ponderada pela quantidade de avaliações que o atleta já tem (`(atual × n + nova) / (n + 1)`), aplicada a cada atributo individual da dimensão. Isso evita saltos bruscos de uma única avaliação e faz o peso de cada nova nota diminuir à medida que o histórico do atleta cresce.
- Botão "Nova avaliação" visível apenas para perfis com escrita no módulo Avaliações.

### Treinos
- KPIs (sessões/mês, frequência média, carga média RPE, horas/atleta) e gráfico de carga (RPE) vs. recuperação nas últimas 8 semanas, a partir de sessões de treino mockadas com presença por atleta.

### Comparativos
- Comparação simultânea de 2 a 4 atletas: cards imersivos lado a lado, radar comparativo (Técnica/Física/Tática/Psicológica/IDA) e gráfico de barras com atributos detalhados. Não permite selecionar o mesmo atleta em dois slots.

### Ranking
- 6 rankings Top 10 lado a lado (Velocidade, Técnica, Físico, Maior Evolução, Média Geral, IDA), com atalho para abrir o perfil do atleta.

### Relatórios
- **Relatório Executivo** (PDF real via jsPDF): KPIs gerais + tabela dos top 10 atletas por IDA.
- **Base de Dados** (Excel real via SheetJS): uma linha por atleta com todas as médias e classificação.
- **Backup** (JSON real): exporta atletas, avaliações e sessões de treino; a importação valida o arquivo com Zod, mostra uma pré-visualização (contagens + exemplos) e só aplica ao cache local após confirmação.
- Exportar exige apenas leitura no módulo; importar exige permissão de escrita.

### Scout
- Busca por nome e filtros por categoria/posição sobre todos os atletas (não só os já observados).
- Múltiplas observações por atleta (autor + data), com formulário para adicionar novas notas — restrito a perfis com escrita em Scout.

### Alertas
- Gerados automaticamente a partir de regras de negócio: queda de desempenho, status de lesão, e destaque de alto IDA. Contagem exibida como badge no menu.

### Configurações
- Preferências gerais (nome da plataforma, categoria padrão) — editáveis apenas pelo Administrador.
- **Matriz de permissões** (perfil × módulo, com níveis Nenhum/Leitura/Escrita), editável em tempo real apenas pelo Administrador — qualquer mudança reflete imediatamente na navegação, nas rotas e nas abas de avaliação de todo o app, sem precisar de reload.

---

## Permissões (RBAC)

Cada perfil tem um nível de acesso (nenhum / leitura / escrita) por módulo, com um refinamento adicional dentro do perfil do atleta: cada aba de avaliação (Técnica/Física/Tática/Psicológica) só é editável pelos perfis relevantes (ex.: Preparador Físico edita Física, mas vê as demais abas apenas como leitura).

A matriz padrão de fábrica está documentada em **[CREDENCIAIS.md](CREDENCIAIS.md)**. O Administrador pode ajustá-la a qualquer momento na tela de Configurações; a alteração é persistida no navegador e vale para todos os logins seguintes.

---

## Camada de dados (mock)

Não existe backend real. Toda a "API" é simulada com **MSW**, que intercepta chamadas `fetch` a `/api/*` no navegador:

- `src/mocks/seed.ts` — gera os dados iniciais (42 atletas, avaliações, sessões de treino) de forma **determinística** (PRNG com seed fixa), então os dados são os mesmos a cada reload, mas realistas e variados. Cada atleta recebe uma foto mockada (fotos reais de pessoas, via `randomuser.me`) — requer internet para carregar; sem conexão, o `Avatar` cai automaticamente para as iniciais do nome.
- `src/mocks/db.ts` — banco mutável em memória: cadastro de atleta, avaliações e notas de scout são de fato persistidos aqui enquanto a aba do navegador estiver aberta (não sobrevive a um reload completo).
- `src/mocks/handlers.ts` — define os endpoints simulados (`/api/athletes`, `/api/evaluations`, `/api/trainings`, `/api/auth/login`, etc.).

## Estrutura de pastas

```
src/
├── app/            # bootstrap, providers (React Query, tema), rotas
├── components/
│   ├── layout/     # Sidebar, Header, BottomNav, AppShell
│   └── ui/         # design system (Badge, KpiCard, Avatar, Skeleton, Slider...)
├── entities/       # tipos de domínio (Atleta, Avaliacao, SessaoTreino, Usuario...)
├── features/       # uma pasta por módulo/tela (dashboard, athletes, scout, settings...)
├── hooks/          # hooks de dados (useAthletes, useTrainings, useAlerts...)
├── lib/            # cálculos de negócio, permissões, exportação, api client
├── mocks/          # seed determinística + handlers MSW + "banco" mutável
└── store/          # Zustand (auth, ui, permissões, configurações)
```

## Cálculos de negócio

Centralizados em `src/lib/calculations.ts`:

- **IDA (Índice de Desenvolvimento do Atleta)** = média técnica × 0.35 + média física × 0.30 + média tática × 0.20 + média psicológica × 0.15. Todas as notas em escala **0–10**.
- Classificação por IDA: Elite (≥9) / Alto Potencial (≥8) / Em Desenvolvimento (≥7) / Necessita Desenvolvimento (≥6) / Acompanhamento Intensivo (<6).
- Indicador dinâmico de status (🏥 lesionado, 🔥 evoluindo, 📉 em queda, ⭐ alto potencial, 📈 melhorando, ⚡ regular) baseado em status, tendência histórica e IDA.
- **Raridade do card** (Base/Prata/Ouro/Em Alta/Elite, `src/lib/rarity.ts`) — derivada do IDA e da tendência histórica, nunca escolhida manualmente.
- **Média acumulada** (`calcularMediaAcumulada`) — usada ao criar uma nova avaliação: combina a nota informada com a média atual do atleta, ponderada pela quantidade de avaliações já registradas, em vez de sobrescrever o valor.

## Limitações conhecidas / próximos passos

- Sem testes automatizados (Vitest/Playwright) — cobertura foi validada manualmente a cada rodada de desenvolvimento.
- Sem backend real: dados cadastrados (novo atleta, notas de scout, avaliações) não sobrevivem a um reload completo da página.
- `xlsx` (SheetJS, usado só para **gerar** planilhas) tem uma vulnerabilidade conhecida sem correção no pacote do registro npm — como o uso aqui é somente de escrita (não há parsing de `.xlsx` de terceiros), o risco prático é baixo, mas vale reavaliar se a função de importação de Excel for adicionada no futuro.
- i18n, acessibilidade AA completa e observabilidade (Sentry) ainda não implementados — a estrutura de componentes já isola strings o suficiente para uma adoção futura sem grandes refatorações.
