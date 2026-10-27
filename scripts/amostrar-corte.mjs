// Amostra ALEATÓRIA dos grupos de decisão (reprodutível, semente fixa)
// para julgar a qualidade do corte sem viés alfabético.
//
// Uso:  node scripts/amostrar-corte.mjs [cB-limite] [por-grupo]
import { readFileSync } from "node:fs";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");
const cbLimite = Number(process.argv[2] ?? -600);
const porGrupo = Number(process.argv[3] ?? 40);

// PRNG determinístico (mulberry32) para amostras reproduzíveis
let semente = 0x9e3779b9;
const rand = () => {
  semente |= 0; semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

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
const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);

const grupos = { proprio: [], "escolar-eleitura": [], "escolar-ispa": [], "escolar-wordfreq": [], raro: [], "sem-wordfreq": [] };
for (const nivel of Object.keys(WORDS).sort()) {
  for (const arr of Object.values(WORDS[nivel])) {
    for (const w of arr) {
      const k = norm(w);
      let g;
      if (ehProprio(w)) g = "proprio";
      else if (bandaDe.has(k)) g = "escolar-eleitura";
      else if ((ispa.get(k)?.percentil ?? -1) >= 70) g = "escolar-ispa";
      else if (wf.has(k) && wf.get(k) >= cbLimite) g = "escolar-wordfreq";
      else if (wf.has(k)) g = "raro";
      else g = "sem-wordfreq";
      grupos[g].push(w);
    }
  }
}

const amostrar = (arr) => {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
  return c.slice(0, porGrupo);
};

console.log(`limite wordfreq: ${cbLimite} cB`);
for (const [g, arr] of Object.entries(grupos)) {
  console.log(`\n=== ${g} (${arr.length}) — amostra aleatória ===`);
  console.log(amostrar(arr).join(", "));
}
