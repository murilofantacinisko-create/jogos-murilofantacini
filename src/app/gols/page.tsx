"use client";

import { jogosProfissional } from "@/data/jogos";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function GolsPage() {
  const golsPorJogador = new Map<string, number>();

  for (const jogo of jogosProfissional) {
    for (const gol of jogo.gols ?? []) {
      golsPorJogador.set(
        gol.jogador,
        (golsPorJogador.get(gol.jogador) ?? 0) + 1
      );
    }
  }

  const artilharia = Array.from(golsPorJogador.entries())
    .map(([jogador, gols]) => ({ jogador, gols }))
    .sort((a, b) => b.gols - a.gols);

  const totalGols = artilharia.reduce((acc, a) => acc + a.gols, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Gols</h1>
        <p className="text-muted-foreground">
          Análise dos gols marcados nos jogos acompanhados
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Total de Gols</p>
        <p className="text-2xl font-bold">{totalGols}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Artilharia</h2>
        {artilharia.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum gol registrado ainda. Adicione jogos com gols em{" "}
            <code className="rounded bg-secondary px-1 py-0.5">
              src/data/jogos.ts
            </code>
            .
          </p>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={artilharia} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" allowDecimals={false} stroke="#a1a1aa" />
                <YAxis
                  type="category"
                  dataKey="jogador"
                  width={120}
                  stroke="#a1a1aa"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#171717",
                    border: "1px solid #262626",
                  }}
                />
                <Bar dataKey="gols" fill="#8B0000" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
