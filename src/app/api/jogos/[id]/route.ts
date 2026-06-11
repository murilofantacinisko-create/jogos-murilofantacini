import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const jogo = await prisma.jogo.findUnique({
    where: { id: Number(params.id) },
    include: { gols: true },
  });

  if (!jogo) {
    return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(jogo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const id = Number(params.id);
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

  const jogo = await prisma.jogo.update({
    where: { id },
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
      categoria,
      gols: {
        deleteMany: {},
        create: (gols ?? []).map((gol: { atleta: string; minuto: number; faixaMinuto: string }) => ({
          atleta: gol.atleta,
          minuto: gol.minuto,
          faixaMinuto: gol.faixaMinuto,
        })),
      },
    },
    include: { gols: true },
  });

  return NextResponse.json(jogo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.jogo.delete({ where: { id: Number(params.id) } });

  return NextResponse.json({ success: true });
}
