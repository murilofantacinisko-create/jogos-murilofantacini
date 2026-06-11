"use client";

import { useMemo, useState } from "react";
import { jogadosProfissional } from "@/data/jogos";
import { cn } from "@/lib/utils";

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

export default function ProfissionalPage() {
  const [campeonato, setCampeonato] = useState("Todos");
  const [resultado, setResultado] = useState("Todos");
  const [ano, setAno] = useState("Todos");

  const campeonatos = useMemo(
    () =>
      Array.from(new Set(jogadosProfissional.map((j) => j.CAMPEONATO))).sort(),
    []
  );
  const anos = useMemo(
    () =>
      Array.from(new Set(jogadosProfissional.map((j) => j.ANO))).sort(
        (a, b) => b.localeCompare(a)
      ),
    []
  );

  const jogos = useMemo(() => {
    return [...jogadosProfissional]
      .filter((j) => campeonato === "Todos" || j.CAMPEONATO === campeonato)
      .filter((j) => resultado === "Todos" || j.RESULTADO === resultado)
      .filter((j) => ano === "Todos" || j.ANO === ano)
      .sort((a, b) => new Date(b.DATA).getTime() - new Date(a.DATA).getTime());
  }, [campeonato, resultado, ano]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Profissional</h1>
        <p className="text-muted-foreground">
          Jogos do Corinthians acompanhados ao vivo ou pela TV
        </p>
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
            {jogos.map((jogo) => (
              <tr key={jogo.ID_JOGO} className="border-b border-border last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">{jogo.DATA}</td>
                <td className="px-4 py-3">{jogo.ADVERSÁRIO}</td>
                <td className="px-4 py-3 font-semibold">
                  {jogo.GM} x {jogo.GS}
                </td>
                <td className="px-4 py-3">{jogo["ESTÁDIO"]}</td>
                <td className="px-4 py-3">{jogo.CAMPEONATO}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-1 text-xs font-bold",
                      resultadoCor(jogo.RESULTADO)
                    )}
                  >
                    {jogo.RESULTADO}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {jogos.length === 0 && (
          <p className="p-6 text-muted-foreground">
            Nenhum jogo encontrado com os filtros selecionados.
          </p>
        )}
      </div>
    </div>
  );
}
