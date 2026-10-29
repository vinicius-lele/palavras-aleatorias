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
import { createArrastarSilabas } from "./arrastar-silabas.js";
import { createPalavrasDesconhecidas } from "./palavras-desconhecidas.js";
import { createEncontrosVocalicos } from "./encontros-vocalicos.js";
import {
  ICONE_TREINO, ICONE_BLOCOS, ICONE_IMAGEM,
  ICONE_CONTAR, ICONE_ARRASTAR, ICONE_RIMAS,
  ICONE_DESCONHECIDAS, ICONE_ENCONTROS
} from "./icones.js";

export var ACTIVITIES = [
  {
    id: "treino-livre",
    nome: "Treino Livre",
    icone: ICONE_TREINO,
    descricao: "Palavras passam na tela, uma por vez, no ritmo que você escolher.",
    bncc: ["EF12LP01"],
    pronto: true,
    create: createTreinoLivre
  },
  {
    id: "silabas-complexas",
    nome: "Sílabas em Blocos",
    icone: ICONE_BLOCOS,
    descricao: "Descubra onde a palavra se divide em sílabas.",
    bncc: ["EF01LP06", "EF02LP02"],
    pronto: true,
    create: createSilabasComplexas
  },
  {
    id: "palavra-imagem",
    nome: "Palavra e Imagem",
    icone: ICONE_IMAGEM,
    descricao: "Leia a palavra e escolha a imagem certa — ou o contrário.",
    bncc: ["EF15LP18", "EF12LP08"],
    pronto: true,
    create: createPalavraImagem
  },
  {
    id: "contar-silabas",
    nome: "Contar Sílabas",
    icone: ICONE_CONTAR,
    descricao: "Quantas sílabas tem a palavra? Conte e confira nos blocos.",
    bncc: ["EF03LP05"],
    pronto: true,
    create: createContarSilabas
  },
  {
    id: "arrastar-silabas",
    nome: "Montar com Sílabas",
    icone: ICONE_ARRASTAR,
    descricao: "Arraste as sílabas embaralhadas para montar a palavra.",
    bncc: ["EF01LP06", "EF02LP02"],
    pronto: true,
    create: createArrastarSilabas
  },
  {
    id: "rimas",
    nome: "Caça-Rimas",
    icone: ICONE_RIMAS,
    descricao: "Encontre a palavra que rima com a palavra-alvo.",
    bncc: ["EF12LP07", "EF01LP09"],
    pronto: true,
    create: createRimas
  },
  {
    id: "palavras-desconhecidas",
    nome: "Palavras Desconhecidas",
    icone: ICONE_DESCONHECIDAS,
    descricao: "Palavras incomuns passam na tela com o significado — vocabulário novo.",
    bncc: ["EF35LP05"],
    pronto: true,
    create: createPalavrasDesconhecidas
  },
  {
    id: "encontros-vocalicos",
    nome: "Encontros Vocálicos",
    icone: ICONE_ENCONTROS,
    descricao: "Ditongo, tritongo ou hiato? Classifique as vogais das palavras.",
    bncc: ["EF04LP02", "EF03LP02"],
    pronto: true,
    create: createEncontrosVocalicos
  }
];

export function byId(id) {
  for (var i = 0; i < ACTIVITIES.length; i++) {
    if (ACTIVITIES[i].id === id) return ACTIVITIES[i];
  }
  return null;
}
