import { jogosProfissional } from "@/data/jogos";
import { cn } from "@/lib/utils";

function resultadoCorinthians(placarCor: number, placarAdv: number) {
  if (placarCor > placarAdv) return "V";
  if (placarCor < placarAdv) return "D";
  return "E";
}

function resultadoCor(resultado: string) {
  switch (resultado) {
    case "V":
      return "bg-green-700/30 text-green-400 border-green-700/50";
    case "D":
      return "bg-corinthians-red/30 text-red-400 border-corinthians-red/50";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
}

export default function ProfissionalPage() {
  const jogos = [...jogosProfissional].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Profissional</h1>
        <p className="text-muted-foreground">
          Jogos do Corinthians acompanhados ao vivo ou pela TV
        </p>
      </div>

      {jogos.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Nenhum jogo registrado ainda. Adicione jogos em{" "}
            <code className="rounded bg-secondary px-1 py-0.5">
              src/data/jogos.ts
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {jogos.map((jogo) => {
            const resultado = resultadoCorinthians(
              jogo.placarCorinthians,
              jogo.placarAdversario
            );

            return (
              <div
                key={jogo.id}
                className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">
                    {jogo.data} • {jogo.competicao} • {jogo.estadio}
                  </p>
                  <p className="text-lg font-semibold">
                    {jogo.mandante
                      ? `Corinthians x ${jogo.adversario}`
                      : `${jogo.adversario} x Corinthians`}
                  </p>
                  {jogo.publico !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      Público: {jogo.publico.toLocaleString("pt-BR")}
                    </p>
                  )}
                  {jogo.observacoes && (
                    <p className="text-sm text-muted-foreground">
                      {jogo.observacoes}
                    </p>
                  )}
                  {jogo.gols && jogo.gols.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Gols:{" "}
                      {jogo.gols
                        .map((g) => `${g.jogador} (${g.minuto}')`)
                        .join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-2xl font-bold">
                    {jogo.placarCorinthians} - {jogo.placarAdversario}
                  </p>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold",
                      resultadoCor(resultado)
                    )}
                  >
                    {resultado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
