"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Jogo } from "@/types/jogo";

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

export default function OutrosJogoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const id = params.id as string;

  function requireAuth(): boolean {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
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
      })
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
        gols: jogo?.gols.map((g) => ({
          atleta: g.atleta,
          minuto: g.minuto,
          faixaMinuto: g.faixaMinuto,
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
      router.push("/outros");
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
          onClick={() => router.push("/outros")}
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
            ? `${jogo.mando} x ${jogo.adversario}`
            : `${jogo.adversario} x ${jogo.mando}`}
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
