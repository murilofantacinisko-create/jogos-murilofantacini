import { jogosProfissional, jogosOutros } from "@/data/jogos";
import { Trophy, Goal, CalendarDays, Shield } from "lucide-react";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-corinthians-red/20 text-corinthians-red">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const totalJogos = jogosProfissional.length;

  const vitorias = jogosProfissional.filter(
    (j) => j.placarCorinthians > j.placarAdversario
  ).length;
  const empates = jogosProfissional.filter(
    (j) => j.placarCorinthians === j.placarAdversario
  ).length;
  const derrotas = jogosProfissional.filter(
    (j) => j.placarCorinthians < j.placarAdversario
  ).length;

  const aproveitamento =
    totalJogos > 0
      ? Math.round(((vitorias * 3 + empates) / (totalJogos * 3)) * 100)
      : 0;

  const totalGols = jogosProfissional.reduce(
    (acc, j) => acc + j.placarCorinthians,
    0
  );

  const totalOutrosJogos = jogosOutros.length;

  const ultimosJogos = [...jogosProfissional]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumo geral dos jogos acompanhados
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jogos Acompanhados" value={totalJogos} icon={CalendarDays} />
        <StatCard label="Vitórias" value={vitorias} icon={Trophy} />
        <StatCard label="Aproveitamento" value={`${aproveitamento}%`} icon={Shield} />
        <StatCard label="Gols do Corinthians" value={totalGols} icon={Goal} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Vitórias</p>
          <p className="text-2xl font-bold text-corinthians-white">{vitorias}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Empates</p>
          <p className="text-2xl font-bold text-corinthians-white">{empates}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Derrotas</p>
          <p className="text-2xl font-bold text-corinthians-white">{derrotas}</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Últimos Jogos</h2>
        {ultimosJogos.length === 0 ? (
          <p className="text-muted-foreground">
            Nenhum jogo registrado ainda. Adicione jogos em{" "}
            <code className="rounded bg-secondary px-1 py-0.5">
              src/data/jogos.ts
            </code>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {ultimosJogos.map((jogo) => (
              <li
                key={jogo.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="font-medium">
                    Corinthians {jogo.mandante ? "x" : "vs"} {jogo.adversario}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {jogo.competicao} • {jogo.data}
                  </p>
                </div>
                <p className="text-lg font-bold">
                  {jogo.placarCorinthians} - {jogo.placarAdversario}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-2 text-xl font-semibold">Outros Jogos</h2>
        <p className="text-muted-foreground">
          {totalOutrosJogos === 0
            ? "Nenhum outro jogo registrado ainda."
            : `${totalOutrosJogos} jogo(s) registrado(s).`}
        </p>
      </div>
    </div>
  );
}
