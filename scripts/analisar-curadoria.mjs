// Análise de curadoria: cruza o corpus atual (words.js) com as duas fontes
// de frequência escolar:
//   - E-LEITURA (BR, banco do PDF): bandas alta/media/baixa
//   - Word_Freq_Children (PT, ISPA): ocorrencias + percentil
//
// Uso:  node scripts/analisar-curadoria.mjs
// Sai com estatisticas por nivel/tema e cobertura das fontes. Nao altera nada.

import { readFileSync } from "node:fs";

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");

// --- fonte 1: E-LEITURA ---
const eleitura = JSON.parse(readFileSync("scripts/eleitura-banco.json", "utf8"));
const bandaDe = new Map(); // palavra normalizada -> banda
for (const [banda, lista] of Object.entries(eleitura)) {
  for (const e of lista) if (!bandaDe.has(norm(e.palavra))) bandaDe.set(norm(e.palavra), banda);
}

// --- fonte 2: Word_Freq_Children (ISPA) ---
const linhas = readFileSync("scripts/word-freq-children.tsv", "utf8").trim().split("\n").slice(1);
const ispa = new Map(); // normalizada -> { ocorrencias, percentil }
for (const l of linhas) {
  const [palavra, ocorrencias, percentil] = l.split("\t");
  const k = norm(palavra);
  const reg = { ocorrencias: Number(ocorrencias), percentil: Number(String(percentil).replace(",", ".")) };
  const antigo = ispa.get(k);
  if (!antigo || reg.ocorrencias > antigo.ocorrencias) ispa.set(k, reg);
}

// --- fonte 3: frequência geral (wordfreq pt, centibels) ---
// -300 cB = 1 em 1000 tokens; -600 = 1 em 1 milhão. Quanto mais negativo, mais raro.
const geral = new Map(); // normalizada -> cB (menor/mais negativo = mais raro)
{
  const linhasG = readFileSync("scripts/wordfreq-pt.tsv", "utf8").trim().split("\n").slice(1);
  for (const l of linhasG) {
    const [palavra, cb] = l.split("\t");
    const k = norm(palavra);
    const v = Number(cb);
    const antigo = geral.get(k);
    if (antigo === undefined || v > antigo) geral.set(k, v); // mantém o MAIS frequente
  }
}

// --- corpus atual ---
globalThis.WORDS = new Function(readFileSync("words.js", "utf8") + "\nreturn WORDS;")();
const niveis = Object.keys(WORDS).sort();

const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);
const ehComposto = (w) => /[\s-]/.test(w);

let total = 0;
const stats = {};
for (const nivel of niveis) {
  const s = { n: 0, alta: 0, media: 0, baixa: 0, foraEleitura: 0, ispaTop: 0, ispaMid: 0, ispaBaixo: 0, foraIspa: 0, geral10: 0, geral50: 0, foraGeral: 0, nenhum: 0, proprios: 0, compostos: 0 };
  for (const palavras of Object.values(WORDS[nivel])) {
    for (const w of palavras) {
      s.n++; total++;
      if (ehProprio(w)) s.proprios++;
      if (ehComposto(w)) s.compostos++;
      const k = norm(w);
      const banda = bandaDe.get(k);
      if (banda) s[banda]++;
      else s.foraEleitura++;
      const r = ispa.get(k);
      if (r) {
        if (r.percentil >= 90) s.ispaTop++;
        else if (r.percentil >= 50) s.ispaMid++;
        else s.ispaBaixo++;
      } else s.foraIspa++;
      const pos = geral.get(k);
      if (pos !== undefined) {
        if (pos >= -400) s.geral10++; // frequente: >= 1 em 10.000 tokens
        else if (pos >= -600) s.geral50++; // médio: 1 em 10k–1M
      } else s.foraGeral++;
      if (!banda && !r && !pos) s.nenhum++;
    }
  }
  stats[nivel] = s;
}

const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + "%" : "-");
console.log("=== Corpus atual por nível ===");
console.log("nivel    n      E-LEITURA alta/media/baixa/fora        ISPA p>=90/p50-89/p<50/fora   wordfreq freq/médio/raro/fora  nenhum  proprios");
for (const nivel of niveis) {
  const s = stats[nivel];
  console.log(
    nivel.padEnd(8),
    String(s.n).padEnd(6),
    `a${s.alta} m${s.media} b${s.baixa} fora${s.foraEleitura}`.padEnd(36),
    `t${s.ispaTop} m${s.ispaMid} b${s.ispaBaixo} f${s.foraIspa}`.padEnd(30),
    `w${s.geral10} x${s.geral50} f${s.foraGeral}`.padEnd(28),
    String(s.nenhum).padEnd(7),
    s.proprios
  );
}

// --- combinacoes de regra de manutencao ---
console.log("\n=== Tamanho do corpus sob regras de manutenção ===");
const regras = {
  "R0 E-LEITURA qualquer OU ISPA p>=50 OU wordfreq>=-700 (1/10M)": (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 50 || (geral.get(k) ?? -Infinity) >= -700,
  "R1 E-LEITURA qualquer OU ISPA p>=50 OU wordfreq>=-650": (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 50 || (geral.get(k) ?? -Infinity) >= -650,
  "R2 E-LEITURA qualquer OU ISPA p>=70 OU wordfreq>=-600 (1/1M)": (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 70 || (geral.get(k) ?? -Infinity) >= -600,
  "R3 E-LEITURA qualquer OU ISPA p>=70 OU wordfreq>=-550": (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 70 || (geral.get(k) ?? -Infinity) >= -550,
  "R4 E-LEITURA alta/media OU ISPA p>=70 OU wordfreq>=-550": (k) => ["alta", "media"].includes(bandaDe.get(k)) || (ispa.get(k)?.percentil ?? -1) >= 70 || (geral.get(k) ?? -Infinity) >= -550,
  "R5 E-LEITURA qualquer OU ISPA p>=50 (sem geral)": (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 50,
};
for (const [nome, regra] of Object.entries(regras)) {
  const porNivel = {};
  let nTotal = 0;
  for (const nivel of niveis) {
    let n = 0;
    for (const palavras of Object.values(WORDS[nivel])) {
      for (const w of palavras) {
        const k = norm(w);
        if (regra(k, w)) n++;
      }
    }
    porNivel[nivel] = n;
    nTotal += n;
  }
  const detalhe = niveis.map((nv) => `${nv}:${porNivel[nv]}`).join(" ");
  console.log(`${nome}\n    total ${nTotal} | ${detalhe}`);
}

// --- amostras do que cairia fora (ex.: sobras do recheio) ---
console.log("\n=== Amostra de palavras SEM nenhuma das 3 fontes (candidatas a sair) ===");
let sem = 0;
const amostra = [];
const amostraProps = [];
for (const nivel of niveis) {
  for (const palavras of Object.values(WORDS[nivel])) {
    for (const w of palavras) {
      const k = norm(w);
      if (!bandaDe.has(k) && !ispa.has(k) && !geral.has(k)) {
        sem++;
        if (ehProprio(w)) { if (amostraProps.length < 30) amostraProps.push(w); }
        else if (amostra.length < 60) amostra.push(w);
      }
    }
  }
}
console.log(`total sem nenhuma fonte: ${sem}`);
console.log("comuns:", amostra.join(", "));
console.log("nomes proprios:", amostraProps.join(", "));
