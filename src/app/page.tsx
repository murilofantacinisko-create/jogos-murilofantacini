"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  Goal,
  Percent,
  Users,
  Target,
  MapPin,
  Award,
} from "lucide-react";
import { ClientCharts, EsportesCharts } from "./client-charts";
import { Jogo } from "@/types/jogo";
import { OutroEsporte } from "@/types/esporte";
import { cn } from "@/lib/utils";
import { getTeamLogo } from "@/lib/teamLogos";

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
    <div className="flex items-center gap-4 rounded-lg border border-border border-l-4 border-l-corinthians-red bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-corinthians-red/20 text-corinthians-red">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function HighlightCard({
  label,
  icon: Icon,
  iconClassName,
  main,
  sub,
}: {
  label: string;
  icon: React.ElementType;
  iconClassName?: string;
  main: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border border-l-4 border-l-corinthians-red bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("h-4 w-4 shrink-0", iconClassName)} />
        <span className="truncate">{label}</span>
      </div>
      <p className="truncate text-lg font-bold leading-tight">{main}</p>
      <p className="truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function SccpCrest() {
  return (
    <img
      src="/sccp.png"
      alt="SCCP"
      style={{ width: 52, height: 52, objectFit: "contain", borderRadius: "50%" }}
      className="shrink-0"
    />
  );
}

