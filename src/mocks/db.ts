import type { Atleta, Avaliacao, RegistroMedico } from '@/entities/athlete';
import {
  ATRIBUTOS_FISICA,
  ATRIBUTOS_PSICO,
  ATRIBUTOS_TATICA,
  ATRIBUTOS_TECNICA,
} from '@/entities/athlete';
import { calcularMediaAcumulada, mediaFisica, mediaGeral, mediaPsico, mediaTatica, mediaTecnica } from '@/lib/calculations';
import { calcularRaridade, type Raridade } from '@/lib/rarity';
import { ATLETAS, AVALIACOES } from './seed';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const athletesDb: Atleta[] = clone(ATLETAS);
export const avaliacoesDb: Avaliacao[] = clone(AVALIACOES);

function baselineRatings(attrs: readonly string[]): Record<string, number> {
  return Object.fromEntries(attrs.map((attr) => [attr, 5]));
}

export function buildBaselineAthlete(dados: Omit<Atleta, 'id' | 'ratings' | 'historico' | 'registrosMedicos' | 'notasScout' | 'status'>): Atleta {
  return {
    ...dados,
    id: `atleta-${Date.now()}`,
    status: 'Ativo',
    ratings: {
      tecnica: baselineRatings(ATRIBUTOS_TECNICA),
      fisica: baselineRatings(ATRIBUTOS_FISICA),
      tatica: baselineRatings(ATRIBUTOS_TATICA),
      psico: baselineRatings(ATRIBUTOS_PSICO),
    },
    historico: [{ data: new Date().toISOString(), media: 5 }],
    registrosMedicos: [] as RegistroMedico[],
    notasScout: [],
  };
}

export function addAthlete(atleta: Atleta): void {
  athletesDb.push(atleta);
}

export function addScoutNote(atletaId: string, nota: { id: string; data: string; autor: string; texto: string }): Atleta | null {
  const atleta = athletesDb.find((a) => a.id === atletaId);
  if (!atleta) return null;
  atleta.notasScout.push(nota);
  return atleta;
}

/** Recalcula a média geral e registra um novo ponto no histórico do atleta. */
function registrarHistorico(atleta: Atleta): void {
  const media = mediaGeral(atleta.ratings);
  atleta.historico.push({ data: new Date().toISOString(), media: Math.round(media * 100) / 100 });
}

export function saveEvaluation(
  atletaId: string,
  grupo: 'tecnica' | 'fisica' | 'tatica' | 'psico',
  valores: Record<string, number>,
): Atleta | null {
  const atleta = athletesDb.find((a) => a.id === atletaId);
  if (!atleta) return null;
  atleta.ratings[grupo] = valores;
  registrarHistorico(atleta);
  return atleta;
}

export function contarAvaliacoes(atletaId: string): number {
  return avaliacoesDb.filter((av) => av.atletaId === atletaId).length;
}

export interface NotasAvaliacao {
  tecnica?: number;
  fisica?: number;
  tatica?: number;
  psico?: number;
}

export interface ResultadoCriarAvaliacao {
  atleta: Atleta;
  avaliacao: Avaliacao;
  raridadeAntes: Raridade;
  raridadeDepois: Raridade;
}

const MEDIA_POR_GRUPO = {
  tecnica: mediaTecnica,
  fisica: mediaFisica,
  tatica: mediaTatica,
  psico: mediaPsico,
} as const;

/**
 * Cria uma avaliação cuja nota "soma" à pontuação que o atleta já tem, via média acumulada
 * (ver calcularMediaAcumulada em lib/calculations.ts) — nunca sobrescreve o valor anterior.
 */
export function criarAvaliacao(atletaId: string, avaliador: string, notas: NotasAvaliacao): ResultadoCriarAvaliacao | null {
  const atleta = athletesDb.find((a) => a.id === atletaId);
  if (!atleta) return null;

  const raridadeAntes = calcularRaridade(atleta);
  const n = contarAvaliacoes(atletaId);

  (Object.keys(notas) as (keyof NotasAvaliacao)[]).forEach((grupo) => {
    const nota = notas[grupo];
    if (nota === undefined) return;
    const ratingsGrupo = atleta.ratings[grupo];
    for (const atributo of Object.keys(ratingsGrupo)) {
      ratingsGrupo[atributo] = calcularMediaAcumulada(ratingsGrupo[atributo], nota, n);
    }
  });

  registrarHistorico(atleta);
  const raridadeDepois = calcularRaridade(atleta);

  const avaliacao: Avaliacao = {
    id: `aval-${Date.now()}`,
    data: new Date().toISOString(),
    atletaId,
    avaliador,
    mediaTecnica: MEDIA_POR_GRUPO.tecnica(atleta.ratings),
    mediaFisica: MEDIA_POR_GRUPO.fisica(atleta.ratings),
    mediaTatica: MEDIA_POR_GRUPO.tatica(atleta.ratings),
    mediaPsico: MEDIA_POR_GRUPO.psico(atleta.ratings),
  };
  avaliacoesDb.unshift(avaliacao);

  return { atleta, avaliacao, raridadeAntes, raridadeDepois };
}
