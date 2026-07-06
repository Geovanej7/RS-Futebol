import type { Atleta } from '@/entities/athlete';
import { calcularIda, calcularTendencia } from '@/lib/calculations';

export type Raridade = 'Base' | 'Prata' | 'Ouro' | 'Em Alta' | 'Elite';

export interface RaridadeConfig {
  raridade: Raridade;
  /** Stops do gradiente de material do card, do canto superior ao inferior. */
  gradiente: [string, string];
  /** Cor da borda/moldura. */
  borda: string;
  /** Cor de texto com contraste AA garantido sobre o gradiente acima. */
  texto: string;
  /** Acabamento — controla ornamento de canto e véu holográfico. */
  acabamento: 'fosco' | 'metal' | 'polido' | 'matte-neon' | 'holografico';
}

export const RARIDADE_CONFIG: Record<Raridade, RaridadeConfig> = {
  Base: {
    raridade: 'Base',
    gradiente: ['#8a5a3b', '#5c3a22'],
    borda: '#a9754f',
    texto: '#f5efe6',
    acabamento: 'fosco',
  },
  Prata: {
    raridade: 'Prata',
    gradiente: ['#c9d2dc', '#8b96a5'],
    borda: '#e4e9ee',
    texto: '#141a24',
    acabamento: 'metal',
  },
  Ouro: {
    raridade: 'Ouro',
    gradiente: ['#f3c55b', '#b8862b'],
    borda: '#ffe08a',
    texto: '#241a05',
    acabamento: 'polido',
  },
  'Em Alta': {
    raridade: 'Em Alta',
    gradiente: ['#161b22', '#0d1117'],
    borda: '#39ff88',
    texto: '#eafff1',
    acabamento: 'matte-neon',
  },
  Elite: {
    raridade: 'Elite',
    gradiente: ['#fff6e0', '#d8b45c'],
    borda: '#fff2c9',
    texto: '#2a2005',
    acabamento: 'holografico',
  },
};

/**
 * Raridade é sempre derivada, nunca escolhida manualmente. "Em Alta" tem prioridade sobre
 * Base/Prata/Ouro (destaca quem está subindo rápido), mas não sobre Elite — um atleta que já
 * chegou ao topo permanece Elite mesmo em ascensão acelerada.
 */
export function calcularRaridade(atleta: Atleta): Raridade {
  const ida = calcularIda(atleta.ratings);
  const tendencia = calcularTendencia(atleta.historico);

  let base: Raridade;
  if (ida >= 9) base = 'Elite';
  else if (ida >= 7.5) base = 'Ouro';
  else if (ida >= 6) base = 'Prata';
  else base = 'Base';

  if (base !== 'Elite' && tendencia >= 0.25) return 'Em Alta';
  return base;
}

export const RARIDADES_ORDEM: Raridade[] = ['Base', 'Prata', 'Ouro', 'Em Alta', 'Elite'];
