export type Posicao = 'Goleiro' | 'Zagueiro' | 'Lateral' | 'Volante' | 'Meia' | 'Atacante';
export type Categoria = 'Sub-11' | 'Sub-13' | 'Sub-15' | 'Sub-17' | 'Sub-20';
export type StatusAtleta = 'Ativo' | 'Lesionado' | 'Em observação' | 'Dispensado';
export type PeDominante = 'Direito' | 'Esquerdo' | 'Ambidestro';

export const CATEGORIAS: Categoria[] = ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Sub-20'];
export const POSICOES: Posicao[] = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];
export const STATUS_ATLETA: StatusAtleta[] = ['Ativo', 'Lesionado', 'Em observação', 'Dispensado'];

export const ATRIBUTOS_TECNICA = [
  'Passe',
  'Finalização',
  'Chute',
  'Cabeceio',
  'Domínio',
  'Drible',
  'Primeiro toque',
  'Cruzamento',
  'Visão de jogo',
  'Marcação',
  'Desarme',
  'Posicionamento',
  'Tomada de decisão',
  'Criatividade',
] as const;

export const ATRIBUTOS_FISICA = [
  'Velocidade',
  'Aceleração',
  'Resistência',
  'Explosão',
  'Força',
  'Impulsão',
  'Agilidade',
  'Mobilidade',
  'Equilíbrio',
  'Coordenação',
] as const;

export const ATRIBUTOS_TATICA = [
  'Leitura de jogo',
  'Cobertura',
  'Compactação',
  'Movimentação',
  'Pressão',
  'Inteligência tática',
] as const;

export const ATRIBUTOS_PSICO = [
  'Concentração',
  'Liderança',
  'Disciplina',
  'Resiliência',
  'Competitividade',
  'Comunicação',
  'Confiança',
  'Controle emocional',
] as const;

export interface Ratings {
  tecnica: Record<string, number>;
  fisica: Record<string, number>;
  tatica: Record<string, number>;
  psico: Record<string, number>;
}

export interface HistoricoPonto {
  data: string; // ISO date
  media: number;
}

export interface RegistroMedico {
  id: string;
  data: string;
  tipo: string;
  diasAfastado: number;
  retorno: string;
  limitacoes: string;
  observacao: string;
}

export interface Atleta {
  id: string;
  nome: string;
  categoria: Categoria;
  posicao: Posicao;
  peDominante: PeDominante;
  dataNascimento: string;
  altura: number;
  peso: number;
  cidade: string;
  escola: string;
  responsavel: string;
  contato: string;
  status: StatusAtleta;
  dataEntradaClube: string;
  observacoes: string;
  ratings: Ratings;
  historico: HistoricoPonto[];
  registrosMedicos: RegistroMedico[];
  notasScout: { id: string; data: string; autor: string; texto: string }[];
  avatarUrl?: string;
}

export interface Avaliacao {
  id: string;
  data: string;
  atletaId: string;
  avaliador: string;
  mediaTecnica: number;
  mediaFisica: number;
  mediaTatica: number;
  mediaPsico: number;
}

export type PerfilAcesso =
  | 'Administrador'
  | 'Coordenador Técnico'
  | 'Treinador'
  | 'Preparador Físico'
  | 'Analista de Desempenho'
  | 'Scout';

export const PERFIS_ACESSO: PerfilAcesso[] = [
  'Administrador',
  'Coordenador Técnico',
  'Treinador',
  'Preparador Físico',
  'Analista de Desempenho',
  'Scout',
];

export interface Usuario {
  nome: string;
  email: string;
  perfil: PerfilAcesso;
}

export type TipoTreino = 'Técnico' | 'Físico' | 'Tático' | 'Jogo-treino';

export interface PresencaTreino {
  atletaId: string;
  presente: boolean;
  rpe: number;
  recuperacao: number;
}

export interface SessaoTreino {
  id: string;
  data: string;
  tipo: TipoTreino;
  duracaoMinutos: number;
  presencas: PresencaTreino[];
}
