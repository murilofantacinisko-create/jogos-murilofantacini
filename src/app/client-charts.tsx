"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ValueType } from "recharts/types/component/DefaultTooltipContent";

const tooltipStyle = {
  backgroundColor: "#171717",
  border: "1px solid #262626",
};

export function ClientCharts({
  jogosPorAno,
  distribuicao,
  aproveitamentoPorCampeonato,
  publicoPorEstadio,
  golsPorFaixa,
  aproveitamentoPorAno,
}: {
  jogosPorAno: { ano: string; jogos: number }[];
  distribuicao: { name: string; value: number; color: string }[];
  aproveitamentoPorCampeonato: { campeonato: string; aproveitamento: number }[];
  publicoPorEstadio: { estadio: string; publico: number }[];
  golsPorFaixa: { faixa: string; gols: number }[];
  aproveitamentoPorAno: { ano: string; aproveitamento: number }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Jogos por Ano</h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jogosPorAno}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="ano" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="jogos" fill="#CC0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">
            Vitórias / Empates / Derrotas
          </h2>
          <div className="flex h-52 w-full items-center gap-2">
            <div className="h-full w-3/5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribuicao}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                  >
                    {distribuicao.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex w-2/5 flex-col gap-2">
              {distribuicao.map((entry) => {
                const total = distribuicao.reduce((acc, d) => acc + d.value, 0);
                const pct = total > 0 ? (entry.value / total) * 100 : 0;
                return (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="flex-1 truncate text-muted-foreground">
                      {entry.name}
                    </span>
                    <span className="font-semibold">{entry.value}</span>
                    <span className="w-12 text-right text-muted-foreground">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Gols por Faixa de Minuto</h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={golsPorFaixa}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="faixa" stroke="#a1a1aa" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="gols" fill="#CC0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">Aproveitamento por Ano</h2>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aproveitamentoPorAno}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="ano" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} unit="%" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: ValueType | undefined) => [`${value}%`, "Aproveitamento"]}
                />
                <Line
                  type="monotone"
                  dataKey="aproveitamento"
                  stroke="#CC0000"
                  strokeWidth={2}
                  dot={{ fill: "#CC0000" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">
            Aproveitamento por Campeonato
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aproveitamentoPorCampeonato}
                layout="vertical"
                margin={{ left: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  unit="%"
                  stroke="#a1a1aa"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="campeonato"
                  stroke="#a1a1aa"
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: ValueType | undefined) => [`${value}%`, "Aproveitamento"]}
                />
                <Bar dataKey="aproveitamento" fill="#CC0000" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-2 text-sm font-semibold">
            Público Médio por Estádio
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={publicoPorEstadio}
                layout="vertical"
                margin={{ left: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="estadio"
                  stroke="#a1a1aa"
                  width={140}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: ValueType | undefined) => [
                    Number(value ?? 0).toLocaleString("pt-BR"),
                    "Público médio",
                  ]}
                />
                <Bar dataKey="publico" fill="#a1a1aa" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EsportesCharts({
  eventosPorAno,
  eventosPorEsporte,
}: {
  eventosPorAno: { ano: string; eventos: number }[];
  eventosPorEsporte: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Eventos por Ano</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eventosPorAno}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="ano" stroke="#a1a1aa" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} stroke="#a1a1aa" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="eventos" fill="#CC0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Eventos por Esporte</h2>
        <div className="flex h-56 w-full items-center gap-2">
          <div className="h-full w-3/5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventosPorEsporte}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {eventosPorEsporte.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex w-2/5 flex-col gap-2">
            {eventosPorEsporte.map((entry) => {
              const total = eventosPorEsporte.reduce((acc, d) => acc + d.value, 0);
              const pct = total > 0 ? (entry.value / total) * 100 : 0;
              return (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="flex-1 truncate text-muted-foreground">
                    {entry.name}
                  </span>
                  <span className="font-semibold">{entry.value}</span>
                  <span className="w-12 text-right text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
