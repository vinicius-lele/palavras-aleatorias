// Remove de images.js as chaves cuja palavra não existe mais no words.js
// (após curadoria). Preserva a ordem e o formato do arquivo.
//
// Uso: node scripts/podar-images.mjs [--dry]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");

const WORDS = new Function(readFileSync(join(root, "words.js"), "utf8") + "\nreturn WORDS;")();
const existentes = new Set();
for (const nivel of Object.keys(WORDS))
  for (const arr of Object.values(WORDS[nivel]))
    for (const w of arr) existentes.add(norm(w));

const src = readFileSync(join(root, "images.js"), "utf8");
const { IMAGES } = await import(new URL("../images.js", import.meta.url).href);

const chaves = Object.keys(IMAGES);
const manter = chaves.filter((k) => existentes.has(norm(k)));
const fora = chaves.filter((k) => !existentes.has(norm(k)));
console.log(`images.js: ${chaves.length} chaves -> ${manter.length} (removidas ${fora.length})`);
if (fora.length) console.log("removidas:", fora.slice(0, 30).join(", ") + (fora.length > 30 ? " ..." : ""));

// quantas palavras do corpus ficaram SEM emoji? (validador exige >= 4/nível)
const comEmoji = new Set(manter.map(norm));
const semEmoji = { nivel1: 0, nivel2: 0, nivel3: 0, nivel4: 0, nivel5: 0 };
for (const nivel of Object.keys(semEmoji))
  for (const arr of Object.values(WORDS[nivel]))
    for (const w of arr) if (!comEmoji.has(norm(w))) semEmoji[nivel]++;
console.log("palavras sem emoji por nível (só informativo):", JSON.stringify(semEmoji));

if (dry) { console.log("--dry: nada gravado"); process.exit(0); }

// reconstrói no mesmo formato (export var IMAGES = { ... }; 10 por linha)
function formatar(pares) {
  const linhas = [];
  for (let i = 0; i < pares.length; i += 10) {
    linhas.push(
      "  " +
        pares
          .slice(i, i + 10)
          .map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`)
          .join(", ") +
        (i + 10 < pares.length ? "," : "")
    );
  }
  return linhas.join("\n");
}

const cabecalho = src.slice(0, src.indexOf("export var IMAGES"));
const pares = manter.map((k) => [k, IMAGES[k]]);
writeFileSync(join(root, "images.js"), cabecalho + "export var IMAGES = {\n" + formatar(pares) + "\n};\n", "utf8");
console.log("-> images.js gravado (" + pares.length + " chaves)");
