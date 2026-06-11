"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gamepad2,
  CheckCircle2,
  MinusCircle,
  XCircle,
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Jogo } from "@/types/jogo";
import { getTeamLogo } from "@/lib/teamLogos";

const PAGE_SIZE = 15;

interface GolForm {
  atleta: string;
  minuto: string;
}

function formatData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  if (!ano || !mes || !dia) return data;
  return `${dia}/${mes}/${ano}`;
}

function faixaMinuto(minuto: number): string {
  if (minuto <= 15) return "0–15";
  if (minuto <= 30) return "16–30";
  if (minuto <= 45) return "31–45";
  if (minuto <= 60) return "46–60";
  if (minuto <= 75) return "61–75";
  if (minuto <= 89) return "76–89";
  return "90+";
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string | number;
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

function Field({
  label,
  value,
  editing,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      ) : (
        <p className="truncate text-sm font-medium">{value || "—"}</p>
      )}
    </label>
  );
}

export default function ProfissionalPage() {
  const [jogadosProfissional, setJogadosProfissional] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  const [campeonato, setCampeonato] = useState("Todos");
  const [resultado, setResultado] = useState("Todos");
  const [ano, setAno] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [gols, setGols] = useState<GolForm[]>([]);

  useEffect(() => {
    fetch("/api/jogos?categoria=profissional")
      .then((res) => res.json())
      .then((data) => setJogadosProfissional(data))
      .finally(() => setLoading(false));
  }, []);

  const campeonatos = useMemo(
    () =>
      Array.from(new Set(jogadosProfissional.map((j) => j.campeonato))).sort(),
    [jogadosProfissional]
  );
  const anos = useMemo(
    () =>
      Array.from(new Set(jogadosProfissional.map((j) => j.ano))).sort((a, b) =>
        b.localeCompare(a)
      ),
    [jogadosProfissional]
  );

  const jogos = useMemo(() => {
    return [...jogadosProfissional]
      .filter((j) => campeonato === "Todos" || j.campeonato === campeonato)
      .filter((j) => resultado === "Todos" || j.resultado === resultado)
      .filter((j) => ano === "Todos" || j.ano === ano)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [jogadosProfissional, campeonato, resultado, ano]);

  const totalJogos = jogos.length;
  const vitorias = jogos.filter((j) => j.resultado === "Vitória").length;
  const empates = jogos.filter((j) => j.resultado === "Empate").length;
  const derrotas = jogos.filter((j) => j.resultado === "Derrota").length;

  const totalPaginas = Math.max(1, Math.ceil(jogos.length / PAGE_SIZE));
  const jogosPaginados = jogos.slice(
    (pagina - 1) * PAGE_SIZE,
    pagina * PAGE_SIZE
  );

  useEffect(() => {
    setPagina(1);
  }, [campeonato, resultado, ano]);

  useEffect(() => {
    if (pagina > totalPaginas) setPagina(totalPaginas);
  }, [pagina, totalPaginas]);

  useEffect(() => {
    if (jogos.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!jogos.some((j) => j.id === selectedId)) {
      setSelectedId(jogos[0].id);
    }
  }, [jogos, selectedId]);

  const jogo = useMemo(
    () => jogos.find((j) => j.id === selectedId) ?? null,
    [jogos, selectedId]
  );

  useEffect(() => {
    if (!jogo) return;
    setEditing(false);
    setError(null);
    setForm({
      data: jogo.data,
      hora: jogo.hora,
      diaSemana: jogo.diaSemana,
      campeonato: jogo.campeonato,
      estadio: jogo.estadio,
      mando: jogo.mando,
      gm: String(jogo.gm),
      gs: String(jogo.gs),
      adversario: jogo.adversario,
      info: jogo.info ?? "",
      resultado: jogo.resultado,
      fase: jogo.fase,
      status: jogo.status,
      publico: jogo.publico !== null ? String(jogo.publico) : "",
      pontos: String(jogo.pontos),
      ano: jogo.ano,
      categoria: jogo.categoria,
    });
    setGols(
      [...jogo.gols]
        .sort((a, b) => a.minuto - b.minuto)
        .map((g) => ({ atleta: g.atleta, minuto: String(g.minuto) }))
    );
  }, [jogo]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addGol() {
    setGols((prev) => [...prev, { atleta: "", minuto: "" }]);
  }

  function removeGol(index: number) {
    setGols((prev) => prev.filter((_, i) => i !== index));
  }

  function updateGol(index: number, field: keyof GolForm, value: string) {
    setGols((prev) =>
      prev.map((gol, i) => (i === index ? { ...gol, [field]: value } : gol))
    );
  }

  async function handleSave() {
    if (!jogo) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...form,
        gm: Number(form.gm),
        gs: Number(form.gs),
        publico: form.publico ? Number(form.publico) : null,
        pontos: Number(form.pontos),
        info: form.info || null,
        gols: gols
          .filter((g) => g.atleta.trim() !== "")
          .map((g) => ({
            atleta: g.atleta,
            minuto: Number(g.minuto),
            faixaMinuto: faixaMinuto(Number(g.minuto)),
          })),
      };

      const res = await fetch(`/api/jogos/${jogo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar o jogo");

      const updated: Jogo = await res.json();
      setJogadosProfissional((prev) =>
        prev.map((j) => (j.id === updated.id ? updated : j))
      );
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!jogo) return;
    if (!confirm("Tem certeza que deseja excluir este jogo?")) return;

    const res = await fetch(`/api/jogos/${jogo.id}`, { method: "DELETE" });

    if (res.ok) {
      setJogadosProfissional((prev) => prev.filter((j) => j.id !== jogo.id));
      setSelectedId(null);
    } else {
      setError("Erro ao excluir o jogo");
    }
  }

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
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }} className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Profissional</h1>
          <p className="text-muted-foreground">
            Jogos do Corinthians acompanhados
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <SummaryCard label="Total de Jogos" value={totalJogos} icon={Gamepad2} />
          <SummaryCard
            label="Vitórias"
            value={vitorias}
            icon={CheckCircle2}
            iconClassName="bg-green-500/20 text-green-400"
          />
          <SummaryCard
            label="Empates"
            value={empates}
            icon={MinusCircle}
            iconClassName="bg-yellow-500/20 text-yellow-400"
          />
          <SummaryCard
            label="Derrotas"
            value={derrotas}
            icon={XCircle}
            iconClassName="bg-corinthians-red/20 text-corinthians-red"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
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

          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            className="rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="Todos">Todos os Resultados</option>
            <option value="Vitória">Vitória</option>
            <option value="Empate">Empate</option>
            <option value="Derrota">Derrota</option>
          </select>

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
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="flex flex-col gap-3 lg:col-span-3">
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Adversário</th>
                    <th className="px-4 py-3 font-medium">Placar</th>
                    <th className="px-4 py-3 font-medium">Estádio</th>
                    <th className="px-4 py-3 font-medium">Campeonato</th>
                    <th className="px-4 py-3 font-medium">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {jogosPaginados.map((j) => (
                    <tr
                      key={j.id}
                      onClick={() => setSelectedId(j.id)}
                      className={cn(
                        "cursor-pointer border-b border-border last:border-0 transition-colors",
                        j.id === selectedId
                          ? "bg-corinthians-red/20 hover:bg-corinthians-red/25"
                          : "hover:bg-secondary/50"
                      )}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatData(j.data)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <TeamLogo team={j.adversario} size={24} />
                          {j.adversario}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {j.gm} x {j.gs}
                      </td>
                      <td className="px-4 py-3">{j.estadio}</td>
                      <td className="px-4 py-3">{j.campeonato}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-1 text-xs font-bold",
                            resultadoCor(j.resultado)
                          )}
                        >
                          {j.resultado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && jogos.length === 0 && (
                <p className="p-6 text-muted-foreground">
                  {jogadosProfissional.length === 0
                    ? "Nenhum jogo registrado ainda. Adicione jogos em /admin."
                    : "Nenhum jogo encontrado com os filtros selecionados."}
                </p>
              )}

              {loading && (
                <p className="p-6 text-muted-foreground">Carregando...</p>
              )}
            </div>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span>
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {!jogo ? (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
                Selecione um jogo na lista para ver os detalhes.
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-lg border border-border border-l-4 border-l-corinthians-red bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold leading-tight">
                      {jogo.mando === "Mandante"
                        ? `Corinthians vs ${jogo.adversario}`
                        : `${jogo.adversario} vs Corinthians`}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {formatData(jogo.data)} • {jogo.hora} • {jogo.estadio}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {editing ? (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className={cn(
                          "rounded-md bg-corinthians-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-corinthians-red/90",
                          saving && "opacity-50"
                        )}
                      >
                        {saving ? "Salvando..." : "Salvar"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>
                    )}
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1 rounded-md border border-corinthians-red px-3 py-1.5 text-xs font-semibold text-corinthians-red hover:bg-corinthians-red/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-corinthians-red">{error}</p>}

                <div className="flex items-center justify-center gap-4 rounded-lg bg-secondary/40 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <TeamLogo team="Corinthians" size={48} />
                    <span className="truncate text-sm font-semibold">
                      Corinthians
                    </span>
                  </div>
                  <span className="text-3xl font-extrabold">
                    {jogo.gm} x {jogo.gs}
                  </span>
                  <div className="flex flex-col items-center gap-1">
                    <TeamLogo team={jogo.adversario} size={48} />
                    <span className="truncate text-sm font-semibold">
                      {jogo.adversario}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Field label="Data" editing={editing} type="date" value={form.data ?? ""} onChange={(v) => updateField("data", v)} />
                  <Field label="Hora" editing={editing} type="time" value={form.hora ?? ""} onChange={(v) => updateField("hora", v)} />
                  <Field label="Ano" editing={editing} value={form.ano ?? ""} onChange={(v) => updateField("ano", v)} />
                  <Field label="Estádio" editing={editing} value={form.estadio ?? ""} onChange={(v) => updateField("estadio", v)} />
                  <Field label="Mando" editing={editing} value={form.mando ?? ""} onChange={(v) => updateField("mando", v)} />
                  <Field label="Dia da Semana" editing={editing} value={form.diaSemana ?? ""} onChange={(v) => updateField("diaSemana", v)} />
                  <Field label="Campeonato" editing={editing} value={form.campeonato ?? ""} onChange={(v) => updateField("campeonato", v)} />
                  <Field label="Fase" editing={editing} value={form.fase ?? ""} onChange={(v) => updateField("fase", v)} />
                  <Field label="Adversário" editing={editing} value={form.adversario ?? ""} onChange={(v) => updateField("adversario", v)} />
                  <Field label="Público" editing={editing} type="number" value={form.publico ?? ""} onChange={(v) => updateField("publico", v)} />
                  <Field label="Pontos" editing={editing} type="number" value={form.pontos ?? ""} onChange={(v) => updateField("pontos", v)} />
                  <Field label="Status" editing={editing} value={form.status ?? ""} onChange={(v) => updateField("status", v)} />

                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-muted-foreground">Placar</span>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={form.gm ?? ""}
                          onChange={(e) => updateField("gm", e.target.value)}
                          className="input w-16"
                        />
                        <span>x</span>
                        <input
                          type="number"
                          value={form.gs ?? ""}
                          onChange={(e) => updateField("gs", e.target.value)}
                          className="input w-16"
                        />
                      </div>
                    ) : (
                      <p className="text-sm font-medium">
                        {jogo.gm} - {jogo.gs}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-muted-foreground">Resultado</span>
                    {editing ? (
                      <select
                        value={form.resultado ?? ""}
                        onChange={(e) => updateField("resultado", e.target.value)}
                        className="input"
                      >
                        <option value="Vitória">Vitória</option>
                        <option value="Empate">Empate</option>
                        <option value="Derrota">Derrota</option>
                      </select>
                    ) : (
                      <span
                        className={cn(
                          "w-fit rounded-full border px-2 py-1 text-xs font-bold",
                          resultadoCor(jogo.resultado)
                        )}
                      >
                        {jogo.resultado}
                      </span>
                    )}
                  </div>

                  <Field label="Informações" editing={editing} value={form.info ?? ""} onChange={(v) => updateField("info", v)} className="col-span-2 sm:col-span-3" />
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Gols da Partida</h3>
                    {editing && (
                      <button
                        type="button"
                        onClick={addGol}
                        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Adicionar Gol
                      </button>
                    )}
                  </div>

                  {gols.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum gol registrado.
                    </p>
                  ) : editing ? (
                    <div className="flex max-h-48 flex-col gap-2 overflow-y-auto scrollbar-thin">
                      {gols.map((gol, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={gol.atleta}
                            onChange={(e) => updateGol(i, "atleta", e.target.value)}
                            className="input flex-1"
                            placeholder="Nome do jogador"
                          />
                          <input
                            type="number"
                            min={0}
                            max={120}
                            value={gol.minuto}
                            onChange={(e) => updateGol(i, "minuto", e.target.value)}
                            className="input w-20"
                          />
                          <button
                            type="button"
                            onClick={() => removeGol(i)}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-corinthians-red hover:bg-secondary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="flex max-h-48 flex-col gap-1.5 overflow-y-auto scrollbar-thin">
                      {[...gols]
                        .sort((a, b) => Number(a.minuto) - Number(b.minuto))
                        .map((gol, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
                          >
                            <span>{gol.atleta}</span>
                            <span className="text-muted-foreground">{gol.minuto}&apos;</span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
