import type { Atleta, Ratings } from '@/entities/athlete';

export type ClassificacaoIda =
  | 'Elite'
  | 'Alto Potencial'
  | 'Em Desenvolvimento'
  | 'Necessita Desenvolvimento'
  | 'Acompanhamento Intensivo';

const media = (valores: Record<string, number>): number => {
  const vals = Object.values(valores);
  if (vals.length === 0) return 0;
  return vals.reduce((acc, v) => acc + v, 0) / vals.length;
};

export function mediaTecnica(ratings: Ratings): number {
  return media(ratings.tecnica);
}

export function mediaFisica(ratings: Ratings): number {
  return media(ratings.fisica);
}

export function mediaTatica(ratings: Ratings): number {
  return media(ratings.tatica);
}

export function mediaPsico(ratings: Ratings): number {
  return media(ratings.psico);
}

export function mediaGeral(ratings: Ratings): number {
  return (
    (mediaTecnica(ratings) + mediaFisica(ratings) + mediaTatica(ratings) + mediaPsico(ratings)) / 4
  );
}

/** IDA = Índice de Desenvolvimento do Atleta */
export function calcularIda(ratings: Ratings): number {
  return (
    mediaTecnica(ratings) * 0.35 +
    mediaFisica(ratings) * 0.3 +
    mediaTatica(ratings) * 0.2 +
    mediaPsico(ratings) * 0.15
  );
}

export function classificarIda(ida: number): ClassificacaoIda {
  if (ida >= 9) return 'Elite';
  if (ida >= 8) return 'Alto Potencial';
  if (ida >= 7) return 'Em Desenvolvimento';
  if (ida >= 6) return 'Necessita Desenvolvimento';
  return 'Acompanhamento Intensivo';
}

/** Delta entre as duas últimas médias do histórico do atleta. */
export function calcularTendencia(historico: { media: number }[]): number {
  if (historico.length < 2) return 0;
  const ultimo = historico[historico.length - 1].media;
  const penultimo = historico[historico.length - 2].media;
  return ultimo - penultimo;
}

export interface Indicador {
  label: string;
  emoji: string;
}

export function calcularIndicador(atleta: Atleta): Indicador {
  const ida = calcularIda(atleta.ratings);
  const tendencia = calcularTendencia(atleta.historico);

  if (atleta.status === 'Lesionado') return { label: 'Lesionado', emoji: '🏥' };
  if (tendencia > 0.25) return { label: 'Evoluindo', emoji: '🔥' };
  if (tendencia < -0.25) return { label: 'Em queda', emoji: '📉' };
  if (ida >= 8.5) return { label: 'Alto Potencial', emoji: '⭐' };
  if (tendencia > 0.05) return { label: 'Melhorando', emoji: '📈' };
  return { label: 'Regular', emoji: '⚡' };
}

export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  return idade;
}

export function calcularImc(pesoKg: number, alturaCm: number): number {
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
}

/**
 * "Soma" uma nova nota (0-10) à média atual de um atributo/dimensão como média acumulada:
 * a nota entra como mais um dado no histórico, ponderada por quantas avaliações já existem.
 * Uma avaliação isolada pesa menos quanto mais histórico o atleta já tem — evita saltos bruscos
 * de uma única avaliação e mantém o resultado sempre dentro de 0-10 (é uma combinação convexa).
 */
export function calcularMediaAcumulada(atual: number, nova: number, n: number): number {
  return (atual * n + nova) / (n + 1);
}
