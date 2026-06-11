export type Esporte = "Volei" | "Basquete" | "Futebol Americano" | "Tenis";

export interface SetVolei {
  a: number;
  b: number;
}

export interface SetTenis {
  a: number;
  b: number;
}

export interface PlacarVolei {
  placarFinalA: number;
  placarFinalB: number;
  sets: SetVolei[];
}

export interface PlacarBasquete {
  pontosA: number;
  pontosB: number;
}

export interface PlacarFutebolAmericano {
  pontosA: number;
  pontosB: number;
}

export interface PlacarTenis {
  melhorDe: 3 | 5;
  sets: SetTenis[];
}

export type PlacarJson =
  | PlacarVolei
  | PlacarBasquete
  | PlacarFutebolAmericano
  | PlacarTenis;

export interface OutroEsporte {
  id: number;
  esporte: Esporte;
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
