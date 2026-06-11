"use client";

import { useEffect, useState } from "react";
import { Trophy, Goal, CalendarDays, Award } from "lucide-react";
import { ClientCharts } from "./client-charts";
import { Jogo } from "@/types/jogo";

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
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jogos?categoria=profissional")
      .then((res) => res.json())
      .then((data) => setJogos(data))
      .finally(() => setLoading(false));
  }, []);

  const totalJogos = jogos.length;

  const vitorias = jogos.filter((j) => j.resultado === "Vitória").length;
  const empates = jogos.filter((j) => j.resultado === "Empate").length;
  const derrotas = jogos.filter((j) => j.resultado === "Derrota").length;

  const golsVistos = jogos.reduce((acc, j) => acc + j.gm, 0);

  const titulos = jogos.filter((j) => j.status === "Campeão").length;

  const jogosPorAno = Array.from(
    jogos.reduce((map, j) => {
      map.set(j.ano, (map.get(j.ano) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([ano, jogosCount]) => ({ ano, jogos: jogosCount }))
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

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : totalJogos === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Nenhum jogo registrado ainda. Adicione jogos em{" "}
            <code className="rounded bg-secondary px-1 py-0.5">/admin</code>.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Jogos Acompanhados" value={totalJogos} icon={CalendarDays} />
            <StatCard label="Vitórias" value={vitorias} icon={Trophy} />
            <StatCard label="Gols Vistos" value={golsVistos} icon={Goal} />
            <StatCard label="Títulos Presenciados" value={titulos} icon={Award} />
          </div>

          <ClientCharts jogosPorAno={jogosPorAno} distribuicao={distribuicao} />
        </>
      )}
    </div>
  );
}
