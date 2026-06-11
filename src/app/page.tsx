"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Goal,
  Percent,
  Users,
  Target,
  MapPin,
} from "lucide-react";
import { ClientCharts } from "./client-charts";
import { Jogo } from "@/types/jogo";
import { cn } from "@/lib/utils";

const FAIXAS = ["0–15", "16–30", "31–45", "46–60", "61–75", "76–89", "90+"];

function formatData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

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

function resultadoCorBolinha(resultado: string): string {
  switch (resultado) {
    case "Vitória":
      return "bg-green-500";
    case "Empate":
      return "bg-yellow-500";
    default:
      return "bg-corinthians-red";
  }
}

function resultadoLetra(resultado: string): string {
  switch (resultado) {
    case "Vitória":
      return "V";
    case "Empate":
      return "E";
    default:
      return "D";
  }
}

export default function DashboardPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState("Todos");
  const [campeonato, setCampeonato] = useState("Todos");

  useEffect(() => {
    fetch("/api/jogos?categoria=profissional")
      .then((res) => res.json())
      .then((data) => setJogos(data))
      .finally(() => setLoading(false));
  }, []);

  const anos = useMemo(
    () =>
      Array.from(new Set(jogos.map((j) => j.ano))).sort((a, b) =>
        b.localeCompare(a)
      ),
    [jogos]
  );

  const campeonatos = useMemo(
    () => Array.from(new Set(jogos.map((j) => j.campeonato))).sort(),
    [jogos]
  );

  const jogosFiltrados = useMemo(
    () =>
      jogos
        .filter((j) => ano === "Todos" || j.ano === ano)
        .filter((j) => campeonato === "Todos" || j.campeonato === campeonato),
    [jogos, ano, campeonato]
  );

  const totalJogos = jogosFiltrados.length;

  const vitorias = jogosFiltrados.filter((j) => j.resultado === "Vitória").length;
  const empates = jogosFiltrados.filter((j) => j.resultado === "Empate").length;
  const derrotas = jogosFiltrados.filter((j) => j.resultado === "Derrota").length;

  const golsVistos = jogosFiltrados.reduce((acc, j) => acc + j.gm, 0);
  const mediaGols = totalJogos ? golsVistos / totalJogos : 0;

  const totalPontos = jogosFiltrados.reduce((acc, j) => acc + j.pontos, 0);
  const aproveitamento = totalJogos ? (totalPontos / (totalJogos * 3)) * 100 : 0;

  const jogosComPublico = jogosFiltrados.filter(
    (j): j is Jogo & { publico: number } => j.publico !== null
  );
  const mediaPublico = jogosComPublico.length
    ? jogosComPublico.reduce((acc, j) => acc + j.publico, 0) / jogosComPublico.length
    : 0;

  const jogoMaiorPublico = jogosComPublico.reduce<typeof jogosComPublico[number] | null>(
    (max, j) => (!max || j.publico > max.publico ? j : max),
    null
  );

  const ultimosCinco = [...jogosFiltrados]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-5);

  const jogosPorAno = Array.from(
    jogosFiltrados.reduce((map, j) => {
      map.set(j.ano, (map.get(j.ano) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([ano, jogosCount]) => ({ ano, jogos: jogosCount }))
    .sort((a, b) => a.ano.localeCompare(b.ano));

  const distribuicao = [
    { name: "Vitórias", value: vitorias, color: "#22c55e" },
    { name: "Empates", value: empates, color: "#eab308" },
    { name: "Derrotas", value: derrotas, color: "#8B0000" },
  ];

  const aproveitamentoPorCampeonato = Array.from(
    jogosFiltrados.reduce((map, j) => {
      const atual = map.get(j.campeonato) ?? { pontos: 0, jogos: 0 };
      atual.pontos += j.pontos;
      atual.jogos += 1;
      map.set(j.campeonato, atual);
      return map;
    }, new Map<string, { pontos: number; jogos: number }>())
  )
    .map(([campeonato, { pontos, jogos: count }]) => ({
      campeonato,
      aproveitamento: Number(((pontos / (count * 3)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.aproveitamento - a.aproveitamento);

  const publicoPorEstadio = Array.from(
    jogosComPublico.reduce((map, j) => {
      const atual = map.get(j.estadio) ?? { total: 0, jogos: 0 };
      atual.total += j.publico;
      atual.jogos += 1;
      map.set(j.estadio, atual);
      return map;
    }, new Map<string, { total: number; jogos: number }>())
  )
    .map(([estadio, { total, jogos: count }]) => ({
      estadio,
      publico: Math.round(total / count),
    }))
    .sort((a, b) => b.publico - a.publico)
    .slice(0, 8);

  const golsPorFaixaMap = new Map<string, number>();
  for (const jogo of jogosFiltrados) {
    for (const gol of jogo.gols) {
      golsPorFaixaMap.set(gol.faixaMinuto, (golsPorFaixaMap.get(gol.faixaMinuto) ?? 0) + 1);
    }
  }
  const golsPorFaixa = FAIXAS.map((faixa) => ({
    faixa,
    gols: golsPorFaixaMap.get(faixa) ?? 0,
  }));

  const aproveitamentoPorAno = Array.from(
    jogosFiltrados.reduce((map, j) => {
      const atual = map.get(j.ano) ?? { pontos: 0, jogos: 0 };
      atual.pontos += j.pontos;
      atual.jogos += 1;
      map.set(j.ano, atual);
      return map;
    }, new Map<string, { pontos: number; jogos: number }>())
  )
    .map(([ano, { pontos, jogos: count }]) => ({
      ano,
      aproveitamento: Number(((pontos / (count * 3)) * 100).toFixed(1)),
    }))
    .sort((a, b) => a.ano.localeCompare(b.ano));

  const topAdversarios = Array.from(
    jogosFiltrados.reduce((map, j) => {
      const atual = map.get(j.adversario) ?? { jogos: 0, pontos: 0 };
      atual.jogos += 1;
      atual.pontos += j.pontos;
      map.set(j.adversario, atual);
      return map;
    }, new Map<string, { jogos: number; pontos: number }>())
  )
    .map(([adversario, { jogos: count, pontos }]) => ({
      adversario,
      jogos: count,
      aproveitamento: (pontos / (count * 3)) * 100,
    }))
    .sort((a, b) => b.jogos - a.jogos)
    .slice(0, 5);

  const topArtilheiros = Array.from(
    jogosFiltrados
      .flatMap((j) => j.gols)
      .reduce((map, g) => {
        map.set(g.atleta, (map.get(g.atleta) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
  )
    .map(([atleta, gols]) => ({ atleta, gols }))
    .sort((a, b) => b.gols - a.gols)
    .slice(0, 10);

  const topEstadios = Array.from(
    jogosFiltrados.reduce((map, j) => {
      map.set(j.estadio, (map.get(j.estadio) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([estadio, jogos]) => ({ estadio, jogos }))
    .sort((a, b) => b.jogos - a.jogos)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumo geral dos jogos acompanhados
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="Todos">Todos os Anos</option>
          {anos.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <select
          value={campeonato}
          onChange={(e) => setCampeonato(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="Todos">Todos os Campeonatos</option>
          {campeonatos.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : totalJogos === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Nenhum jogo encontrado para os filtros selecionados.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Média de Público"
              value={
                jogosComPublico.length
                  ? Math.round(mediaPublico).toLocaleString("pt-BR")
                  : "-"
              }
              icon={Users}
            />
            <StatCard
              label="Aproveitamento"
              value={`${aproveitamento.toFixed(1)}%`}
              icon={Percent}
            />
            <StatCard label="Total de Gols" value={golsVistos} icon={Goal} />
            <StatCard
              label="Média de Gols por Jogo"
              value={mediaGols.toFixed(2)}
              icon={Target}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Maior Público</h2>
              {jogoMaiorPublico ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-corinthians-red/20 text-corinthians-red">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {jogoMaiorPublico.publico.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      vs {jogoMaiorPublico.adversario} •{" "}
                      {formatData(jogoMaiorPublico.data)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Nenhum jogo com público informado.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">Últimos 5 Jogos</h2>
              <div className="flex items-center gap-3">
                {ultimosCinco.map((j) => (
                  <div
                    key={j.id}
                    title={`${j.mando} x ${j.adversario} (${j.gm}-${j.gs}) - ${formatData(j.data)}`}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white",
                      resultadoCorBolinha(j.resultado)
                    )}
                  >
                    {resultadoLetra(j.resultado)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ClientCharts
            jogosPorAno={jogosPorAno}
            distribuicao={distribuicao}
            aproveitamentoPorCampeonato={aproveitamentoPorCampeonato}
            publicoPorEstadio={publicoPorEstadio}
            golsPorFaixa={golsPorFaixa}
            aproveitamentoPorAno={aproveitamentoPorAno}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Adversários Mais Frequentes
              </h2>
              <ul className="flex flex-col gap-3">
                {topAdversarios.map((a) => (
                  <li
                    key={a.adversario}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{a.adversario}</span>
                    <span className="text-muted-foreground">
                      {a.jogos} jogo{a.jogos !== 1 ? "s" : ""} •{" "}
                      {a.aproveitamento.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Artilheiros Mais Vistos
              </h2>
              <ul className="flex flex-col gap-3">
                {topArtilheiros.map((a) => (
                  <li
                    key={a.atleta}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{a.atleta}</span>
                    <span className="text-muted-foreground">
                      {a.gols} gol{a.gols !== 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5" />
                Estádios Mais Frequentados
              </h2>
              <ul className="flex flex-col gap-3">
                {topEstadios.map((e) => (
                  <li
                    key={e.estadio}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{e.estadio}</span>
                    <span className="text-muted-foreground">
                      {e.jogos} jogo{e.jogos !== 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
