// Amostra aleatória dos grupos da regra final, para inspeção visual.
// Uso: node scripts/amostrar-final.mjs <caminho words-antes.js> [n]
import { readFileSync } from "node:fs";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");
const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);
const n = Number(process.argv[3] ?? 40);

let semente = 0x1234567;
const rand = () => {
  semente = (semente * 1664525 + 1013904223) >>> 0;
  return semente / 4294967296;
};
const amostra = (arr) => {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c.slice(0, n);
};

const antes = new Function(readFileSync(process.argv[2], "utf8") + "\nreturn WORDS;")();
globalThis.WORDS = new Function(readFileSync("words.js", "utf8") + "\nreturn WORDS;")();

const heranca = new Set();
for (const niv of Object.keys(antes)) for (const arr of Object.values(antes[niv])) for (const w of arr) heranca.add(norm(w));

const eleitura = JSON.parse(readFileSync("scripts/eleitura-banco.json", "utf8"));
const cobre = new Set();
for (const arr of Object.values(eleitura)) for (const e of arr) cobre.add(norm(e.palavra));
const ispa = new Map();
for (const l of readFileSync("scripts/word-freq-children.tsv", "utf8").trim().split("\n").slice(1)) {
  const [p, o, pc] = l.split("\t");
  const k = norm(p);
  const v = { o: Number(o), pc: Number(String(pc).replace(",", ".")) };
  if (!ispa.has(k) || v.o > ispa.get(k).o) ispa.set(k, v);
}
const wf = new Map();
for (const l of readFileSync("scripts/wordfreq-pt.tsv", "utf8").trim().split("\n").slice(1)) {
  const [p, cb] = l.split("\t");
  const k = norm(p);
  const v = Number(cb);
  if (!wf.has(k) || v > wf.get(k)) wf.set(k, v);
}
const evidencia = (k) => cobre.has(k) || (ispa.get(k)?.pc ?? -1) >= 70 || (wf.get(k) ?? -Infinity) >= -600;

const grupos = { heranca: [], evidencia: [], proprios: [], sai: [] };
for (const niv of Object.keys(WORDS))
  for (const [tema, arr] of Object.entries(WORDS[niv]))
    for (const w of arr) {
      const k = norm(w);
      let g;
      if ((ehProprio(w) && (tema === "nomes" || tema === "cidades"))) g = "proprios";
      else if (heranca.has(k)) g = "heranca";
      else if (evidencia(k)) g = "evidencia";
      else g = "sai";
      grupos[g].push(w);
    }

for (const [g, arr] of Object.entries(grupos)) {
  console.log(`\n=== ${g} (${arr.length}) ===`);
  console.log(amostra(arr).join(", "));
}
