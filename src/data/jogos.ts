export interface Gol {
  jogador: string;
  minuto: number;
}

export interface JogoProfissional {
  id: number;
  data: string;
  competicao: string;
  adversario: string;
  mandante: boolean;
  placarCorinthians: number;
  placarAdversario: number;
  estadio: string;
  publico?: number;
  gols?: Gol[];
  observacoes?: string;
}

export interface JogoOutro {
  id: number;
  data: string;
  competicao: string;
  mandante: string;
  visitante: string;
  placar: string;
  estadio: string;
  imagem?: string;
  observacoes?: string;
}

export const jogosProfissional: JogoProfissional[] = [];

export const jogosOutros: JogoOutro[] = [];
