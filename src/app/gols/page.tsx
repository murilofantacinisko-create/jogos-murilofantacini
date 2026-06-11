"use client";

import { gols } from "@/data/jogos";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const FAIXAS = ["0–15", "16–30", "31–45", "46–60", "61–75", "76–89", "90+"];

export default function GolsPage() {
  const golsPorJogador = new Map<string, number>();

  for (const gol of gols) {
    golsPorJogador.set(gol.Atleta, (golsPorJogador.get(gol.Atleta) ?? 0) + 1);
  }

  const artilharia = Array.from(golsPorJogador.entries())
    .map(([jogador, quantidade]) => ({ jogador, gols: quantidade }))
    .sort((a, b) => b.gols - a.gols)
    .slice(0, 15);

  const golsPorFaixa = new Map<string, number>();
  for (const gol of gols) {
    const faixa = gol["Faixa Minuto"];
    golsPorFaixa.set(faixa, (golsPorFaixa.get(faixa) ?? 0) + 1);
  }

  const distribuicaoMinutos = FAIXAS.map((faixa) => ({
    faixa,
    gols: golsPorFaixa.get(faixa) ?? 0,
  }));

  const totalGols = gols.length;

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
          <p className="text-muted-foreground">Nenhum gol registrado ainda.</p>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={artilharia} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" allowDecimals={false} stroke="#a1a1aa" />
                <YAxis
                  type="category"
                  dataKey="jogador"
                  width={140}
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

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Gols por Faixa de Minuto</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distribuicaoMinutos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="faixa" stroke="#a1a1aa" />
              <YAxis allowDecimals={false} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171717",
                  border: "1px solid #262626",
                }}
              />
              <Bar dataKey="gols" fill="#8B0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
