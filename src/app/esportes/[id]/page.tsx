"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { hasAdminSession } from "@/lib/client-auth";
import {
  OutroEsporte,
  PlacarPontos,
  PlacarTenis,
  PlacarVolei,
} from "@/types/esporte";

interface SetForm {
  a: string;
  b: string;
}

const MAX_SETS = 5;

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

function PlacarView({ esporte, placarJson }: { esporte: string; placarJson: string }) {
  let placar;
  try {
    placar = JSON.parse(placarJson);
  } catch {
    return null;
  }

  if (esporte === "Tênis") {
    const { melhorDe, sets } = placar as PlacarTenis;
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Melhor de {melhorDe}</p>
        <p className="text-2xl font-bold">
          {sets.map((set, i) => (
            <span key={i}>
              {i > 0 && ", "}
              {set.a}-{set.b}
            </span>
          ))}
        </p>
      </div>
    );
  }

  if (esporte === "Vôlei") {
    const { setsA, setsB, sets } = placar as PlacarVolei;
    return (
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-bold">
          {setsA} - {setsB}
        </p>
        {sets.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {sets.map((set, i) => (
              <span key={i}>
                {i > 0 && ", "}
                {set.a}-{set.b}
              </span>
            ))}
          </p>
        )}
      </div>
    );
  }

  const { pontosA, pontosB } = placar as PlacarPontos;
  return (
    <p className="text-3xl font-bold">
      {pontosA} - {pontosB}
    </p>
  );
}

