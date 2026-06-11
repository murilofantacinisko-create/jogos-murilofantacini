"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Shirt,
  Trophy,
  Equal,
  XCircle,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Jogo } from "@/types/jogo";

const PAGE_SIZE = 9;

function formatData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

function resultadoCor(resultado: string) {
  switch (resultado) {
    case "Vitória":
      return "bg-green-700/30 text-green-400 border-green-700/50";
    case "Empate":
      return "bg-yellow-700/30 text-yellow-400 border-yellow-700/50";
    default:
      return "bg-corinthians-red/30 text-red-400 border-corinthians-red/50";
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  iconClassName?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border border-l-4 border-l-corinthians-red bg-card p-4">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-corinthians-red/20 text-corinthians-red",
          iconClassName
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function CrestPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-sm font-bold">
      {label.slice(0, 1).toUpperCase()}
    </div>
  );
}

function JogoCard({ jogo }: { jogo: Jogo }) {
  const isMandante = jogo.mando === "Mandante";

  return (
    <Link
      href={`/outros/${jogo.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary"
    >
      <p className="text-xs text-muted-foreground">
        {formatData(jogo.data)} • {jogo.campeonato}
      </p>

      <p className="text-lg font-bold leading-tight">
        {isMandante
          ? `Corinthians x ${jogo.adversario}`
          : `${jogo.adversario} x Corinthians`}
      </p>

      <div className="flex items-center justify-center gap-4 py-2">
        <img
          src="/sccp.png"
          alt="Corinthians"
          style={{ width: 48, height: 48, objectFit: "contain", borderRadius: "50%" }}
        />
        <p className="text-3xl font-extrabold">
          {jogo.gm} x {jogo.gs}
        </p>
        <CrestPlaceholder label={jogo.adversario} />
      </div>

      <div className="flex justify-center">
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-bold",
            resultadoCor(jogo.resultado)
          )}
        >
          {jogo.resultado}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-2 text-sm text-muted-foreground">
        <div>
          <p>{jogo.estadio}</p>
          {jogo.info && <p className="text-xs text-muted-foreground">{jogo.info}</p>}
        </div>
        {jogo.publico !== null && (
          <p className="flex shrink-0 items-center gap-1.5">
            <Users className="h-4 w-4" />
            {jogo.publico.toLocaleString("pt-BR")}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function OutrosPage() {
  const [jogos, setJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  const [campeonato, setCampeonato] = useState("Todos");
  const [resultado, setResultado] = useState("Todos");
  const [ano, setAno] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    Promise.all([
      fetch("/api/jogos?categoria=outros-corinthians").then((res) => res.json()),
      fetch("/api/jogos?categoria=outros-jogos").then((res) => res.json()),
    ])
      .then(([corinthians, outros]) => {
        setJogos([...corinthians, ...outros]);
      })
      .finally(() => setLoading(false));
  }, []);

  const campeonatos = useMemo(
    () => Array.from(new Set(jogos.map((j) => j.campeonato))).sort(),
    [jogos]
  );
  const anos = useMemo(
    () =>
      Array.from(new Set(jogos.map((j) => j.ano))).sort((a, b) =>
        b.localeCompare(a)
      ),
    [jogos]
  );

  const jogosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return [...jogos]
      .filter((j) => campeonato === "Todos" || j.campeonato === campeonato)
      .filter((j) => resultado === "Todos" || j.resultado === resultado)
      .filter((j) => ano === "Todos" || j.ano === ano)
      .filter(
        (j) =>
          termo === "" ||
          j.adversario.toLowerCase().includes(termo) ||
          j.campeonato.toLowerCase().includes(termo) ||
          j.estadio.toLowerCase().includes(termo)
      )
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [jogos, campeonato, resultado, ano, busca]);

  useEffect(() => {
    setPagina(1);
  }, [campeonato, resultado, ano, busca]);

  const totalJogos = jogosFiltrados.length;
  const vitorias = jogosFiltrados.filter((j) => j.resultado === "Vitória").length;
  const empates = jogosFiltrados.filter((j) => j.resultado === "Empate").length;
  const derrotas = jogosFiltrados.filter((j) => j.resultado === "Derrota").length;

  const pct = (n: number) => (totalJogos ? `${((n / totalJogos) * 100).toFixed(1)}%` : "0%");

  const totalPaginas = Math.max(1, Math.ceil(jogosFiltrados.length / PAGE_SIZE));
  const jogosPaginados = jogosFiltrados.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Outros Jogos</h1>
        <p className="text-muted-foreground">
          Outros jogos acompanhados, fora do profissional do Corinthians
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total de Jogos" value={String(totalJogos)} icon={Shirt} />
        <StatCard
          label="Vitórias"
          value={`${vitorias} (${pct(vitorias)})`}
          icon={Trophy}
          iconClassName="bg-green-500/20 text-green-400"
        />
        <StatCard
          label="Empates"
          value={`${empates} (${pct(empates)})`}
          icon={Equal}
          iconClassName="bg-yellow-500/20 text-yellow-400"
        />
        <StatCard
          label="Derrotas"
          value={`${derrotas} (${pct(derrotas)})`}
          icon={XCircle}
          iconClassName="bg-corinthians-red/20 text-corinthians-red"
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <select
              value={campeonato}
              onChange={(e) => setCampeonato(e.target.value)}
              className="input appearance-none pr-8"
            >
              <option value="Todos">Todos os Campeonatos</option>
              {campeonatos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative">
            <select
              value={resultado}
              onChange={(e) => setResultado(e.target.value)}
              className="input appearance-none pr-8"
            >
              <option value="Todos">Todos os Resultados</option>
              <option value="Vitória">Vitória</option>
              <option value="Empate">Empate</option>
              <option value="Derrota">Derrota</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>

          <div className="relative">
            <select
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              className="input appearance-none pr-8"
            >
              <option value="Todos">Todos os Anos</option>
              {anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar jogo ou adversário..."
            className="input w-full pl-9"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : jogosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            {jogos.length === 0
              ? "Nenhum jogo registrado ainda. Adicione jogos em /admin."
              : "Nenhum jogo encontrado com os filtros selecionados."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jogosPaginados.map((jogo) => (
              <JogoCard key={jogo.id} jogo={jogo} />
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina === 1}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPagina(p)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium",
                    p === pagina
                      ? "border-corinthians-red bg-corinthians-red text-white"
                      : "border-border hover:bg-secondary"
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
