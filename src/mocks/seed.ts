import type {
  Atleta,
  Avaliacao,
  Categoria,
  Posicao,
  Ratings,
  SessaoTreino,
  StatusAtleta,
  TipoTreino,
} from '@/entities/athlete';
import {
  ATRIBUTOS_FISICA,
  ATRIBUTOS_PSICO,
  ATRIBUTOS_TATICA,
  ATRIBUTOS_TECNICA,
} from '@/entities/athlete';

/** PRNG determinístico (mulberry32) — dados mockados estáveis entre reloads. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function range(min: number, max: number): number {
  return Math.round((min + rand() * (max - min)) * 10) / 10;
}

const NOMES = [
  'Lucas Silva', 'Gabriel Souza', 'Matheus Oliveira', 'Rafael Costa', 'João Pedro',
  'Enzo Ferreira', 'Miguel Almeida', 'Arthur Santos', 'Bernardo Lima', 'Davi Rodrigues',
  'Heitor Pereira', 'Bryan Carvalho', 'Pedro Henrique', 'Nicolas Barbosa', 'Vitor Gomes',
  'Théo Ribeiro', 'Samuel Martins', 'Guilherme Araújo', 'Caio Nascimento', 'Breno Correia',
  'Kauã Melo', 'Yuri Cardoso', 'Erick Teixeira', 'Murilo Dias', 'Otávio Rocha',
];

const CIDADES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Recife'];
const ESCOLAS = ['EM Dom Pedro II', 'Colégio Santa Rita', 'EM Castro Alves', 'Colégio Anchieta', 'EM Machado de Assis'];

const CATEGORIAS: Categoria[] = ['Sub-11', 'Sub-13', 'Sub-15', 'Sub-17', 'Sub-20'];
const POSICOES: Posicao[] = ['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'];
const STATUS: StatusAtleta[] = ['Ativo', 'Ativo', 'Ativo', 'Ativo', 'Lesionado', 'Em observação'];

function buildRatingGroup(attrs: readonly string[], base: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of attrs) {
    out[a] = Math.min(10, Math.max(3, range(base - 1.5, base + 1.5)));
  }
  return out;
}

function buildHistorico(baseMedia: number): { data: string; media: number }[] {
  const pontos = [];
  const hoje = new Date();
  let media = baseMedia - range(0.3, 0.9);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    media = Math.min(10, Math.max(3, media + range(-0.3, 0.4)));
    pontos.push({ data: d.toISOString(), media: Math.round(media * 100) / 100 });
  }
  return pontos;
}

function birthDateForCategoria(categoria: Categoria): string {
  const idadeMap: Record<Categoria, number> = {
    'Sub-11': 10,
    'Sub-13': 12,
    'Sub-15': 14,
    'Sub-17': 16,
    'Sub-20': 19,
  };
  const idade = idadeMap[categoria];
  const hoje = new Date();
  const ano = hoje.getFullYear() - idade;
  const mes = Math.floor(rand() * 12);
  const dia = 1 + Math.floor(rand() * 27);
  return new Date(ano, mes, dia).toISOString();
}

function buildAtleta(id: number): Atleta {
  const categoria = pick(CATEGORIAS);
  const posicao = pick(POSICOES);
  const status = pick(STATUS);
  const base = range(5.5, 9.2);

  const ratings: Ratings = {
    tecnica: buildRatingGroup(ATRIBUTOS_TECNICA, base),
    fisica: buildRatingGroup(ATRIBUTOS_FISICA, base),
    tatica: buildRatingGroup(ATRIBUTOS_TATICA, base),
    psico: buildRatingGroup(ATRIBUTOS_PSICO, base),
  };

  const registrosMedicos =
    status === 'Lesionado'
      ? [
          {
            id: `med-${id}-1`,
            data: new Date().toISOString(),
            tipo: pick(['Lesão muscular (coxa posterior)', 'Entorse de tornozelo', 'Tendinite patelar']),
            diasAfastado: Math.round(range(7, 45)),
            retorno: 'Em avaliação médica',
            limitacoes: 'Sem atividades de impacto',
            observacao: 'Acompanhamento com departamento médico semanal.',
          },
        ]
      : [];

  const notasScout =
    rand() > 0.6
      ? [
          {
            id: `scout-${id}-1`,
            data: new Date().toISOString(),
            autor: 'Scout responsável',
            texto: pick([
              'Excelente visão de jogo para a idade, decide rápido sob pressão.',
              'Físico ainda em desenvolvimento, mas técnica já em nível avançado.',
              'Liderança natural dentro de campo, puxa o time nos momentos difíceis.',
              'Precisa evoluir o lado defensivo, mas tem talento raro de finalização.',
            ]),
          },
        ]
      : [];

  return {
    id: `atleta-${id}`,
    nome: NOMES[id % NOMES.length],
    categoria,
    posicao,
    peDominante: pick(['Direito', 'Esquerdo', 'Ambidestro']),
    dataNascimento: birthDateForCategoria(categoria),
    altura: Math.round(range(150, 190)),
    peso: Math.round(range(45, 82)),
    avatarUrl: `https://randomuser.me/api/portraits/men/${id % 100}.jpg`,
    cidade: pick(CIDADES),
    escola: pick(ESCOLAS),
    responsavel: `Responsável de ${NOMES[id % NOMES.length].split(' ')[0]}`,
    contato: `(11) 9${String(1000 + id).padStart(4, '0')}-${String(2000 + id).padStart(4, '0')}`,
    status,
    dataEntradaClube: new Date(2020 + Math.floor(rand() * 5), Math.floor(rand() * 12), 1).toISOString(),
    observacoes: '',
    ratings,
    historico: buildHistorico(base),
    registrosMedicos,
    notasScout,
  };
}

export const ATLETAS: Atleta[] = Array.from({ length: 42 }, (_, i) => buildAtleta(i));

export const AVALIADORES = ['Carlos Mendes', 'Ana Paula Reis', 'Fernando Souza', 'Juliana Prado'];

export const AVALIACOES: Avaliacao[] = ATLETAS.flatMap((atleta) =>
  atleta.historico.map((ponto, idx) => ({
    id: `${atleta.id}-aval-${idx}`,
    data: ponto.data,
    atletaId: atleta.id,
    avaliador: pick(AVALIADORES),
    mediaTecnica: Math.round((ponto.media + range(-0.3, 0.3)) * 100) / 100,
    mediaFisica: Math.round((ponto.media + range(-0.3, 0.3)) * 100) / 100,
    mediaTatica: Math.round((ponto.media + range(-0.3, 0.3)) * 100) / 100,
    mediaPsico: Math.round((ponto.media + range(-0.3, 0.3)) * 100) / 100,
  })),
).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

const TIPOS_TREINO: TipoTreino[] = ['Técnico', 'Físico', 'Tático', 'Jogo-treino'];

function buildSessaoTreino(semanaOffset: number, sessaoDaSemana: number, index: number): SessaoTreino {
  const hoje = new Date();
  const diaBase = new Date(hoje);
  diaBase.setDate(hoje.getDate() - semanaOffset * 7 - sessaoDaSemana * 2);

  const presencas = ATLETAS.filter(() => rand() > 0.15).map((atleta) => ({
    atletaId: atleta.id,
    presente: rand() > 0.08,
    rpe: Math.round(range(4, 9.5) * 10) / 10,
    recuperacao: Math.round(range(3.5, 9) * 10) / 10,
  }));

  return {
    id: `treino-${index}`,
    data: diaBase.toISOString(),
    tipo: pick(TIPOS_TREINO),
    duracaoMinutos: Math.round(range(70, 110)),
    presencas,
  };
}

export const SESSOES_TREINO: SessaoTreino[] = Array.from({ length: 8 }, (_, semana) =>
  Array.from({ length: 3 }, (_, sessao) => buildSessaoTreino(semana, sessao, semana * 3 + sessao)),
).flat();
