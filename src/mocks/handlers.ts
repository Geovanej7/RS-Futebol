import { http, HttpResponse } from 'msw';
import { SESSOES_TREINO } from './seed';
import { DEMO_ACCOUNTS } from './accounts';
import {
  athletesDb,
  avaliacoesDb,
  addAthlete,
  addScoutNote,
  saveEvaluation,
  buildBaselineAthlete,
  criarAvaliacao,
  type NotasAvaliacao,
} from './db';
import type { Atleta } from '@/entities/athlete';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export const handlers = [
  http.get('/api/athletes', () => {
    return HttpResponse.json(clone(athletesDb));
  }),

  http.get('/api/athletes/:id', ({ params }) => {
    const atleta = athletesDb.find((a) => a.id === params.id);
    if (!atleta) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(clone(atleta));
  }),

  http.post('/api/athletes', async ({ request }) => {
    const body = (await request.json()) as Omit<
      Atleta,
      'id' | 'ratings' | 'historico' | 'registrosMedicos' | 'notasScout' | 'status'
    >;
    const novoAtleta = buildBaselineAthlete(body);
    addAthlete(novoAtleta);
    return HttpResponse.json(clone(novoAtleta), { status: 201 });
  }),

  http.get('/api/evaluations', () => {
    return HttpResponse.json(clone(avaliacoesDb));
  }),

  http.post('/api/evaluations', async ({ request }) => {
    const body = (await request.json()) as { atletaId: string; avaliador: string; notas: NotasAvaliacao };
    const resultado = criarAvaliacao(body.atletaId, body.avaliador, body.notas);
    if (!resultado) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(clone(resultado), { status: 201 });
  }),

  http.get('/api/trainings', () => {
    return HttpResponse.json(clone(SESSOES_TREINO));
  }),

  http.post('/api/athletes/:id/evaluations', async ({ request, params }) => {
    const body = (await request.json()) as { grupo: 'tecnica' | 'fisica' | 'tatica' | 'psico'; valores: Record<string, number> };
    const atualizado = saveEvaluation(params.id as string, body.grupo, body.valores);
    if (!atualizado) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ id: `${params.id}-aval-new` }, { status: 201 });
  }),

  http.post('/api/athletes/:id/scout-notes', async ({ request, params }) => {
    const body = (await request.json()) as { texto: string; autor: string };
    const nota = { id: `scout-${Date.now()}`, data: new Date().toISOString(), autor: body.autor, texto: body.texto };
    const atualizado = addScoutNote(params.id as string, nota);
    if (!atualizado) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(nota, { status: 201 });
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; senha?: string };
    const conta = DEMO_ACCOUNTS.find((c) => c.email === body?.email && c.senha === body?.senha);
    if (!conta) {
      return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }
    return HttpResponse.json({
      token: `mock-jwt-token-${conta.perfil}`,
      user: { nome: conta.nome, email: conta.email, perfil: conta.perfil },
    });
  }),
];
