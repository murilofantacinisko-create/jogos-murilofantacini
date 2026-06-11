import { PrismaClient } from "@prisma/client";
import {
  jogadosProfissional,
  outrosCorinthians,
  outrosJogos,
  gols,
} from "../src/data/jogos";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding jogos profissional...");
  for (const jogo of jogadosProfissional) {
    const golsDoJogo = gols.filter((g) => g.ID_JOGO === jogo.ID_JOGO);

    await prisma.jogo.create({
      data: {
        data: jogo.DATA,
        hora: jogo.HORA,
        diaSemana: jogo["DIA DA SEMANA"],
        campeonato: jogo.CAMPEONATO,
        estadio: jogo["ESTÁDIO"],
        mando: jogo.MANDO,
        gm: jogo.GM,
        gs: jogo.GS,
        adversario: jogo["ADVERSÁRIO"],
        info: jogo.INFO,
        resultado: jogo.RESULTADO,
        fase: jogo.FASE,
        status: jogo.STATUS,
        publico: jogo["PÚBLICO"],
        pontos: jogo.Pontos,
        ano: jogo.ANO,
        categoria: "profissional",
        gols: {
          create: golsDoJogo.map((gol) => ({
            atleta: gol.Atleta,
            minuto: gol.Minuto,
            faixaMinuto: gol["Faixa Minuto"],
          })),
        },
      },
    });
  }

  console.log("Seeding outros corinthians...");
  for (const jogo of outrosCorinthians) {
    await prisma.jogo.create({
      data: {
        data: jogo.DATA,
        hora: jogo.HORA,
        diaSemana: jogo["DIA DA SEMANA"],
        campeonato: jogo.CAMPEONATO,
        estadio: jogo["ESTÁDIO"],
        mando: jogo.MANDANTE,
        gm: jogo.GM,
        gs: jogo.GS,
        adversario: jogo.VISITANTE,
        info: jogo.INFO,
        resultado: jogo.RESULTADO,
        fase: "",
        status: "",
        publico: jogo["PÚBLICO"],
        pontos: 0,
        ano: jogo.ANO,
        categoria: "outros-corinthians",
      },
    });
  }

  console.log("Seeding outros jogos...");
  for (const jogo of outrosJogos) {
    await prisma.jogo.create({
      data: {
        data: jogo.DATA,
        hora: jogo.HORA,
        diaSemana: jogo["DIA DA SEMANA"],
        campeonato: jogo.CAMPEONATO,
        estadio: jogo["ESTÁDIO"],
        mando: jogo.MANDANTE,
        gm: jogo.GM,
        gs: jogo.GS,
        adversario: jogo.VISITANTE,
        info: jogo.INFO,
        resultado: jogo.RESULTADO,
        fase: "",
        status: "",
        publico: jogo["PÚBLICO"],
        pontos: 0,
        ano: jogo.ANO,
        categoria: "outros-jogos",
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
