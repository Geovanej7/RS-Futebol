import { z } from 'zod';

const ratingsSchema = z.object({
  tecnica: z.record(z.string(), z.number()),
  fisica: z.record(z.string(), z.number()),
  tatica: z.record(z.string(), z.number()),
  psico: z.record(z.string(), z.number()),
});

const atletaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  categoria: z.string(),
  posicao: z.string(),
  peDominante: z.string(),
  dataNascimento: z.string(),
  altura: z.number(),
  peso: z.number(),
  cidade: z.string(),
  alojamento: z.string(),
  responsavel: z.string(),
  contato: z.string(),
  status: z.string(),
  dataEntradaClube: z.string(),
  observacoes: z.string(),
  ratings: ratingsSchema,
  historico: z.array(z.object({ data: z.string(), media: z.number() })),
  registrosMedicos: z.array(z.record(z.string(), z.unknown())),
  notasScout: z.array(z.record(z.string(), z.unknown())),
});

const avaliacaoSchema = z.object({
  id: z.string(),
  data: z.string(),
  atletaId: z.string(),
  avaliador: z.string(),
  mediaTecnica: z.number(),
  mediaFisica: z.number(),
  mediaTatica: z.number(),
  mediaPsico: z.number(),
});

const sessaoTreinoSchema = z.object({
  id: z.string(),
  data: z.string(),
  tipo: z.string(),
  duracaoMinutos: z.number(),
  presencas: z.array(z.record(z.string(), z.unknown())),
});

export const backupSchema = z.object({
  versao: z.number(),
  geradoEm: z.string(),
  atletas: z.array(atletaSchema),
  avaliacoes: z.array(avaliacaoSchema),
  sessoesTreino: z.array(sessaoTreinoSchema),
});

export type BackupFile = z.infer<typeof backupSchema>;
