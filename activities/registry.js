// Registro de atividades — fonte única da home, do router e dos selos BNCC.
//
// Para ativar uma atividade: crie o módulo em activities/, importe-o aqui,
// escreva a função `create` e marque `pronto: true`. O card na home fica
// clicável sozinho.

import { createTreinoLivre } from "./treino-livre.js";
import { createSilabasComplexas } from "./silabas-complexas.js";
import { createPalavraImagem } from "./palavra-imagem.js";
import { createContarSilabas } from "./contar-silabas.js";
import { createRimas } from "./rimas.js";

export var ACTIVITIES = [
  {
    id: "treino-livre",
    nome: "Treino Livre",
    icone: "🎬",
    descricao: "Palavras passam na tela, uma por vez, no ritmo que você escolher.",
    bncc: ["EF12LP01"],
    pronto: true,
    create: createTreinoLivre
  },
  {
    id: "silabas-complexas",
    nome: "Sílabas em Blocos",
    icone: "🧱",
    descricao: "Descubra onde a palavra se divide em sílabas.",
    bncc: ["EF01LP06", "EF02LP02"],
    pronto: true,
    create: createSilabasComplexas
  },
  {
    id: "palavra-imagem",
    nome: "Palavra e Imagem",
    icone: "🖼️",
    descricao: "Leia a palavra e escolha a imagem certa — ou o contrário.",
    bncc: ["EF15LP18", "EF12LP08"],
    pronto: true,
    create: createPalavraImagem
  },
  {
    id: "contar-silabas",
    nome: "Contar Sílabas",
    icone: "🔢",
    descricao: "Quantas sílabas tem a palavra? Conte e confira nos blocos.",
    bncc: ["EF03LP05"],
    pronto: true,
    create: createContarSilabas
  },
  {
    id: "rimas",
    nome: "Caça-Rimas",
    icone: "🎵",
    descricao: "Encontre a palavra que rima com a palavra-alvo.",
    bncc: ["EF12LP07", "EF01LP09"],
    pronto: true,
    create: createRimas
  }
];

export function byId(id) {
  for (var i = 0; i < ACTIVITIES.length; i++) {
    if (ACTIVITIES[i].id === id) return ACTIVITIES[i];
  }
  return null;
}
