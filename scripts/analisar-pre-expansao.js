// Cruza o corpus ATUAL com a versão PRÉ-EXPANSÃO (commit cad22fa~1, 5.295
// palavras manuais) e aplica a regra C para ver quem é quem.
//
// Uso: node scripts/analisar-pre-expansao.js <caminho words-antes.js>
import { readFileSync } from "node:fs";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");
const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);

const antes = new Function(readFileSync(process.argv[2], "utf8") + "\nreturn WORDS;")();
globalThis.WORDS = new Function(readFileSync("words.js", "utf8") + "\nreturn WORDS;")();

const conjuntoAntes = new Set();
for (const nivel of Object.keys(antes))
  for (const arr of Object.values(antes[nivel]))
    for (const w of arr) conjuntoAntes.add(norm(w));

// regra C
const eleitura = JSON.parse(readFileSync("scripts/eleitura-banco.json", "utf8"));
const cobreEleitura = new Set();
for (const lista of Object.values(eleitura)) for (const e of lista) cobreEleitura.add(norm(e.palavra));
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
const regraC = (k) => cobreEleitura.has(k) || (ispa.get(k)?.pc ?? -1) >= 70 || (wf.get(k) ?? -Infinity) >= -600;

// classifica o corpus atual
const stats = { pre_passa: 0, pre_falha: 0, pos_passa: 0, pos_falha: 0 };
const preFalha = [];
const posPassaPorTema = {};
const posFalhaPorTema = {};
for (const nivel of Object.keys(WORDS))
  for (const [tema, arr] of Object.entries(WORDS[nivel]))
    for (const w of arr) {
      const k = norm(w);
      const ehPre = conjuntoAntes.has(k);
      const passa = ehProprio(w) || regraC(k);
      if (ehPre) {
        if (passa) stats.pre_passa++;
        else { stats.pre_falha++; if (preFalha.length < 80) preFalha.push(`${w}(${wf.get(k) ?? "sem-wf"})`); }
      } else {
        if (passa) { stats.pos_passa++; posPassaPorTema[tema] = (posPassaPorTema[tema] ?? 0) + 1; }
        else { stats.pos_falha++; posFalhaPorTema[tema] = (posFalhaPorTema[tema] ?? 0) + 1; }
      }
    }

console.log("=== Corpus atual vs pré-expansão (5.295 manuais) ===");
console.log(`pré-expansão que PASSAM regra C: ${stats.pre_passa}`);
console.log(`pré-expansão que FALHAM regra C: ${stats.pre_falha}`);
console.log(`pós-expansão que PASSAM regra C: ${stats.pos_passa}`, JSON.stringify(posPassaPorTema));
console.log(`pós-expansão que FALHAM regra C: ${stats.pos_falha}`, JSON.stringify(posFalhaPorTema));
console.log(`\n=== Amostra do que a regra C recusa no corpus MANUAL (pré) ===`);
console.log(preFalha.join(", "));
