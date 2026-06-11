export const dynamic = "force-dynamic";

const espnTeamIds: Record<string, string> = {
  Flamengo: "5781",
  Palmeiras: "5782",
  "São Paulo": "5783",
  Corinthians: "5784",
  Santos: "5785",
  Fluminense: "5786",
  Botafogo: "5787",
  Vasco: "5788",
  "Atlético-MG": "5789",
  Cruzeiro: "5790",
  Internacional: "5791",
  Grêmio: "5792",
  "Athletico-PR": "5793",
  "Colo-Colo": "2060",
  "Boca Juniors": "2009",
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
