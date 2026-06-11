import {
  PlacarBasquete,
  PlacarFutebolAmericano,
  PlacarTenis,
  PlacarVolei,
} from "@/types/esporte";

export function parsePlacarJson(placarJson: string) {
  try {
    return JSON.parse(placarJson);
  } catch {
    return null;
  }
}

export function formatPlacarResumo(esporte: string, placarJson: string): string {
  const placar = parsePlacarJson(placarJson);
  if (!placar) return "—";

  switch (esporte) {
    case "Volei": {
      const p = placar as PlacarVolei;
      return `${p.placarFinalA} x ${p.placarFinalB}`;
    }
    case "Tenis": {
      const p = placar as PlacarTenis;
      const setsA = p.sets.filter((s) => s.a > s.b).length;
      const setsB = p.sets.filter((s) => s.b > s.a).length;
      return `${setsA} x ${setsB}`;
    }
    case "Basquete": {
      const p = placar as PlacarBasquete;
      return `${p.pontosA} x ${p.pontosB}`;
    }
    case "Futebol Americano": {
      const p = placar as PlacarFutebolAmericano;
      return `${p.pontosA} x ${p.pontosB}`;
    }
    default:
      return "—";
  }
}
