import { outrosCorinthians, outrosJogos, OutroCorinthians, OutroJogo } from "@/data/jogos";
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

function JogoCard({ jogo }: { jogo: OutroCorinthians | OutroJogo }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">
        {jogo.DATA} • {jogo.CAMPEONATO}
      </p>
      <p className="text-lg font-semibold">
        {jogo.MANDANTE} x {jogo.VISITANTE}
      </p>
      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold">
          {jogo.GM} - {jogo.GS}
        </p>
        <span
          className={cn(
            "rounded-full border px-2 py-1 text-xs font-bold",
            resultadoCor(jogo.RESULTADO)
          )}
        >
          {jogo.RESULTADO}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{jogo["ESTÁDIO"]}</p>
      {jogo.INFO && (
        <p className="text-sm text-muted-foreground">{jogo.INFO}</p>
      )}
      {jogo["PÚBLICO"] !== null && jogo["PÚBLICO"] !== undefined && (
        <p className="text-sm text-muted-foreground">
          Público: {jogo["PÚBLICO"].toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}

function JogosGrid({
  titulo,
  jogos,
}: {
  titulo: string;
  jogos: (OutroCorinthians | OutroJogo)[];
}) {
  const ordenados = [...jogos].sort(
    (a, b) => new Date(b.DATA).getTime() - new Date(a.DATA).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      {ordenados.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-muted-foreground">Nenhum jogo registrado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordenados.map((jogo, i) => (
            <JogoCard key={i} jogo={jogo} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OutrosPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Outros Jogos</h1>
        <p className="text-muted-foreground">
          Outros jogos acompanhados, fora do profissional do Corinthians
        </p>
      </div>

      <JogosGrid titulo="Outros Corinthians" jogos={outrosCorinthians} />
      <JogosGrid titulo="Outros Jogos" jogos={outrosJogos} />
    </div>
  );
}
