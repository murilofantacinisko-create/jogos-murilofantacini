"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Jogos por Ano</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jogosPorAno}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="ano" stroke="#a1a1aa" />
              <YAxis allowDecimals={false} stroke="#a1a1aa" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="jogos" fill="#CC0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Vitórias / Empates / Derrotas
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribuicao}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {distribuicao.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Aproveitamento por Campeonato
        </h2>
        <div className="h-80 w-full">
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

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Público Médio por Estádio
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={publicoPorEstadio}
              layout="vertical"
              margin={{ left: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis type="number" stroke="#a1a1aa" />
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

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Gols por Faixa de Minuto</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={golsPorFaixa}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="faixa" stroke="#a1a1aa" />
              <YAxis allowDecimals={false} stroke="#a1a1aa" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="gols" fill="#CC0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Aproveitamento por Ano</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={aproveitamentoPorAno}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="ano" stroke="#a1a1aa" />
              <YAxis domain={[0, 100]} unit="%" stroke="#a1a1aa" />
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
  );
}
