import { jogosOutros } from "@/data/jogos";

export default function OutrosPage() {
  const jogos = [...jogosOutros].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Outros Jogos</h1>
        <p className="text-muted-foreground">
          Outros jogos acompanhados, fora do profissional do Corinthians
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {jogos.map((jogo) => (
            <div
              key={jogo.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6"
            >
              <p className="text-sm text-muted-foreground">
                {jogo.data} • {jogo.competicao}
              </p>
              <p className="text-lg font-semibold">
                {jogo.mandante} x {jogo.visitante}
              </p>
              <p className="text-2xl font-bold">{jogo.placar}</p>
              <p className="text-sm text-muted-foreground">{jogo.estadio}</p>
              {jogo.observacoes && (
                <p className="text-sm text-muted-foreground">
                  {jogo.observacoes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
