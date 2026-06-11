"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GolForm {
  atleta: string;
  minuto: string;
}

interface SetScore {
  a: string;
  b: string;
}

const initialEsporteForm = {
  esporte: "Volei",
  data: "",
  hora: "",
  diaSemana: "",
  campeonato: "",
  estadio: "",
  localizacao: "",
  fase: "",
  timeA: "",
  timeB: "",
  vencedor: "",
  info: "",
  placarFinalA: "",
  placarFinalB: "",
  pontosA: "",
  pontosB: "",
  melhorDe: "3",
};

const initialForm = {
  data: "",
  hora: "",
  diaSemana: "",
  campeonato: "",
  estadio: "",
  mando: "",
  gm: "",
  gs: "",
  adversario: "",
  info: "",
  resultado: "Vitória",
  fase: "",
  status: "",
  publico: "",
  pontos: "",
  ano: "",
  categoria: "profissional",
};

function faixaMinuto(minuto: number): string {
  if (minuto <= 15) return "0–15";
  if (minuto <= 30) return "16–30";
  if (minuto <= 45) return "31–45";
  if (minuto <= 60) return "46–60";
  if (minuto <= 75) return "61–75";
  if (minuto <= 89) return "76–89";
  return "90+";
}

export default function AdminPage() {
  const [form, setForm] = useState(initialForm);
  const [gols, setGols] = useState<GolForm[]>([]);
  const [status, setStatusMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof typeof initialForm, value: string) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

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

      const res = await fetch("/api/jogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar o jogo");
      }

      setStatusMsg("Jogo salvo com sucesso!");
      setForm(initialForm);
      setGols([]);
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSubmitting(false);
    }
  }

  const [esporteForm, setEsporteForm] = useState(initialEsporteForm);
  const [setsVolei, setSetsVolei] = useState<SetScore[]>([]);
  const [setsTenis, setSetsTenis] = useState<SetScore[]>([]);
  const [esporteStatus, setEsporteStatusMsg] = useState<string | null>(null);
  const [esporteSubmitting, setEsporteSubmitting] = useState(false);

  function updateEsporteField(
    field: keyof typeof initialEsporteForm,
    value: string
  ) {
    setEsporteForm((prev) => ({ ...prev, [field]: value }));
  }

  function addSetVolei() {
    setSetsVolei((prev) =>
      prev.length < 5 ? [...prev, { a: "", b: "" }] : prev
    );
  }

  function removeSetVolei(index: number) {
    setSetsVolei((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSetVolei(index: number, field: keyof SetScore, value: string) {
    setSetsVolei((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  }

  function addSetTenis() {
    setSetsTenis((prev) =>
      prev.length < 5 ? [...prev, { a: "", b: "" }] : prev
    );
  }

  function removeSetTenis(index: number) {
    setSetsTenis((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSetTenis(index: number, field: keyof SetScore, value: string) {
    setSetsTenis((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set))
    );
  }

  async function handleEsporteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEsporteSubmitting(true);
    setEsporteStatusMsg(null);

    try {
      let placarJson: string;

      if (esporteForm.esporte === "Volei") {
        placarJson = JSON.stringify({
          placarFinalA: Number(esporteForm.placarFinalA),
          placarFinalB: Number(esporteForm.placarFinalB),
          sets: setsVolei
            .filter((s) => s.a !== "" && s.b !== "")
            .map((s) => ({ a: Number(s.a), b: Number(s.b) })),
        });
      } else if (esporteForm.esporte === "Tenis") {
        placarJson = JSON.stringify({
          melhorDe: Number(esporteForm.melhorDe),
          sets: setsTenis
            .filter((s) => s.a !== "" && s.b !== "")
            .map((s) => ({ a: Number(s.a), b: Number(s.b) })),
        });
      } else {
        placarJson = JSON.stringify({
          pontosA: Number(esporteForm.pontosA),
          pontosB: Number(esporteForm.pontosB),
        });
      }

      const payload = {
        esporte: esporteForm.esporte,
        data: esporteForm.data,
        hora: esporteForm.hora,
        diaSemana: esporteForm.diaSemana,
        campeonato: esporteForm.campeonato,
        estadio: esporteForm.estadio,
        localizacao: esporteForm.localizacao,
        fase: esporteForm.fase,
        timeA: esporteForm.timeA,
        timeB: esporteForm.timeB,
        vencedor: esporteForm.vencedor,
        info: esporteForm.info || null,
        placarJson,
      };

      const res = await fetch("/api/esportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar o evento");
      }

      setEsporteStatusMsg("Evento salvo com sucesso!");
      setEsporteForm(initialEsporteForm);
      setSetsVolei([]);
      setSetsTenis([]);
    } catch (err) {
      setEsporteStatusMsg(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setEsporteSubmitting(false);
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
          backgroundImage: `url('/estadio.jpeg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }} className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Adicionar Jogo</h1>
        <p className="text-muted-foreground">
          Registre um novo jogo acompanhado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Data">
            <input
              type="date"
              required
              value={form.data}
              onChange={(e) => updateField("data", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Hora">
            <input
              type="time"
              required
              value={form.hora}
              onChange={(e) => updateField("hora", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Dia da Semana">
            <input
              type="text"
              required
              value={form.diaSemana}
              onChange={(e) => updateField("diaSemana", e.target.value)}
              className="input"
              placeholder="Domingo"
            />
          </Field>

          <Field label="Campeonato">
            <input
              type="text"
              required
              value={form.campeonato}
              onChange={(e) => updateField("campeonato", e.target.value)}
              className="input"
              placeholder="Brasileirão"
            />
          </Field>

          <Field label="Estádio">
            <input
              type="text"
              required
              value={form.estadio}
              onChange={(e) => updateField("estadio", e.target.value)}
              className="input"
              placeholder="Arena Corinthians"
            />
          </Field>

          <Field label="Mando">
            <input
              type="text"
              required
              value={form.mando}
              onChange={(e) => updateField("mando", e.target.value)}
              className="input"
              placeholder="Mandante"
            />
          </Field>

          <Field label="Adversário">
            <input
              type="text"
              required
              value={form.adversario}
              onChange={(e) => updateField("adversario", e.target.value)}
              className="input"
              placeholder="Palmeiras"
            />
          </Field>

          <Field label="Gols Marcados (GM)">
            <input
              type="number"
              required
              value={form.gm}
              onChange={(e) => updateField("gm", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Gols Sofridos (GS)">
            <input
              type="number"
              required
              value={form.gs}
              onChange={(e) => updateField("gs", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Resultado">
            <select
              value={form.resultado}
              onChange={(e) => updateField("resultado", e.target.value)}
              className="input"
            >
              <option value="Vitória">Vitória</option>
              <option value="Empate">Empate</option>
              <option value="Derrota">Derrota</option>
            </select>
          </Field>

          <Field label="Fase">
            <input
              type="text"
              required
              value={form.fase}
              onChange={(e) => updateField("fase", e.target.value)}
              className="input"
              placeholder="Pts Corridos"
            />
          </Field>

          <Field label="Status">
            <input
              type="text"
              required
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="input"
              placeholder="Pontos"
            />
          </Field>

          <Field label="Público">
            <input
              type="number"
              value={form.publico}
              onChange={(e) => updateField("publico", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Pontos">
            <input
              type="number"
              required
              value={form.pontos}
              onChange={(e) => updateField("pontos", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Ano">
            <input
              type="text"
              required
              value={form.ano}
              onChange={(e) => updateField("ano", e.target.value)}
              className="input"
              placeholder="2026"
            />
          </Field>

          <Field label="Categoria">
            <select
              value={form.categoria}
              onChange={(e) => updateField("categoria", e.target.value)}
              className="input"
            >
              <option value="profissional">Profissional</option>
              <option value="outros-corinthians">Outros Corinthians</option>
              <option value="outros-jogos">Outros Jogos</option>
            </select>
          </Field>

          <Field label="Informações" className="sm:col-span-2 lg:col-span-3">
            <input
              type="text"
              value={form.info}
              onChange={(e) => updateField("info", e.target.value)}
              className="input"
              placeholder="Gol Fulano e Sicrano"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Gols da Partida</h2>
            <button
              type="button"
              onClick={addGol}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary"
            >
              <Plus className="h-4 w-4" />
              Adicionar Gol
            </button>
          </div>

          {gols.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum gol adicionado.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {gols.map((gol, i) => (
                <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <Field label="Atleta" className="flex-1">
                    <input
                      type="text"
                      required
                      value={gol.atleta}
                      onChange={(e) => updateGol(i, "atleta", e.target.value)}
                      className="input"
                      placeholder="Nome do jogador"
                    />
                  </Field>

                  <Field label="Minuto" className="w-full sm:w-32">
                    <input
                      type="number"
                      required
                      min={0}
                      max={120}
                      value={gol.minuto}
                      onChange={(e) => updateGol(i, "minuto", e.target.value)}
                      className="input"
                    />
                  </Field>

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
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className={cn(
              "rounded-md bg-corinthians-red px-6 py-2 font-semibold text-white hover:bg-corinthians-red/90",
              submitting && "opacity-50"
            )}
          >
            {submitting ? "Salvando..." : "Salvar Jogo"}
          </button>

          {status && <p className="text-sm text-muted-foreground">{status}</p>}
        </div>
      </form>

      <div>
        <h1 className="text-3xl font-bold">Outros Esportes</h1>
        <p className="text-muted-foreground">
          Registre eventos de Vôlei, Basquete, Futebol Americano e Tênis
        </p>
      </div>

      <form onSubmit={handleEsporteSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Esporte">
            <select
              value={esporteForm.esporte}
              onChange={(e) => updateEsporteField("esporte", e.target.value)}
              className="input"
            >
              <option value="Volei">Vôlei</option>
              <option value="Basquete">Basquete</option>
              <option value="Futebol Americano">Futebol Americano</option>
              <option value="Tenis">Tênis</option>
            </select>
          </Field>

          <Field label="Data">
            <input
              type="date"
              required
              value={esporteForm.data}
              onChange={(e) => updateEsporteField("data", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Hora">
            <input
              type="time"
              required
              value={esporteForm.hora}
              onChange={(e) => updateEsporteField("hora", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Dia da Semana">
            <input
              type="text"
              required
              value={esporteForm.diaSemana}
              onChange={(e) => updateEsporteField("diaSemana", e.target.value)}
              className="input"
              placeholder="Domingo"
            />
          </Field>

          <Field label="Campeonato">
            <input
              type="text"
              required
              value={esporteForm.campeonato}
              onChange={(e) => updateEsporteField("campeonato", e.target.value)}
              className="input"
              placeholder="Superliga"
            />
          </Field>

          <Field label="Estádio / Ginásio">
            <input
              type="text"
              required
              value={esporteForm.estadio}
              onChange={(e) => updateEsporteField("estadio", e.target.value)}
              className="input"
              placeholder="Ginásio do Ibirapuera"
            />
          </Field>

          <Field label="Localização">
            <input
              type="text"
              required
              value={esporteForm.localizacao}
              onChange={(e) => updateEsporteField("localizacao", e.target.value)}
              className="input"
              placeholder="São Paulo, SP"
            />
          </Field>

          <Field label="Fase">
            <input
              type="text"
              required
              value={esporteForm.fase}
              onChange={(e) => updateEsporteField("fase", e.target.value)}
              className="input"
              placeholder="Final"
            />
          </Field>

          <Field label="Time A">
            <input
              type="text"
              required
              value={esporteForm.timeA}
              onChange={(e) => updateEsporteField("timeA", e.target.value)}
              className="input"
              placeholder="Sesi-SP"
            />
          </Field>

          <Field label="Time B">
            <input
              type="text"
              required
              value={esporteForm.timeB}
              onChange={(e) => updateEsporteField("timeB", e.target.value)}
              className="input"
              placeholder="Sada Cruzeiro"
            />
          </Field>

          <Field label="Vencedor">
            <input
              type="text"
              required
              value={esporteForm.vencedor}
              onChange={(e) => updateEsporteField("vencedor", e.target.value)}
              className="input"
              placeholder="Sesi-SP"
            />
          </Field>

          <Field label="Informações" className="sm:col-span-2 lg:col-span-3">
            <input
              type="text"
              value={esporteForm.info}
              onChange={(e) => updateEsporteField("info", e.target.value)}
              className="input"
              placeholder="Observações sobre o evento"
            />
          </Field>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">Placar</h2>

          {esporteForm.esporte === "Volei" && (
            <>
              <div className="flex items-center gap-3">
                <Field label="Sets Time A">
                  <input
                    type="number"
                    required
                    min={0}
                    max={5}
                    value={esporteForm.placarFinalA}
                    onChange={(e) =>
                      updateEsporteField("placarFinalA", e.target.value)
                    }
                    className="input w-24"
                  />
                </Field>
                <span className="pt-6">x</span>
                <Field label="Sets Time B">
                  <input
                    type="number"
                    required
                    min={0}
                    max={5}
                    value={esporteForm.placarFinalB}
                    onChange={(e) =>
                      updateEsporteField("placarFinalB", e.target.value)
                    }
                    className="input w-24"
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Sets</h3>
                  <button
                    type="button"
                    onClick={addSetVolei}
                    disabled={setsVolei.length >= 5}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Set
                  </button>
                </div>

                {setsVolei.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum set adicionado.
                  </p>
                ) : (
                  setsVolei.map((set, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 text-sm text-muted-foreground">
                        Set {i + 1}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={set.a}
                        onChange={(e) => updateSetVolei(i, "a", e.target.value)}
                        className="input w-20"
                        placeholder="A"
                      />
                      <span>x</span>
                      <input
                        type="number"
                        min={0}
                        value={set.b}
                        onChange={(e) => updateSetVolei(i, "b", e.target.value)}
                        className="input w-20"
                        placeholder="B"
                      />
                      <button
                        type="button"
                        onClick={() => removeSetVolei(i)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-corinthians-red hover:bg-secondary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {(esporteForm.esporte === "Basquete" ||
            esporteForm.esporte === "Futebol Americano") && (
            <div className="flex items-center gap-3">
              <Field label="Pontos Time A">
                <input
                  type="number"
                  required
                  min={0}
                  value={esporteForm.pontosA}
                  onChange={(e) => updateEsporteField("pontosA", e.target.value)}
                  className="input w-24"
                />
              </Field>
              <span className="pt-6">x</span>
              <Field label="Pontos Time B">
                <input
                  type="number"
                  required
                  min={0}
                  value={esporteForm.pontosB}
                  onChange={(e) => updateEsporteField("pontosB", e.target.value)}
                  className="input w-24"
                />
              </Field>
            </div>
          )}

          {esporteForm.esporte === "Tenis" && (
            <>
              <Field label="Melhor de" className="w-40">
                <select
                  value={esporteForm.melhorDe}
                  onChange={(e) => updateEsporteField("melhorDe", e.target.value)}
                  className="input"
                >
                  <option value="3">3 sets</option>
                  <option value="5">5 sets</option>
                </select>
              </Field>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Sets (games)</h3>
                  <button
                    type="button"
                    onClick={addSetTenis}
                    disabled={setsTenis.length >= 5}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Set
                  </button>
                </div>

                {setsTenis.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum set adicionado.
                  </p>
                ) : (
                  setsTenis.map((set, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-16 text-sm text-muted-foreground">
                        Set {i + 1}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={set.a}
                        onChange={(e) => updateSetTenis(i, "a", e.target.value)}
                        className="input w-20"
                        placeholder="A"
                      />
                      <span>x</span>
                      <input
                        type="number"
                        min={0}
                        value={set.b}
                        onChange={(e) => updateSetTenis(i, "b", e.target.value)}
                        className="input w-20"
                        placeholder="B"
                      />
                      <button
                        type="button"
                        onClick={() => removeSetTenis(i)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-corinthians-red hover:bg-secondary"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={esporteSubmitting}
            className={cn(
              "rounded-md bg-corinthians-red px-6 py-2 font-semibold text-white hover:bg-corinthians-red/90",
              esporteSubmitting && "opacity-50"
            )}
          >
            {esporteSubmitting ? "Salvando..." : "Salvar Evento"}
          </button>

          {esporteStatus && (
            <p className="text-sm text-muted-foreground">{esporteStatus}</p>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
