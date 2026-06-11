const logoCache: Record<string, string | null> = {
  Corinthians: "/sccp.png",
};

const nameMap: Record<string, string> = {
  "Atlético-MG": "Atletico Mineiro",
  "Athletico-PR": "Atletico Paranaense",
  "Atlético-GO": "Atletico Goianiense",
  "Botafogo-SP": "Botafogo SP",
  Bragantino: "Red Bull Bragantino",
  "América-MG": "America Mineiro",
  "Ponte Preta": "Ponte Preta",
  "Colo-Colo": "Colo-Colo",
  "Boca Juniors": "Boca Juniors",
};

export async function getTeamLogo(team: string): Promise<string | null> {
  if (logoCache[team] !== undefined) return logoCache[team];

  const searchName = nameMap[team] ?? team;

  try {
    const res = await fetch(
      `/api/team-logo?team=${encodeURIComponent(searchName)}`
    );
    const data = await res.json();
    const logo = data?.logo ?? null;
    logoCache[team] = logo;
    return logo;
  } catch {
    logoCache[team] = null;
    return null;
  }
}
