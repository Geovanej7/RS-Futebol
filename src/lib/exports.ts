import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Atleta, Avaliacao, SessaoTreino } from '@/entities/athlete';
import {
  calcularIda,
  calcularIdade,
  classificarIda,
  mediaFisica,
  mediaGeral,
  mediaPsico,
  mediaTatica,
  mediaTecnica,
} from '@/lib/calculations';

export async function exportarRelatorioExecutivoPDF(atletas: Atleta[], nomePlataforma: string): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);

  const doc = new jsPDF();
  const agora = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });

  doc.setFontSize(16);
  doc.text(nomePlataforma, 14, 18);
  doc.setFontSize(11);
  doc.text('Relatório Executivo', 14, 26);
  doc.setFontSize(9);
  doc.text(`Gerado em ${agora}`, 14, 32);

  const medias = atletas.map((a) => mediaGeral(a.ratings));
  const idas = atletas.map((a) => calcularIda(a.ratings));
  const totalAtletas = atletas.length;
  const mediaGeralTime = medias.reduce((s, v) => s + v, 0) / Math.max(1, medias.length);
  const idaMedio = idas.reduce((s, v) => s + v, 0) / Math.max(1, idas.length);

  autoTable(doc, {
    startY: 38,
    head: [['Total de Atletas', 'Média Geral', 'IDA Médio']],
    body: [[String(totalAtletas), mediaGeralTime.toFixed(1), idaMedio.toFixed(1)]],
    theme: 'grid',
  });

  const top10 = [...atletas]
    .map((a) => ({ atleta: a, ida: calcularIda(a.ratings) }))
    .sort((a, b) => b.ida - a.ida)
    .slice(0, 10);

  autoTable(doc, {
    startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10,
    head: [['Nome', 'Categoria', 'Posição', 'IDA', 'Classificação']],
    body: top10.map(({ atleta, ida }) => [
      atleta.nome,
      atleta.categoria,
      atleta.posicao,
      ida.toFixed(1),
      classificarIda(ida),
    ]),
    theme: 'striped',
  });

  doc.save('relatorio-executivo.pdf');
}

export async function exportarBaseExcel(atletas: Atleta[]): Promise<void> {
  const XLSX = await import('xlsx');

  const linhas = atletas.map((a) => ({
    Nome: a.nome,
    Categoria: a.categoria,
    Posição: a.posicao,
    Idade: calcularIdade(a.dataNascimento),
    Altura: a.altura,
    Peso: a.peso,
    Cidade: a.cidade,
    Status: a.status,
    'Média Técnica': mediaTecnica(a.ratings).toFixed(1),
    'Média Física': mediaFisica(a.ratings).toFixed(1),
    'Média Tática': mediaTatica(a.ratings).toFixed(1),
    'Média Psicológica': mediaPsico(a.ratings).toFixed(1),
    IDA: calcularIda(a.ratings).toFixed(1),
    Classificação: classificarIda(calcularIda(a.ratings)),
  }));

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Atletas');
  XLSX.writeFile(wb, 'base-atletas.xlsx');
}

export interface BackupPayload {
  versao: number;
  geradoEm: string;
  atletas: Atleta[];
  avaliacoes: Avaliacao[];
  sessoesTreino: SessaoTreino[];
}

export function exportarBackupJSON(atletas: Atleta[], avaliacoes: Avaliacao[], sessoesTreino: SessaoTreino[]): void {
  const payload: BackupPayload = {
    versao: 1,
    geradoEm: new Date().toISOString(),
    atletas,
    avaliacoes,
    sessoesTreino,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'backup-base-intelligence.json';
  link.click();
  URL.revokeObjectURL(url);
}
