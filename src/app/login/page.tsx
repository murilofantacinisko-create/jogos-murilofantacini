"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (res?.error) {
      setError("Usuário ou senha inválidos");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <img
            src="/sccp.png"
            alt="SCCP"
            style={{ width: 56, height: 56, objectFit: "contain", borderRadius: "50%" }}
          />
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-muted-foreground">
            Acesse para editar ou excluir jogos
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Usuário</span>
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Senha</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>

          {error && <p className="text-sm text-corinthians-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-corinthians-red px-4 py-2 text-sm font-semibold text-white hover:bg-corinthians-red/90 disabled:opacity-50"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
