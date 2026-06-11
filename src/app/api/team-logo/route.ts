export const dynamic = "force-dynamic";

const espnTeamIds: Record<string, string> = {
  Flamengo: "5783",
  Palmeiras: "5781",
  "São Paulo": "5780",
  Corinthians: "5782",
  Santos: "5784",
  Fluminense: "5785",
  Botafogo: "5786",
  Vasco: "5787",
  "Atlético-MG": "5788",
  Cruzeiro: "5789",
  Internacional: "5790",
  Grêmio: "5791",
  "Athletico-PR": "5792",
  Coritiba: "5793",
  Sport: "5794",
  Vitória: "5795",
  "América-MG": "5796",
  "Ponte Preta": "5797",
  Chapecoense: "5798",
  Bragantino: "16921",
  Cuiaba: "7511",
  Juventude: "5800",
  Ceará: "5801",
  Avaí: "5802",
  "Colo-Colo": "2060",
  "Boca Juniors": "2009",
  Racing: "2064",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");
  if (!team) return Response.json({ logo: null });

  const id = espnTeamIds[team];
  if (!id) return Response.json({ logo: null });

  const logo = `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;
  return Response.json({ logo });
}
