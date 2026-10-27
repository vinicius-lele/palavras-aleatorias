// Descritores dos níveis de leitura — o professor usia para escolher o nível
// certo. O texto descreve O QUE as palavras daquele nível cobrem, sem prometer
// ano escolar (a criança progride por nível de leitura, não por idade).
//
// Baseado na distribuição real das listas em words.js (validator imprime a
// atualização — 9.879 palavras curadas, médias 2.0 / 3.0 / 3.6 / 4.1 / 5.0 sílabas):
//   nível 1: 396 mono, 2423 di, 260 tri, 56 de 4
//   nível 2: 1534 tri, 205 de 4, 49 de 5, 3 de 6
//   nível 3: 484 tri, 918 de 4, 83 de 5, 30 de 6
//   nível 4: 336 tri, 396 de 4, 607 de 5, 57 de 6
//   nível 5: 223 tri, 371 de 4, 235 de 5, 402 de 6, 123 de 7, 43+ de 8
// As dezenas de palavras curtas que aparecem nos níveis 4–5 são nomes
// próprios e cidades (herdadas dos temas manuais) — não bug de alocação.
// Se as listas mudarem muito, revise estes textos.

export var LEVEL_NOTES = {
  nivel1: "Palavras curtas, do dia a dia: 1 a 2 sílabas (gato, mesa, bola).",
  nivel2: "Frases curtas: sílabas simples e sílabas com l/r (cobrinha, cadeira).",
  nivel3: "Palavras maiores: 4 sílabas, encontros consonantais (brincadeira, bicicleta).",
  nivel4: "Vocabulário amplo: 4 a 5 sílabas, ditongos e acentuação (fotografia, conhecimento).",
  nivel5: "Palavras longas e desafiantes: 5 a 7+ sílabas, prefixos e acentuação (otorrinolaringologista, responsabilização)."
};

export function noteFor(levelKey) {
  return LEVEL_NOTES[levelKey] || "";
}