export default function EsporteDetailPage() {
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

  const [evento, setEvento] = useState<OutroEsporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Record<string, string>>({});
  const [melhorDe, setMelhorDe] = useState("3");
  const [setsVencidosA, setSetsVencidosA] = useState("");
  const [setsVencidosB, setSetsVencidosB] = useState("");
  const [pontosA, setPontosA] = useState("");
  const [pontosB, setPontosB] = useState("");
  const [sets, setSets] = useState<SetForm[]>([]);

  useEffect(() => {
    fetch(`/api/esportes/${id}`)
      .then((res) => res.json())
      .then((data: OutroEsporte) => {
        setEvento(data);
        setForm({
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

        try {
          const placar = JSON.parse(data.placarJson);

          if (data.esporte === "Tênis") {
            const { melhorDe: md, sets: s } = placar as PlacarTenis;
            setMelhorDe(String(md));
            setSets(s.map((set) => ({ a: String(set.a), b: String(set.b) })));
          } else if (data.esporte === "Vôlei") {
            const { setsA, setsB, sets: s } = placar as PlacarVolei;
            setSetsVencidosA(String(setsA));
            setSetsVencidosB(String(setsB));
            setSets(s.map((set) => ({ a: String(set.a), b: String(set.b) })));
          } else {
            const { pontosA: pa, pontosB: pb } = placar as PlacarPontos;
            setPontosA(String(pa));
            setPontosB(String(pb));
          }
        } catch {
          // placar inválido, mantém valores padrão
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSet() {
    setSets((prev) =>
      prev.length < MAX_SETS ? [...prev, { a: "", b: "" }] : prev
    );
  }

  function removeSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSet(index: number, field: keyof SetForm, value: string) {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  }

  async function handleSave() {
    if (!evento) return;

    setSaving(true);
    setError(null);

    try {
      let placar: Record<string, unknown>;

      if (evento.esporte === "Tênis") {
        placar = {
          melhorDe: Number(melhorDe),
          sets: sets.map((s) => ({ a: Number(s.a), b: Number(s.b) })),
        };
      } else if (evento.esporte === "Vôlei") {
        placar = {
          setsA: Number(setsVencidosA),
          setsB: Number(setsVencidosB),
          sets: sets.map((s) => ({ a: Number(s.a), b: Number(s.b) })),
        };
      } else {
        placar = {
          pontosA: Number(pontosA),
          pontosB: Number(pontosB),
        };
      }

      const payload = {
        esporte: evento.esporte,
        ...form,
        info: form.info || null,
        placarJson: JSON.stringify(placar),
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
    <div className="relative">
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
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }} className="flex flex-col gap-8">
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

        <div className="flex flex-col gap-2">
          <span
            className={cn(
              "w-fit rounded-full border px-2 py-1 text-xs font-bold",
              esporteCor(evento.esporte)
            )}
          >
            {evento.esporte}
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
          <Field label="Fase" editing={editing} value={form.fase} onChange={(v) => updateField("fase", v)} />
          <Field label="Estádio" editing={editing} value={form.estadio} onChange={(v) => updateField("estadio", v)} />
          <Field label="Localização" editing={editing} value={form.localizacao} onChange={(v) => updateField("localizacao", v)} />
          <Field label="Time A" editing={editing} value={form.timeA} onChange={(v) => updateField("timeA", v)} />
          <Field label="Time B" editing={editing} value={form.timeB} onChange={(v) => updateField("timeB", v)} />
          <Field label="Vencedor" editing={editing} value={form.vencedor} onChange={(v) => updateField("vencedor", v)} />
          <Field label="Informações" editing={editing} value={form.info} onChange={(v) => updateField("info", v)} className="sm:col-span-2 lg:col-span-3" />
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Placar</h2>

          {!editing && <PlacarView esporte={evento.esporte} placarJson={evento.placarJson} />}

          {editing && evento.esporte === "Tênis" && (
            <div className="flex flex-col gap-4">
              <Field label="Melhor de" editing className="w-32">
                <select
                  value={melhorDe}
                  onChange={(e) => setMelhorDe(e.target.value)}
                  className="input"
                >
                  <option value="3">3</option>
                  <option value="5">5</option>
                </select>
              </Field>

              <SetList
                sets={sets}
                labelA={form.timeA || "Time A"}
                labelB={form.timeB || "Time B"}
                onAdd={addSet}
                onRemove={removeSet}
                onUpdate={updateSet}
              />
            </div>
          )}

          {editing && evento.esporte === "Vôlei" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`Sets vencidos (${form.timeA || "Time A"})`} editing>
                  <input
                    type="number"
                    min={0}
                    value={setsVencidosA}
                    onChange={(e) => setSetsVencidosA(e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label={`Sets vencidos (${form.timeB || "Time B"})`} editing>
                  <input
                    type="number"
                    min={0}
                    value={setsVencidosB}
                    onChange={(e) => setSetsVencidosB(e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <SetList
                sets={sets}
                labelA={form.timeA || "Time A"}
                labelB={form.timeB || "Time B"}
                onAdd={addSet}
                onRemove={removeSet}
                onUpdate={updateSet}
              />
            </div>
          )}

          {editing &&
            (evento.esporte === "Basquete" || evento.esporte === "Futebol Americano") && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`Pontos (${form.timeA || "Time A"})`} editing>
                  <input
                    type="number"
                    min={0}
                    value={pontosA}
                    onChange={(e) => setPontosA(e.target.value)}
                    className="input"
                  />
                </Field>

                <Field label={`Pontos (${form.timeB || "Time B"})`} editing>
                  <input
                    type="number"
                    min={0}
                    value={pontosB}
                    onChange={(e) => setPontosB(e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function Field(
  props:
    | {
        label: string;
        value: string;
        editing: boolean;
        onChange: (value: string) => void;
        type?: string;
        className?: string;
        children?: undefined;
      }
    | {
        label: string;
        editing: true;
        children: React.ReactNode;
        className?: string;
        value?: undefined;
        onChange?: undefined;
        type?: undefined;
      }
) {
  const { label, className } = props;

  if (props.children !== undefined) {
    return (
      <label className={cn("flex flex-col gap-1 text-sm", className)}>
        <span className="text-muted-foreground">{label}</span>
        {props.children}
      </label>
    );
  }

  const { value, editing, onChange, type = "text" } = props;

  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      {editing ? (
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

function SetList({
  sets,
  labelA,
  labelB,
  onAdd,
  onRemove,
  onUpdate,
}: {
  sets: SetForm[];
  labelA: string;
  labelB: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof SetForm, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Placar por set (até {MAX_SETS})
        </span>
        <button
          type="button"
          onClick={onAdd}
          disabled={sets.length >= MAX_SETS}
          className={cn(
            "flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary",
            sets.length >= MAX_SETS && "opacity-50"
          )}
        >
          <Plus className="h-4 w-4" />
          Adicionar Set
        </button>
      </div>

      {sets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum set adicionado.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sets.map((set, i) => (
            <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label={`Set ${i + 1} — ${labelA}`} editing className="flex-1">
                <input
                  type="number"
                  required
                  min={0}
                  value={set.a}
                  onChange={(e) => onUpdate(i, "a", e.target.value)}
                  className="input"
                />
              </Field>

              <Field label={`Set ${i + 1} — ${labelB}`} editing className="flex-1">
                <input
                  type="number"
                  required
                  min={0}
                  value={set.b}
                  onChange={(e) => onUpdate(i, "b", e.target.value)}
                  className="input"
                />
              </Field>

              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-corinthians-red hover:bg-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
