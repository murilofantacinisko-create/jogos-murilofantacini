export const dynamic = "force-dynamic";

const espnTeamIds: Record<string, string> = {
  "Athletico-PR": "3458",
  "Atlético-MG": "7632",
  Botafogo: "6086",
  Chapecoense: "9318",
  Corinthians: "874",
  Coritiba: "3456",
  Cruzeiro: "2022",
  Flamengo: "819",
  Fluminense: "3445",
  Grêmio: "6273",
  Internacional: "1936",
  Mirassol: "9169",
  Palmeiras: "2029",
  Bragantino: "6079",
  Santos: "2674",
  "São Paulo": "2026",
  Vasco: "3454",
  Vitória: "3457",
  Bahia: "9967",
  "Botafogo-SP": "4584",
  Sport: "3459",
  "América-MG": "3460",
  "Ponte Preta": "3461",
  Avaí: "3462",
  Ceará: "3463",
  Cuiaba: "7511",
  Juventude: "3464",
  Portuguesa: "3465",
  "Santa Cruz": "3466",
  "Colo-Colo": "2060",
  "Boca Juniors": "2009",
  Racing: "2064",
  "Atlético-GO": "3467",
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
