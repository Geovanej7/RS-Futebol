import type { PerfilAcesso } from '@/entities/athlete';

export type Modulo =
  | 'dashboard'
  | 'atletas'
  | 'avaliacoes'
  | 'treinos'
  | 'comparativos'
  | 'ranking'
  | 'relatorios'
  | 'scout'
  | 'alertas'
  | 'configuracoes';

export type NivelAcesso = 'nenhum' | 'leitura' | 'escrita';

export const MODULOS: { modulo: Modulo; label: string }[] = [
  { modulo: 'dashboard', label: 'Dashboard' },
  { modulo: 'atletas', label: 'Atletas' },
  { modulo: 'avaliacoes', label: 'Avaliações' },
  { modulo: 'treinos', label: 'Treinos' },
  { modulo: 'comparativos', label: 'Comparativos' },
  { modulo: 'ranking', label: 'Ranking' },
  { modulo: 'relatorios', label: 'Relatórios' },
  { modulo: 'scout', label: 'Scout' },
  { modulo: 'alertas', label: 'Alertas' },
  { modulo: 'configuracoes', label: 'Configurações' },
];

const NIVEIS: NivelAcesso[] = ['nenhum', 'leitura', 'escrita'];

/** Matriz padrão de acesso por perfil — ver CREDENCIAIS.md para a tabela documentada. */
export const DEFAULT_PERMISSOES: Record<PerfilAcesso, Record<Modulo, NivelAcesso>> = {
  Administrador: {
    dashboard: 'escrita',
    atletas: 'escrita',
    avaliacoes: 'escrita',
    treinos: 'escrita',
    comparativos: 'escrita',
    ranking: 'escrita',
    relatorios: 'escrita',
    scout: 'escrita',
    alertas: 'escrita',
    configuracoes: 'escrita',
  },
  'Coordenador Técnico': {
    dashboard: 'leitura',
    atletas: 'escrita',
    avaliacoes: 'escrita',
    treinos: 'escrita',
    comparativos: 'escrita',
    ranking: 'leitura',
    relatorios: 'leitura',
    scout: 'escrita',
    alertas: 'leitura',
    configuracoes: 'nenhum',
  },
  Treinador: {
    dashboard: 'leitura',
    atletas: 'escrita',
    avaliacoes: 'escrita',
    treinos: 'escrita',
    comparativos: 'leitura',
    ranking: 'leitura',
    relatorios: 'nenhum',
    scout: 'nenhum',
    alertas: 'leitura',
    configuracoes: 'nenhum',
  },
  'Preparador Físico': {
    dashboard: 'leitura',
    atletas: 'escrita',
    avaliacoes: 'leitura',
    treinos: 'escrita',
    comparativos: 'leitura',
    ranking: 'leitura',
    relatorios: 'nenhum',
    scout: 'nenhum',
    alertas: 'leitura',
    configuracoes: 'nenhum',
  },
  'Analista de Desempenho': {
    dashboard: 'leitura',
    atletas: 'leitura',
    avaliacoes: 'escrita',
    treinos: 'leitura',
    comparativos: 'escrita',
    ranking: 'leitura',
    relatorios: 'escrita',
    scout: 'leitura',
    alertas: 'leitura',
    configuracoes: 'nenhum',
  },
  Scout: {
    dashboard: 'leitura',
    atletas: 'leitura',
    avaliacoes: 'nenhum',
    treinos: 'nenhum',
    comparativos: 'nenhum',
    ranking: 'nenhum',
    relatorios: 'nenhum',
    scout: 'leitura',
    alertas: 'leitura',
    configuracoes: 'nenhum',
  },
};

/** Quem pode editar cada aba de avaliação no perfil do atleta (granularidade fina dentro de "atletas"). */
export const RATING_GROUP_WRITE_ACCESS: Record<'tecnica' | 'fisica' | 'tatica' | 'psico', PerfilAcesso[]> = {
  tecnica: ['Administrador', 'Coordenador Técnico', 'Treinador'],
  fisica: ['Administrador', 'Coordenador Técnico', 'Preparador Físico'],
  tatica: ['Administrador', 'Coordenador Técnico', 'Treinador'],
  psico: ['Administrador', 'Coordenador Técnico', 'Analista de Desempenho'],
};

const NIVEL_ORDER: Record<NivelAcesso, number> = { nenhum: 0, leitura: 1, escrita: 2 };

export function hasAccess(
  permissoes: Record<PerfilAcesso, Record<Modulo, NivelAcesso>>,
  perfil: PerfilAcesso,
  modulo: Modulo,
  nivelMinimo: NivelAcesso = 'leitura',
): boolean {
  return NIVEL_ORDER[permissoes[perfil][modulo]] >= NIVEL_ORDER[nivelMinimo];
}

export function podeEditarGrupo(grupo: keyof typeof RATING_GROUP_WRITE_ACCESS, perfil: PerfilAcesso): boolean {
  return RATING_GROUP_WRITE_ACCESS[grupo].includes(perfil);
}

export { NIVEIS };
