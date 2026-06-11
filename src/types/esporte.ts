export interface OutroEsporte {
  id: number;
  esporte: string;
  data: string;
  hora: string;
  diaSemana: string;
  campeonato: string;
  estadio: string;
  localizacao: string;
  fase: string;
  timeA: string;
  timeB: string;
  vencedor: string;
  placarJson: string;
  info: string | null;
  createdAt: string;
}

export interface SetScore {
  a: number;
  b: number;
}

export interface PlacarTenis {
  melhorDe: number;
  sets: SetScore[];
}

export interface PlacarVolei {
  setsA: number;
  setsB: number;
  sets: SetScore[];
}

export interface PlacarPontos {
  pontosA: number;
  pontosB: number;
}
