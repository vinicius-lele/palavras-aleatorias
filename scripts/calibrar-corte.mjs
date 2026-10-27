// Calibração do corte: mostra palavras imediatamente ACIMA e ABAIXO do limite
// de cada regra, para julgar visualmente onde fica a fronteira do "escolar".
//
// Uso:  node scripts/calibrar-corte.mjs [cB-limite]
import { readFileSync } from "node:fs";

const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");

const cbLimite = Number(process.argv[2] ?? -600);

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
const todas = [];
for (const nivel of Object.keys(WORDS).sort())
  for (const arr of Object.values(WORDS[nivel])) for (const w of arr) todas.push({ w, nivel });

// guarda de nomes próprios: tema nomes/cidades sempre sobrevive
const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);

const cobre = (k) => bandaDe.has(k) || (ispa.get(k)?.percentil ?? -1) >= 70;
const classificar = ({ w, nivel }) => {
  const k = norm(w);
  if (ehProprio(w)) return "proprio";
  if (cobre(k)) return "escolar";
  const cb = wf.get(k);
  if (cb === undefined) return "sem-wordfreq";
  return cb >= cbLimite ? "escolar" : "raro";
};

const grupos = { proprio: [], escolar: [], raro: [], "sem-wordfreq": [] };
for (const t of todas) grupos[classificar(t)].push(t);

console.log(`limite wordfreq: ${cbLimite} cB | escolar = E-LEITURA ou ISPA p>=70 ou wordfreq>=limite`);
for (const [g, arr] of Object.entries(grupos)) console.log(`  ${g}: ${arr.length}`);

// fronteira: palavras "raro" ordenadas por cB (as mais próximas do limite = corte justo)
const porCb = (a, b) => (wf.get(norm(b.w)) ?? -999) - (wf.get(norm(a.w)) ?? -999);
const raroOrd = [...grupos.raro].sort(porCb);
console.log(`\n=== Justo ABAIXO do limite (wordfreq ${cbLimite}+) — são "quase" escolares? ===`);
console.log(raroOrd.slice(0, 50).map((t) => `${t.w}(${wf.get(norm(t.w))})`).join(", "));

const acima = wf.get(norm("abobrinha"));
console.log(`\n=== Amostra de "raro" no meio da faixa (${cbLimite - 100}..${cbLimite}) ===`);
const meio = raroOrd.filter((t) => { const c = wf.get(norm(t.w)); return c < cbLimite && c >= cbLimite - 100; });
console.log(meio.slice(0, 50).map((t) => `${t.w}(${wf.get(norm(t.w))})`).join(", "));

console.log(`\n=== Muito raro (< ${cbLimite - 200}) — lixo do recheio? ===`);
const profundo = raroOrd.filter((t) => (wf.get(norm(t.w)) ?? -999) < cbLimite - 200);
console.log(profundo.slice(0, 50).map((t) => `${t.w}(${wf.get(norm(t.w))})`).join(", "));

console.log(`\n=== Sem wordfreq (fora do vocabulário geral) ===`);
console.log(grupos["sem-wordfreq"].slice(0, 60).map((t) => t.w).join(", "));

console.log(`\n=== Por nível (sem nomes próprios) ===`);
for (const nivel of Object.keys(WORDS).sort()) {
  const c = { escolar: 0, raro: 0, "sem-wordfreq": 0, proprio: 0 };
  for (const t of todas) if (t.nivel === nivel) c[classificar(t)]++;
  console.log(`  ${nivel}: escolar ${c.escolar} | raro ${c.raro} | sem-wordfreq ${c["sem-wordfreq"]} | proprios ${c.proprio}`);
}
