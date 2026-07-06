# Contas de demonstração — Base Intelligence Platform

Estas credenciais são **fictícias, apenas para desenvolvimento** (autenticadas via mock MSW). Não representam usuários reais e não devem ser usadas em produção.

O perfil de cada conta define o que ela pode acessar na plataforma (RBAC) — veja a matriz de permissões em **Configurações** (editável apenas pelo perfil Administrador).

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@basefc.com` | `admin123` |
| Coordenador Técnico | `coordenador@basefc.com` | `coord123` |
| Treinador | `treinador@basefc.com` | `treino123` |
| Preparador Físico | `preparador@basefc.com` | `prep123` |
| Analista de Desempenho | `analista@basefc.com` | `analise123` |
| Scout | `scout@basefc.com` | `scout123` |

## Permissões padrão por perfil

| Módulo | Admin | Coordenador | Treinador | Preparador Físico | Analista | Scout |
|---|---|---|---|---|---|---|
| Dashboard | escrita | leitura | leitura | leitura | leitura | leitura |
| Atletas | escrita | escrita | escrita | escrita¹ | leitura | leitura |
| Avaliações | escrita | escrita | escrita | leitura | escrita | nenhum |
| Treinos | escrita | escrita | escrita | escrita | leitura | nenhum |
| Comparativos | escrita | escrita | leitura | leitura | escrita | nenhum |
| Ranking | escrita | leitura | leitura | leitura | leitura | nenhum |
| Relatórios | escrita | leitura | nenhum | nenhum | escrita | nenhum |
| Scout | escrita | escrita | nenhum | nenhum | leitura | leitura |
| Alertas | escrita | leitura | leitura | leitura | leitura | leitura |
| Configurações | escrita | nenhum | nenhum | nenhum | nenhum | nenhum |

¹ Preparador Físico só edita a aba **Física** no perfil do atleta; as demais abas (Técnica, Tática, Psicológica) ficam somente leitura para esse perfil.

A matriz acima é o padrão de fábrica — o Administrador pode ajustá-la a qualquer momento na tela **Configurações**, e a mudança passa a valer imediatamente para todos os perfis.
