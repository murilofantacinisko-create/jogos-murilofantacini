import { jogadosProfissional } from "@/data/jogos";
import { Trophy, Goal, CalendarDays, Award } from "lucide-react";
import { ClientCharts } from "./client-charts";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-corinthians-red/20 text-corinthians-red">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const totalJogos = jogadosProfissional.length;

  const vitorias = jogadosProfissional.filter(
    (j) => j.RESULTADO === "Vitória"
  ).length;
  const empates = jogadosProfissional.filter(
    (j) => j.RESULTADO === "Empate"
  ).length;
  const derrotas = jogadosProfissional.filter(
    (j) => j.RESULTADO === "Derrota"
  ).length;

  const golsVistos = jogadosProfissional.reduce((acc, j) => acc + j.GM, 0);

  const titulos = jogadosProfissional.filter(
    (j) => j.STATUS === "Campeão"
  ).length;

  const jogosPorAno = Array.from(
    jogadosProfissional.reduce((map, j) => {
      map.set(j.ANO, (map.get(j.ANO) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([ano, jogos]) => ({ ano, jogos }))
    .sort((a, b) => a.ano.localeCompare(b.ano));

  const distribuicao = [
    { name: "Vitórias", value: vitorias, color: "#22c55e" },
    { name: "Empates", value: empates, color: "#a1a1aa" },
    { name: "Derrotas", value: derrotas, color: "#8B0000" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumo geral dos jogos acompanhados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jogos Acompanhados" value={totalJogos} icon={CalendarDays} />
        <StatCard label="Vitórias" value={vitorias} icon={Trophy} />
        <StatCard label="Gols Vistos" value={golsVistos} icon={Goal} />
        <StatCard label="Títulos Presenciados" value={titulos} icon={Award} />
      </div>

      <ClientCharts jogosPorAno={jogosPorAno} distribuicao={distribuicao} />
    </div>
  );
}