function TeamLogo({ team, size }: { team: string; size: number }) {
  const [logo, setLogo] = useState<string | null | undefined>(
    team === "Corinthians" ? "/sccp.png" : undefined
  );

  useEffect(() => {
    if (team === "Corinthians") {
      setLogo("/sccp.png");
      return;
    }

    let cancelled = false;
    setLogo(undefined);
    getTeamLogo(team).then((url) => {
      if (!cancelled) setLogo(url);
    });
    return () => {
      cancelled = true;
    };
  }, [team]);

  if (logo === undefined || logo === null) {
    return (
      <span
        className="inline-block shrink-0 rounded-full bg-secondary"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={`Escudo ${team}`}
      width={size}
      height={size}
      className="shrink-0 rounded-full object-contain"
      style={{ width: size, height: size }}
    />
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

type Visao = "profissional" | "outros" | "esportes";

const ESPORTES_TIPOS = ["Vôlei", "Basquete", "Futebol Americano", "Tênis"];

const ESPORTE_CORES: Record<string, string> = {
  "Vôlei": "#3b82f6",
  Basquete: "#f97316",
  "Futebol Americano": "#a855f7",
  "Tênis": "#22c55e",
};

function esporteCor(esporte: string) {
  switch (esporte) {
    case "Vôlei":
      return "bg-blue-700/30 text-blue-400 border-blue-700/50";
    case "Basquete":
      return "bg-orange-700/30 text-orange-400 border-orange-700/50";
    case "Futebol Americano":
      return "bg-purple-700/30 text-purple-400 border-purple-700/50";
    case "Tênis":
      return "bg-green-700/30 text-green-400 border-green-700/50";
    default:
      return "bg-secondary text-foreground border-border";
  }
}

export default function DashboardPage() {
  const [jogosProfissional, setJogosProfissional] = useState<Jogo[]>([]);
  const [jogosOutros, setJogosOutros] = useState<Jogo[]>([]);
  const [outrosEsportes, setOutrosEsportes] = useState<OutroEsporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [visao, setVisao] = useState<Visao>("profissional");
  const [ano, setAno] = useState("Todos");
  const [campeonato, setCampeonato] = useState("Todos");

  useEffect(() => {
    Promise.all([
      fetch("/api/jogos?categoria=profissional").then((res) => res.json()),
      fetch("/api/jogos?categoria=outros-corinthians").then((res) => res.json()),
      fetch("/api/jogos?categoria=outros-jogos").then((res) => res.json()),
      fetch("/api/esportes").then((res) => res.json()),
    ])
      .then(([profissional, outrosCorinthians, outrosJogos, esportes]) => {
        setJogosProfissional(profissional);
        setJogosOutros([...outrosCorinthians, ...outrosJogos]);
        setOutrosEsportes(esportes);
      })
      .finally(() => setLoading(false));
  }, []);

  const jogos = visao === "profissional" ? jogosProfissional : jogosOutros;

  function selecionarVisao(novaVisao: Visao) {
    setVisao(novaVisao);
    setAno("Todos");
    setCampeonato("Todos");
  }

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

  const titulosConquistados = jogosFiltrados
    .filter((j) => j.status.includes("Campeão"))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const totalFinais = jogosFiltrados.filter((j) => j.fase.includes("Final")).length;

  const FASES_ESPECIAIS = [
    { label: "Finais", match: (fase: string) => fase.includes("Final") },
    { label: "Semifinais", match: (fase: string) => fase.includes("Semi") },
    { label: "Quartas", match: (fase: string) => fase.includes("Quartas") },
    { label: "Grupos", match: (fase: string) => fase.includes("Grupos") },
    { label: "Pts Corridos", match: (fase: string) => fase.includes("Pts Corridos") },
  ];
  const fasesEspeciais = FASES_ESPECIAIS.map(({ label, match }) => ({
    fase: label,
    jogos: jogosFiltrados.filter((j) => match(j.fase)).length,
  }));

  const totalEventosEsportes = outrosEsportes.length;

  const eventosPorTipo = ESPORTES_TIPOS.map((tipo) => ({
    tipo,
    total: outrosEsportes.filter((e) => e.esporte === tipo).length,
  }));

  const eventosPorAnoEsportes = Array.from(
    outrosEsportes.reduce((map, e) => {
      const anoEvento = e.data.split("-")[0];
      map.set(anoEvento, (map.get(anoEvento) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([anoEvento, total]) => ({ ano: anoEvento, eventos: total }))
    .sort((a, b) => a.ano.localeCompare(b.ano));

  const eventosPorEsporte = ESPORTES_TIPOS.map((tipo) => ({
    name: tipo,
    value: outrosEsportes.filter((e) => e.esporte === tipo).length,
    color: ESPORTE_CORES[tipo],
  })).filter((e) => e.value > 0);

  const ultimosCincoEsportes = [...outrosEsportes]
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(-5)
    .reverse();

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
    { name: "Derrotas", value: derrotas, color: "#CC0000" },
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
    .sort((a, b) => b.jogos - a.jogos);

  const topArtilheiros = Array.from(
    jogosFiltrados
      .flatMap((j) => j.gols)
      .reduce((map, g) => {
        map.set(g.atleta, (map.get(g.atleta) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
  )
    .map(([atleta, gols]) => ({ atleta, gols }))
    .sort((a, b) => b.gols - a.gols);

  const topEstadios = Array.from(
    jogosFiltrados.reduce((map, j) => {
      map.set(j.estadio, (map.get(j.estadio) ?? 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .map(([estadio, jogos]) => ({ estadio, jogos }))
    .sort((a, b) => b.jogos - a.jogos);

  const estadioMaisVisitado = topEstadios[0] ?? null;

  const melhorVitoria = jogosFiltrados
    .filter((j) => j.resultado === "Vitória")
    .reduce<Jogo | null>((best, j) => {
      const diff = j.gm - j.gs;
      const bestDiff = best ? best.gm - best.gs : -Infinity;
      return diff > bestDiff ? j : best;
    }, null);

  const piorDerrota = jogosFiltrados
    .filter((j) => j.resultado === "Derrota")
    .reduce<Jogo | null>((worst, j) => {
      const diff = j.gs - j.gm;
      const worstDiff = worst ? worst.gs - worst.gm : -Infinity;
      return diff > worstDiff ? j : worst;
    }, null);

  const maiorSequenciaInvicta = (() => {
    const ordenados = [...jogosFiltrados].sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime()
    );

    let melhor: { tamanho: number; inicio: Jogo; fim: Jogo } | null = null;
    let atual: Jogo[] = [];

    const fechaSequencia = () => {
      if (atual.length > 0 && (!melhor || atual.length > melhor.tamanho)) {
        melhor = { tamanho: atual.length, inicio: atual[0], fim: atual[atual.length - 1] };
      }
    };

    for (const j of ordenados) {
      if (j.resultado !== "Derrota") {
        atual.push(j);
      } else {
        fechaSequencia();
        atual = [];
      }
    }
    fechaSequencia();

    return melhor as { tamanho: number; inicio: Jogo; fim: Jogo } | null;
  })();

  return (
    <div className="relative">
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url('/arena.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: "none",
          display: visao === "profissional" ? "block" : "none",
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url('/estadio.jpeg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: "none",
          display: visao !== "profissional" ? "block" : "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }} className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">
          {visao === "profissional" ? (
            <>
              Meu Histórico <span className="text-corinthians-red">Alvinegro</span>
            </>
          ) : visao === "outros" ? (
            <>
              Meu Histórico <span className="text-corinthians-red">Geral</span>
            </>
          ) : (
            <>
              Outros <span className="text-corinthians-red">Esportes</span>
            </>
          )}
        </h1>
        <p className="text-muted-foreground">
          {visao === "profissional"
            ? "Acompanhe todos os jogos do Corinthians que você já esteve presente."
            : visao === "outros"
            ? "Acompanhe todos os jogos que você já esteve presente."
            : "Acompanhe outros eventos esportivos que você já acompanhou."}
        </p>
      </div>

      {visao === "profissional" && totalJogos > 0 && (
        <div className="flex flex-col gap-4 rounded-lg border border-border border-l-4 border-l-corinthians-red bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <SccpCrest />
            <div>
              <h2 className="text-2xl font-bold">Corinthians Profissional</h2>
              <p className="text-sm text-muted-foreground">
                {totalJogos} jogo{totalJogos !== 1 ? "s" : ""} acompanhado
                {totalJogos !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-10">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Aproveitamento
              </p>
              <p className="text-xl font-bold">{aproveitamento.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Total de Gols
              </p>
              <p className="text-xl font-bold">{golsVistos}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Média de Gols
              </p>
              <p className="text-xl font-bold">{mediaGols.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Média de Público
              </p>
              <p className="text-xl font-bold">
                {jogosComPublico.length
                  ? Math.round(mediaPublico).toLocaleString("pt-BR")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex w-fit rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => selecionarVisao("profissional")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            visao === "profissional"
              ? "bg-corinthians-red text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Corinthians Profissional
        </button>
        <button
          type="button"
          onClick={() => selecionarVisao("outros")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            visao === "outros"
              ? "bg-corinthians-red text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Outros Jogos
        </button>
        <button
          type="button"
          onClick={() => selecionarVisao("esportes")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-colors",
            visao === "esportes"
              ? "bg-corinthians-red text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Outros Esportes
        </button>
      </div>

      {visao !== "esportes" && (
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
      )}

      {visao !== "esportes" && (loading ? (
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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
              <h2 className="mb-3 text-base font-semibold">Últimos 5 Jogos</h2>
              <div className="flex items-start gap-4">
                {ultimosCinco.map((j) => (
                  <div
                    key={j.id}
                    title={`${j.mando} x ${j.adversario} (${j.gm}-${j.gs}) - ${formatData(j.data)}`}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white",
                        resultadoCorBolinha(j.resultado)
                      )}
                    >
                      {resultadoLetra(j.resultado)}
                    </div>
                    <p className="text-xs font-semibold">
                      {j.gm} x {j.gs}
                    </p>
                    <p className="w-16 truncate text-xs text-muted-foreground">
                      {j.adversario}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <HighlightCard
              label="Maior Público"
              icon={Users}
              main={
                jogoMaiorPublico
                  ? jogoMaiorPublico.publico.toLocaleString("pt-BR")
                  : "-"
              }
              sub={
                jogoMaiorPublico
                  ? `vs ${jogoMaiorPublico.adversario} • ${jogoMaiorPublico.estadio} • ${jogoMaiorPublico.campeonato} • ${formatData(jogoMaiorPublico.data)}`
                  : "Nenhum jogo com público informado"
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <HighlightCard
              label="Melhor Vitória"
              icon={Trophy}
              iconClassName="text-green-400"
              main={melhorVitoria ? `${melhorVitoria.gm} - ${melhorVitoria.gs}` : "-"}
              sub={
                melhorVitoria
                  ? `vs ${melhorVitoria.adversario} • ${formatData(melhorVitoria.data)}`
                  : "Nenhuma vitória registrada"
              }
            />
            <HighlightCard
              label="Pior Derrota"
              icon={Goal}
              main={piorDerrota ? `${piorDerrota.gm} - ${piorDerrota.gs}` : "-"}
              sub={
                piorDerrota
                  ? `vs ${piorDerrota.adversario} • ${formatData(piorDerrota.data)}`
                  : "Nenhuma derrota registrada"
              }
            />
            <HighlightCard
              label="Maior Sequência Invicta"
              icon={Award}
              main={
                maiorSequenciaInvicta
                  ? `${maiorSequenciaInvicta.tamanho} jogo${maiorSequenciaInvicta.tamanho !== 1 ? "s" : ""}`
                  : "-"
              }
              sub={
                maiorSequenciaInvicta
                  ? `${formatData(maiorSequenciaInvicta.inicio.data)} até ${formatData(maiorSequenciaInvicta.fim.data)}`
                  : "Nenhuma sequência registrada"
              }
            />
            <HighlightCard
              label="Estádio Mais Visitado"
              icon={MapPin}
              main={estadioMaisVisitado ? estadioMaisVisitado.estadio : "-"}
              sub={
                estadioMaisVisitado
                  ? `${estadioMaisVisitado.jogos} jogo${estadioMaisVisitado.jogos !== 1 ? "s" : ""}`
                  : "Nenhum jogo registrado"
              }
            />
          </div>

          <div>
            <h2 className="mb-3 text-xl font-bold">Conquistas</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Títulos Presenciados
                </h3>
                {titulosConquistados.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum título presenciado.
                  </p>
                ) : (
                  <ul className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
                    {titulosConquistados.map((j) => (
                      <li
                        key={j.id}
                        className="flex items-center gap-3 rounded-md border border-border px-2 py-1.5 text-xs"
                      >
                        <Award className="h-4 w-4 shrink-0 text-corinthians-red" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{j.campeonato}</p>
                          <p className="truncate text-muted-foreground">
                            vs {j.adversario} • {formatData(j.data)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <StatCard label="Finais" value={totalFinais} icon={Trophy} />

              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Fases Especiais
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {fasesEspeciais.map((f) => {
                    const max = Math.max(
                      1,
                      ...fasesEspeciais.map((x) => x.jogos)
                    );
                    return (
                      <li key={f.fase} className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span>{f.fase}</span>
                          <span className="text-muted-foreground">{f.jogos}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-corinthians-red"
                            style={{ width: `${(f.jogos / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
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
            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">
                Adversários Mais Frequentes
              </h2>
              <ul className="scrollbar-thin flex max-h-[200px] flex-col gap-2 overflow-y-auto text-sm">
                {topAdversarios.map((a) => (
                  <li
                    key={a.adversario}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <TeamLogo team={a.adversario} size={24} />
                      {a.adversario}
                    </span>
                    <span className="text-muted-foreground">
                      {a.jogos} jogo{a.jogos !== 1 ? "s" : ""} •{" "}
                      {a.aproveitamento.toFixed(1)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">
                Artilheiros Mais Vistos
              </h2>
              <ul className="scrollbar-thin flex max-h-[200px] flex-col gap-2 overflow-y-auto text-sm">
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

            <div className="rounded-lg border border-border bg-card p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4" />
                Estádios Mais Frequentados
              </h2>
              <ul className="scrollbar-thin flex max-h-[200px] flex-col gap-2 overflow-y-auto text-sm">
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
      ))}

      {visao === "esportes" && (loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : totalEventosEsportes === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Nenhum evento registrado ainda. Adicione em /admin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total de Eventos" value={totalEventosEsportes} icon={Trophy} />
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 sm:col-span-3">
              <p className="text-sm text-muted-foreground">Por Modalidade</p>
              <div className="flex flex-wrap gap-2">
                {eventosPorTipo.map((e) => (
                  <span
                    key={e.tipo}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold",
                      esporteCor(e.tipo)
                    )}
                  >
                    {e.tipo}: {e.total}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <EsportesCharts eventosPorAno={eventosPorAnoEsportes} eventosPorEsporte={eventosPorEsporte} />

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold">Últimos 5 Eventos</h2>
            <ul className="flex flex-col gap-2">
              {ultimosCincoEsportes.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "w-fit rounded-full border px-2 py-1 text-xs font-bold",
                        esporteCor(e.esporte)
                      )}
                    >
                      {e.esporte}
                    </span>
                    <span className="font-semibold">
                      {e.timeA} x {e.timeB}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>Vencedor: {e.vencedor}</span>
                    <span>{formatData(e.data)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      ))}
      </div>
    </div>
  );
}
