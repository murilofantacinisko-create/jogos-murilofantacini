"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAdminSession } from "@/lib/client-auth";
import { Jogo } from "@/types/jogo";

interface GolForm {
  atleta: string;
  minuto: string;
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

export default function JogoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = params.id as string;

  function requireAuth(): boolean {
    if (!hasAdminSession()) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return false;
    }
    return true;
  }

  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const [gols, setGols] = useState<GolForm[]>([]);

  useEffect(() => {
    fetch(`/api/jogos/${id}`)
      .then((res) => res.json())
      .then((data: Jogo) => {
        setJogo(data);
        setForm({
          data: data.data,
          hora: data.hora,
          diaSemana: data.diaSemana,
          campeonato: data.campeonato,
          estadio: data.estadio,
          mando: data.mando,
          gm: String(data.gm),
          gs: String(data.gs),
          adversario: data.adversario,
          info: data.info ?? "",
          resultado: data.resultado,
          fase: data.fase,
          status: data.status,
          publico: data.publico !== null ? String(data.publico) : "",
          pontos: String(data.pontos),
          ano: data.ano,
          categoria: data.categoria,
        });
        setGols(
          [...data.gols]
            .sort((a, b) => a.minuto - b.minuto)
            .map((g) => ({ atleta: g.atleta, minuto: String(g.minuto) }))
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

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

      const res = await fetch(`/api/jogos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar o jogo");

      const updated: Jogo = await res.json();
      setJogo(updated);
      setGols(
        [...updated.gols]
          .sort((a, b) => a.minuto - b.minuto)
          .map((g) => ({ atleta: g.atleta, minuto: String(g.minuto) }))
      );
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este jogo?")) return;

    const res = await fetch(`/api/jogos/${id}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/profissional");
    } else {
      setError("Erro ao excluir o jogo");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }

  if (!jogo) {
    return <p className="text-muted-foreground">Jogo não encontrado.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/profissional")}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="flex items-center gap-3">
          {editing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "rounded-md bg-corinthians-red px-4 py-2 text-sm font-semibold text-white hover:bg-corinthians-red/90",
                saving && "opacity-50"
              )}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          ) : (
            <button
              onClick={() => {
                if (requireAuth()) setEditing(true);
              }}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              Editar
            </button>
          )}

          <button
            onClick={() => {
              if (requireAuth()) handleDelete();
            }}
            className="flex items-center gap-2 rounded-md border border-corinthians-red px-4 py-2 text-sm font-semibold text-corinthians-red hover:bg-corinthians-red/10"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold">
          {jogo.mando === "Mandante"
            ? `Corinthians x ${jogo.adversario}`
            : `${jogo.adversario} x Corinthians`}
        </h1>
        <p className="text-muted-foreground">
          {jogo.data} • {jogo.campeonato}
        </p>
      </div>

      {error && <p className="text-sm text-corinthians-red">{error}</p>}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Data" editing={editing} type="date" value={form.data} onChange={(v) => updateField("data", v)} />
        <Field label="Hora" editing={editing} type="time" value={form.hora} onChange={(v) => updateField("hora", v)} />
        <Field label="Dia da Semana" editing={editing} value={form.diaSemana} onChange={(v) => updateField("diaSemana", v)} />
        <Field label="Estádio" editing={editing} value={form.estadio} onChange={(v) => updateField("estadio", v)} />
        <Field label="Mando" editing={editing} value={form.mando} onChange={(v) => updateField("mando", v)} />
        <Field label="Adversário" editing={editing} value={form.adversario} onChange={(v) => updateField("adversario", v)} />
        <Field label="Campeonato" editing={editing} value={form.campeonato} onChange={(v) => updateField("campeonato", v)} />
        <Field label="Fase" editing={editing} value={form.fase} onChange={(v) => updateField("fase", v)} />
        <Field label="Status" editing={editing} value={form.status} onChange={(v) => updateField("status", v)} />
        <Field label="Público" editing={editing} type="number" value={form.publico} onChange={(v) => updateField("publico", v)} />
        <Field label="Pontos" editing={editing} type="number" value={form.pontos} onChange={(v) => updateField("pontos", v)} />
        <Field label="Ano" editing={editing} value={form.ano} onChange={(v) => updateField("ano", v)} />

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Placar</span>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={form.gm}
                onChange={(e) => updateField("gm", e.target.value)}
                className="input w-20"
              />
              <span>x</span>
              <input
                type="number"
                value={form.gs}
                onChange={(e) => updateField("gs", e.target.value)}
                className="input w-20"
              />
            </div>
          ) : (
            <p className="text-2xl font-bold">
              {jogo.gm} - {jogo.gs}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Resultado</span>
          {editing ? (
            <select
              value={form.resultado}
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

        <Field label="Informações" editing={editing} value={form.info} onChange={(v) => updateField("info", v)} className="sm:col-span-2 lg:col-span-3" />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gols da Partida</h2>
          {editing && (
            <button
              type="button"
              onClick={addGol}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              Adicionar Gol
            </button>
          )}
        </div>

        {gols.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum gol registrado.</p>
        ) : editing ? (
          <div className="flex flex-col gap-3">
            {gols.map((gol, i) => (
              <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Atleta</span>
                  <input
                    type="text"
                    value={gol.atleta}
                    onChange={(e) => updateGol(i, "atleta", e.target.value)}
                    className="input"
                    placeholder="Nome do jogador"
                  />
                </label>

                <label className="flex w-full flex-col gap-1 text-sm sm:w-32">
                  <span className="text-muted-foreground">Minuto</span>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={gol.minuto}
                    onChange={(e) => updateGol(i, "minuto", e.target.value)}
                    className="input"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeGol(i)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-corinthians-red hover:bg-secondary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...gols]
              .sort((a, b) => Number(a.minuto) - Number(b.minuto))
              .map((gol, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{gol.atleta}</span>
                  <span className="text-muted-foreground">{gol.minuto}&apos;</span>
                </li>
              ))}
          </ul>
        )}
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
      <span className="text-muted-foreground">{label}</span>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      ) : (
        <p className="font-medium">{value || "—"}</p>
      )}
    </label>
  );
}
