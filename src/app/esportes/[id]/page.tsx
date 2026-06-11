"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  OutroEsporte,
  PlacarBasquete,
  PlacarFutebolAmericano,
  PlacarTenis,
  PlacarVolei,
} from "@/types/esporte";
import { parsePlacarJson } from "@/lib/placar";

interface SetScore {
  a: string;
  b: string;
}

const ESPORTE_LABELS: Record<string, string> = {
  Volei: "Vôlei",
  Basquete: "Basquete",
  "Futebol Americano": "Futebol Americano",
  Tenis: "Tênis",
};

export default function EsporteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [evento, setEvento] = useState<OutroEsporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const [placarFinalA, setPlacarFinalA] = useState("");
  const [placarFinalB, setPlacarFinalB] = useState("");
  const [pontosA, setPontosA] = useState("");
  const [pontosB, setPontosB] = useState("");
  const [melhorDe, setMelhorDe] = useState("3");
  const [sets, setSets] = useState<SetScore[]>([]);

  useEffect(() => {
    fetch(`/api/esportes/${id}`)
      .then((res) => res.json())
      .then((data: OutroEsporte) => {
        setEvento(data);
        setForm({
          esporte: data.esporte,
          data: data.data,
          hora: data.hora,
          diaSemana: data.diaSemana,
          campeonato: data.campeonato,
          estadio: data.estadio,
          localizacao: data.localizacao,
          fase: data.fase,
          timeA: data.timeA,
          timeB: data.timeB,
          vencedor: data.vencedor,
          info: data.info ?? "",
        });

        const placar = parsePlacarJson(data.placarJson);
        if (data.esporte === "Volei") {
          const p = placar as PlacarVolei;
          setPlacarFinalA(String(p?.placarFinalA ?? ""));
          setPlacarFinalB(String(p?.placarFinalB ?? ""));
          setSets(
            (p?.sets ?? []).map((s) => ({ a: String(s.a), b: String(s.b) }))
          );
        } else if (data.esporte === "Tenis") {
          const p = placar as PlacarTenis;
          setMelhorDe(String(p?.melhorDe ?? "3"));
          setSets(
            (p?.sets ?? []).map((s) => ({ a: String(s.a), b: String(s.b) }))
          );
        } else {
          const p = placar as PlacarBasquete | PlacarFutebolAmericano;
          setPontosA(String(p?.pontosA ?? ""));
          setPontosB(String(p?.pontosB ?? ""));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSet() {
    setSets((prev) => (prev.length < 5 ? [...prev, { a: "", b: "" }] : prev));
  }

  function removeSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSet(index: number, field: keyof SetScore, value: string) {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  }

  async function handleSave() {
    if (!evento) return;
    setSaving(true);
    setError(null);

    try {
      let placarJson: string;

      if (form.esporte === "Volei") {
        placarJson = JSON.stringify({
          placarFinalA: Number(placarFinalA),
          placarFinalB: Number(placarFinalB),
          sets: sets
            .filter((s) => s.a !== "" && s.b !== "")
            .map((s) => ({ a: Number(s.a), b: Number(s.b) })),
        });
      } else if (form.esporte === "Tenis") {
        placarJson = JSON.stringify({
          melhorDe: Number(melhorDe),
          sets: sets
            .filter((s) => s.a !== "" && s.b !== "")
            .map((s) => ({ a: Number(s.a), b: Number(s.b) })),
        });
      } else {
        placarJson = JSON.stringify({
          pontosA: Number(pontosA),
          pontosB: Number(pontosB),
        });
      }

      const payload = {
        ...form,
        info: form.info || null,
        placarJson,
      };

      const res = await fetch(`/api/esportes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar o evento");

      const updated: OutroEsporte = await res.json();
      setEvento(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    const res = await fetch(`/api/esportes/${id}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/outros");
    } else {
      setError("Erro ao excluir o evento");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Carregando...</p>;
  }

  if (!evento) {
    return <p className="text-muted-foreground">Evento não encontrado.</p>;
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
              onClick={() => setEditing(true)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary"
            >
              Editar
            </button>
          )}

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 rounded-md border border-corinthians-red px-4 py-2 text-sm font-semibold text-corinthians-red hover:bg-corinthians-red/10"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </button>
        </div>
      </div>

      <div>
        <span className="mb-2 inline-block w-fit rounded-full border border-corinthians-red/50 bg-corinthians-red/30 px-2 py-1 text-xs font-bold text-red-400">
          {ESPORTE_LABELS[evento.esporte] ?? evento.esporte}
        </span>
        <h1 className="text-3xl font-bold">
          {evento.timeA} x {evento.timeB}
        </h1>
        <p className="text-muted-foreground">
          {evento.data} • {evento.campeonato}
        </p>
      </div>

      {error && <p className="text-sm text-corinthians-red">{error}</p>}

      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Data" editing={editing} type="date" value={form.data} onChange={(v) => updateField("data", v)} />
        <Field label="Hora" editing={editing} type="time" value={form.hora} onChange={(v) => updateField("hora", v)} />
        <Field label="Dia da Semana" editing={editing} value={form.diaSemana} onChange={(v) => updateField("diaSemana", v)} />
        <Field label="Campeonato" editing={editing} value={form.campeonato} onChange={(v) => updateField("campeonato", v)} />
        <Field label="Estádio / Ginásio" editing={editing} value={form.estadio} onChange={(v) => updateField("estadio", v)} />
        <Field label="Localização" editing={editing} value={form.localizacao} onChange={(v) => updateField("localizacao", v)} />
        <Field label="Fase" editing={editing} value={form.fase} onChange={(v) => updateField("fase", v)} />
        <Field label="Time A" editing={editing} value={form.timeA} onChange={(v) => updateField("timeA", v)} />
        <Field label="Time B" editing={editing} value={form.timeB} onChange={(v) => updateField("timeB", v)} />
        <Field label="Vencedor" editing={editing} value={form.vencedor} onChange={(v) => updateField("vencedor", v)} />
        <Field label="Informações" editing={editing} value={form.info} onChange={(v) => updateField("info", v)} className="sm:col-span-2 lg:col-span-3" />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Placar</h2>

        {form.esporte === "Volei" && (
          <>
            <div className="flex items-center gap-3">
              <Field label="Sets Time A" editing={editing} type="number" value={placarFinalA} onChange={setPlacarFinalA} className="w-24" />
              <span className="pt-6">x</span>
              <Field label="Sets Time B" editing={editing} type="number" value={placarFinalB} onChange={setPlacarFinalB} className="w-24" />
            </div>

            <SetsEditor
              sets={sets}
              editing={editing}
              onAdd={addSet}
              onRemove={removeSet}
              onUpdate={updateSet}
              labelPrefix="Set"
            />
          </>
        )}

        {(form.esporte === "Basquete" || form.esporte === "Futebol Americano") && (
          <div className="flex items-center gap-3">
            <Field label="Pontos Time A" editing={editing} type="number" value={pontosA} onChange={setPontosA} className="w-24" />
            <span className="pt-6">x</span>
            <Field label="Pontos Time B" editing={editing} type="number" value={pontosB} onChange={setPontosB} className="w-24" />
          </div>
        )}

        {form.esporte === "Tenis" && (
          <>
            <Field label="Melhor de" editing={editing} className="w-40">
              {editing ? (
                <select
                  value={melhorDe}
                  onChange={(e) => setMelhorDe(e.target.value)}
                  className="input"
                >
                  <option value="3">3 sets</option>
                  <option value="5">5 sets</option>
                </select>
              ) : (
                <p className="font-medium">{melhorDe} sets</p>
              )}
            </Field>

            <SetsEditor
              sets={sets}
              editing={editing}
              onAdd={addSet}
              onRemove={removeSet}
              onUpdate={updateSet}
              labelPrefix="Set"
            />
          </>
        )}
      </div>
    </div>
  );
}

function SetsEditor({
  sets,
  editing,
  onAdd,
  onRemove,
  onUpdate,
  labelPrefix,
}: {
  sets: SetScore[];
  editing: boolean;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof SetScore, value: string) => void;
  labelPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Sets</h3>
        {editing && (
          <button
            type="button"
            onClick={onAdd}
            disabled={sets.length >= 5}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Adicionar Set
          </button>
        )}
      </div>

      {sets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum set registrado.</p>
      ) : editing ? (
        <div className="flex flex-col gap-2">
          {sets.map((set, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-16 text-sm text-muted-foreground">
                {labelPrefix} {i + 1}
              </span>
              <input
                type="number"
                min={0}
                value={set.a}
                onChange={(e) => onUpdate(i, "a", e.target.value)}
                className="input w-20"
                placeholder="A"
              />
              <span>x</span>
              <input
                type="number"
                min={0}
                value={set.b}
                onChange={(e) => onUpdate(i, "b", e.target.value)}
                className="input w-20"
                placeholder="B"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-corinthians-red hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {sets.map((set, i) => (
            <li
              key={i}
              className="rounded-md border border-border px-3 py-1.5 text-sm"
            >
              {labelPrefix} {i + 1}: {set.a} x {set.b}
            </li>
          ))}
        </ul>
      )}
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
  children,
}: {
  label: string;
  value?: string;
  editing: boolean;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      {children ? (
        children
      ) : editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="input"
        />
      ) : (
        <p className="font-medium">{value || "—"}</p>
      )}
    </label>
  );
}
