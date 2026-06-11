import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const categoria = request.nextUrl.searchParams.get("categoria");

  const jogos = await prisma.jogo.findMany({
    where: categoria ? { categoria } : undefined,
    include: { gols: true },
    orderBy: { data: "desc" },
  });

  return NextResponse.json(jogos);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    data,
    hora,
    diaSemana,
    campeonato,
    estadio,
    mando,
    gm,
    gs,
    adversario,
    info,
    resultado,
    fase,
    status,
    publico,
    pontos,
    ano,
    categoria,
    gols,
  } = body;

  const jogo = await prisma.jogo.create({
    data: {
      data,
      hora,
      diaSemana,
      campeonato,
      estadio,
      mando,
      gm,
      gs,
      adversario,
      info: info || null,
      resultado,
      fase,
      status,
      publico: publico ?? null,
      pontos,
      ano,
      categoria: categoria || "profissional",
      gols: {
        create: (gols ?? []).map((gol: { atleta: string; minuto: number; faixaMinuto: string }) => ({
          atleta: gol.atleta,
          minuto: gol.minuto,
          faixaMinuto: gol.faixaMinuto,
        })),
      },
    },
    include: { gols: true },
  });

  return NextResponse.json(jogo, { status: 201 });
}
