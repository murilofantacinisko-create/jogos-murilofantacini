const logoCache: Record<string, string | null> = {
  Corinthians: "/sccp.png",
};

export async function getTeamLogo(team: string): Promise<string | null> {
  if (logoCache[team] !== undefined) return logoCache[team];

  try {
    const res = await fetch(
      `/api/team-logo?team=${encodeURIComponent(team)}`
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
