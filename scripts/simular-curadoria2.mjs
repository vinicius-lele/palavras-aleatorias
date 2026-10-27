// Simula a regra FINAL de curadoria (duas vias):
//   V1 (herança): palavra já existia no corpus manual pré-expansão
//      (commit cad22fa~1, 5.295 palavras — 11 temas manuais + outros) -> mantém;
//   V2 (evidência): E-LEITURA qualquer banda OU ISPA p>=70 OU wordfreq >= -600 cB;
//   + nomes próprios dos temas nomes/cidades mantidos.
//
// Uso: node scripts/simular-curadoria2.mjs <caminho words-antes.js>
import { readFileSync } from "node:fs";

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");
const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);

const antes = new Function(readFileSync(process.argv[2], "utf8") + "\nreturn WORDS;")();
globalThis.WORDS = new Function(readFileSync("words.js", "utf8") + "\nreturn WORDS;")();
const { IMAGES: imgs } = await import(new URL("../images.js", import.meta.url).href);

const heranca = new Set();
for (const nivel of Object.keys(antes))
  for (const arr of Object.values(antes[nivel]))
    for (const w of arr) heranca.add(norm(w));

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

const temEmoji = new Set(Object.keys(imgs).map(norm));
const niveis = Object.keys(WORDS).sort();

const mantidas = [];
const removidas = [];
for (const nivel of niveis)
  for (const [tema, arr] of Object.entries(WORDS[nivel]))
    for (const w of arr) {
      const k = norm(w);
      const ok = (ehProprio(w) && (tema === "nomes" || tema === "cidades")) || heranca.has(k) || evidencia(k);
      (ok ? mantidas : removidas).push({ w, nivel, tema });
    }

console.log(`TOTAL: ${mantidas.length} de 45002 (removidas ${removidas.length})`);
const porNivel = {}, emo = {};
for (const nivel of niveis) { porNivel[nivel] = 0; emo[nivel] = 0; }
const porTema = {};
for (const e of mantidas) {
  porNivel[e.nivel]++;
  porTema[e.tema] = (porTema[e.tema] ?? 0) + 1;
  if (temEmoji.has(norm(e.w))) emo[e.nivel]++;
}
console.log("nível:", niveis.map((n) => `${n}:${porNivel[n]}`).join("  "));
console.log("emoji/nível:", niveis.map((n) => `${n}:${emo[n]}`).join("  "), "(mín 4)");
console.log("temas:", Object.entries(porTema).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}:${n}`).join(" "));

for (const nivel of niveis) {
  const arr = mantidas.filter((e) => e.nivel === nivel && e.tema === "outros").map((e) => e.w);
  console.log(`  ${nivel} outros (${arr.length}): ${arr.slice(0, 10).join(", ")} ... ${arr.slice(-5).join(", ")}`);
}
console.log("\nremovidas amostra:", removidas.slice(0, 40).map((e) => e.w).join(", "));
