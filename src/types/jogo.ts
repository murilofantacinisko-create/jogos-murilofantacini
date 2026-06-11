export interface Gol {
  id: number;
  atleta: string;
  minuto: number;
  faixaMinuto: string;
  jogoId: number;
}

export interface Jogo {
  id: number;
  data: string;
  hora: string;
  diaSemana: string;
  campeonato: string;
  estadio: string;
  mando: string;
  gm: number;
  gs: number;
  adversario: string;
  info: string | null;
  resultado: string;
  fase: string;
  status: string;
  publico: number | null;
  pontos: number;
  ano: string;
  categoria: string;
  createdAt: string;
  gols: Gol[];
}
