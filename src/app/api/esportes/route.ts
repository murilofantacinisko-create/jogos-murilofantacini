import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const esporte = request.nextUrl.searchParams.get("esporte");

  const eventos = await prisma.outroEsporte.findMany({
    where: esporte ? { esporte } : undefined,
    orderBy: { data: "desc" },
  });

  return NextResponse.json(eventos);
}

export async function POST(request: NextRequest) {
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

  const evento = await prisma.outroEsporte.create({
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

  return NextResponse.json(evento, { status: 201 });
}
