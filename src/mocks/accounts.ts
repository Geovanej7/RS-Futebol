import type { PerfilAcesso } from '@/entities/athlete';

export interface DemoAccount {
  email: string;
  senha: string;
  nome: string;
  perfil: PerfilAcesso;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: 'admin@basefc.com', senha: 'admin123', nome: 'Marina Costa', perfil: 'Administrador' },
  { email: 'coordenador@basefc.com', senha: 'coord123', nome: 'Ricardo Alves', perfil: 'Coordenador Técnico' },
  { email: 'treinador@basefc.com', senha: 'treino123', nome: 'Fábio Nunes', perfil: 'Treinador' },
  { email: 'preparador@basefc.com', senha: 'prep123', nome: 'Camila Duarte', perfil: 'Preparador Físico' },
  { email: 'analista@basefc.com', senha: 'analise123', nome: 'Bruno Tavares', perfil: 'Analista de Desempenho' },
  { email: 'scout@basefc.com', senha: 'scout123', nome: 'Larissa Freitas', perfil: 'Scout' },
];
