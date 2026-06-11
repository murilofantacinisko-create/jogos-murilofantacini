"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

function JogoCard({ jogo }: { jogo: Jogo }) {
  return (
    <Link
      href={`/outros/${jogo.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-secondary"
    >
      <p className="text-sm text-muted-foreground">
        {jogo.data} • {jogo.campeonato}
      </p>
      <p className="text-lg font-semibold">
        {jogo.mando} x {jogo.adversario}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold">
          {jogo.gm} - {jogo.gs}
        </p>
        <span
          className={cn(
            "rounded-full border px-2 py-1 text-xs font-bold",
            resultadoCor(jogo.resultado)
          )}
        >
          {jogo.resultado}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{jogo.estadio}</p>
      {jogo.info && <p className="text-sm text-muted-foreground">{jogo.info}</p>}
      {jogo.publico !== null && (
        <p className="text-sm text-muted-foreground">
          Público: {jogo.publico.toLocaleString("pt-BR")}
        </p>
      )}
    </Link>
  );
}

function JogosGrid({ titulo, jogos }: { titulo: string; jogos: Jogo[] }) {
  const ordenados = [...jogos].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      {ordenados.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Nenhum jogo registrado ainda. Adicione jogos em /admin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordenados.map((jogo) => (
            <JogoCard key={jogo.id} jogo={jogo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OutrosPage() {
  const [outrosCorinthians, setOutrosCorinthians] = useState<Jogo[]>([]);
  const [outrosJogos, setOutrosJogos] = useState<Jogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/jogos?categoria=outros-corinthians").then((res) => res.json()),
      fetch("/api/jogos?categoria=outros-jogos").then((res) => res.json()),
    ])
      .then(([corinthians, jogos]) => {
        setOutrosCorinthians(corinthians);
        setOutrosJogos(jogos);
      })
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="text-3xl font-bold">Outros Jogos</h1>
          <p className="text-muted-foreground">
            Outros jogos acompanhados, fora do profissional do Corinthians
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : (
          <>
            <JogosGrid titulo="Outros Corinthians" jogos={outrosCorinthians} />
            <JogosGrid titulo="Outros Jogos" jogos={outrosJogos} />
          </>
        )}
      </div>
    </div>
  );
}
