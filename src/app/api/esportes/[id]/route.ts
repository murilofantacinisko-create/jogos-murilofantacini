import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const evento = await prisma.outroEsporte.findUnique({
    where: { id: Number(params.id) },
  });

  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado" }, { status: 404 });
  }

  return NextResponse.json(evento);
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
    esporte,
    data,
    hora,
    diaSemana,
    campeonato,
    estadio,
    localizacao,
    fase,
    timeA,
    timeB,
    vencedor,
    placarJson,
    info,
  } = body;

  const evento = await prisma.outroEsporte.update({
    where: { id },
    data: {
      esporte,
      data,
      hora,
      diaSemana,
      campeonato,
      estadio,
      localizacao,
      fase,
      timeA,
      timeB,
      vencedor,
      placarJson,
      info: info || null,
    },
  });

  return NextResponse.json(evento);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  await prisma.outroEsporte.delete({ where: { id: Number(params.id) } });

  return NextResponse.json({ success: true });
}
