// Simula a curadoria sob várias opções de regra e imprime o impacto completo:
// total, por nível, por tema, emojis por nível, e amostras do que entra/sai.
//
// Uso:  node scripts/simular-curadoria.mjs
import { readFileSync } from "node:fs";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");

const eleitura = JSON.parse(readFileSync("scripts/eleitura-banco.json", "utf8"));
const bandaDe = new Map();
for (const [banda, lista] of Object.entries(eleitura))
  for (const e of lista) if (!bandaDe.has(norm(e.palavra))) bandaDe.set(norm(e.palavra), banda);

const ispa = new Map();
for (const l of readFileSync("scripts/word-freq-children.tsv", "utf8").trim().split("\n").slice(1)) {
  const [p, o, pc] = l.split("\t");
  const k = norm(p);
  const v = { ocorrencias: Number(o), percentil: Number(String(pc).replace(",", ".")) };
  if (!ispa.has(k) || v.ocorrencias > ispa.get(k).ocorrencias) ispa.set(k, v);
}

const wf = new Map();
for (const l of readFileSync("scripts/wordfreq-pt.tsv", "utf8").trim().split("\n").slice(1)) {
  const [p, cb] = l.split("\t");
  const k = norm(p);
  const v = Number(cb);
  if (!wf.has(k) || v > wf.get(k)) wf.set(k, v);
}

globalThis.WORDS = new Function(readFileSync("words.js", "utf8") + "\nreturn WORDS;")();
const { IMAGES: imgs } = await import(new URL("../images.js", import.meta.url).href);

const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);
const niveis = Object.keys(WORDS).sort();

// entradas planas
const entradas = [];
for (const nivel of niveis)
  for (const [tema, arr] of Object.entries(WORDS[nivel]))
    for (const w of arr) entradas.push({ w, nivel, tema });

const temEmoji = new Set(Object.keys(imgs).map(norm));

const cobreEscola = (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 70;

const opcoes = {
  "A) mole: wordfreq >= -700 (1/10M) ou escola": (k) => cobreEscola(k) || (wf.get(k) ?? -Infinity) >= -700,
  "B) média: wordfreq >= -650 ou escola": (k) => cobreEscola(k) || (wf.get(k) ?? -Infinity) >= -650,
  "C) firme: wordfreq >= -600 (1/1M) ou escola": (k) => cobreEscola(k) || (wf.get(k) ?? -Infinity) >= -600,
  "D) rígida: wordfreq >= -550 ou escola": (k) => cobreEscola(k) || (wf.get(k) ?? -Infinity) >= -550,
};

for (const [nome, regra] of Object.entries(opcoes)) {
  console.log(`\n================ ${nome} ================`);
  const mantidas = entradas.filter((e) => ehProprio(e.w) || regra(norm(e.w)));
  console.log(`TOTAL: ${mantidas.length} de ${entradas.length} (${((100 * mantidas.length) / entradas.length).toFixed(1)}%)`);

  const porNivel = {};
  const emojisNivel = {};
  for (const nivel of niveis) { porNivel[nivel] = 0; emojisNivel[nivel] = 0; }
  const porTema = {};
  for (const e of mantidas) {
    porNivel[e.nivel]++;
    porTema[e.tema] = (porTema[e.tema] ?? 0) + 1;
    if (temEmoji.has(norm(e.w))) emojisNivel[e.nivel]++;
  }
  console.log("nível:", niveis.map((n) => `${n}:${porNivel[n]}`).join("  "));
  console.log("emoji/nível:", niveis.map((n) => `${n}:${emojisNivel[n]}`).join("  "), "(mín 4)");
  const temasOk = Object.entries(porTema).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}:${n}`);
  console.log("temas:", temasOk.join(" "));

  // amostras por nível do que sobra
  for (const nivel of niveis) {
    const arr = mantidas.filter((e) => e.nivel === nivel && !ehProprio(e.w) && e.tema === "outros").map((e) => e.w);
    console.log(`  ${nivel} amostra: ${arr.slice(0, 12).join(", ")} ... ${arr.slice(-6).join(", ")}`);
  }
}
