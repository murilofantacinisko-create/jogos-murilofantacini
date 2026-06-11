import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const esporte = request.nextUrl.searchParams.get("esporte");

  const registros = await prisma.outroEsporte.findMany({
    where: esporte ? { esporte } : undefined,
    orderBy: { data: "desc" },
  });

  return NextResponse.json(registros);
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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

  const registro = await prisma.outroEsporte.create({
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

  return NextResponse.json(registro, { status: 201 });
}
