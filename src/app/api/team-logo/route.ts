export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const team = searchParams.get("team");
  if (!team) return Response.json({ logo: null });

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(team)}`
    );
    const data = await res.json();
    const logo = data?.teams?.[0]?.strTeamBadge ?? null;
    return Response.json({ logo });
  } catch {
    return Response.json({ logo: null });
  }
}
