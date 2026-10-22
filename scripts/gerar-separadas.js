// Gera o arquivo derivado `words-separadas.js` (material de apoio, sob
// demanda — não é commitado) a partir de três fontes:
//   - words.js         -> listas originais (palavras sem separação)
//   - silabas-portal.js-> divisões oficiais do Portal da Língua Portuguesa
//   - syllables.js     -> exceções pedagógicas + algoritmo (fallback)
//
// Uso:  node scripts/gerar-separadas.js
//
// A ordem de resolução é a mesma do app (EXCEPTIONS, Portal, algoritmo),
// então o arquivo gerado mostra exatamente o que as atividades exibem.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { syllables } from "../syllables.js";

var root = join(dirname(fileURLToPath(import.meta.url)), "..");

// words.js e silabas-portal.js são scripts clássicos (const ... = {...});
// avaliação devolve os objetos. SILABAS_PORTAL vira global para o
// syllables.js encontrá-lo (mesmo mecanismo do navegador).
var srcWords = readFileSync(join(root, "words.js"), "utf8");
var WORDS = new Function(srcWords + "\nreturn WORDS;")();
var srcPortal = readFileSync(join(root, "silabas-portal.js"), "utf8");
globalThis.SILABAS_PORTAL = new Function(srcPortal + "\nreturn SILABAS_PORTAL;")();

// Silabifica preservando a maiúscula inicial (nomes e cidades: "Bru-no").
function separar(palavra) {
  var juntas = syllables(palavra).join("-");
  if (/^[A-ZÀ-Þ]/.test(palavra)) {
    juntas = juntas.charAt(0).toUpperCase() + juntas.slice(1);
  }
  return juntas;
}

// Formata no mesmo estilo do words.js: temas com recuo, ~8 palavras por linha.
function formatarLinha(palavras) {
  var linhas = [];
  for (var i = 0; i < palavras.length; i += 8) {
    linhas.push("      " + palavras.slice(i, i + 8)
      .map(function (p) { return JSON.stringify(p); })
      .join(", ") + (i + 8 < palavras.length ? "," : ""));
  }
  return linhas.join("\n");
}

var total = 0;
var blocos = Object.keys(WORDS).sort(function (a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}).map(function (nivel) {
  var partes = Object.keys(WORDS[nivel]).map(function (tema) {
    var separadas = WORDS[nivel][tema].map(separar);
    total += separadas.length;
    return "    " + JSON.stringify(tema) + ": [\n" + formatarLinha(separadas) + "\n    ]";
  });
  return "  " + JSON.stringify(nivel) + ": {\n" + partes.join(",\n") + "\n  }";
});

var cabecalho =
  "// ⚠️ GERADO SOB DEMANDA — não é commitado; regenere com:\n" +
  "//     node scripts/gerar-separadas.js\n" +
  "//\n" +
  "// Fontes: words.js + silabas-portal.js + syllables.js (mesma ordem de\n" +
  "// resolução do app: exceções, Portal da Língua, algoritmo).\n" +
  "//\n" +
  "// Estrutura idêntica ao words.js, mas cada palavra vem já silabificada\n" +
  "// (ex.: \"ga-to\", \"bi-bli-o-te-ca\"). Uso: material de apoio/impressão.\n" +
  "// As atividades do jogo NÃO usam este arquivo — usam words.js + syllables.js.\n" +
  "const WORDS_SEPARADAS = {\n" + blocos.join(",\n") + "\n};\n";

writeFileSync(join(root, "words-separadas.js"), cabecalho, "utf8");
console.log("OK: " + total + " palavras -> words-separadas.js (" + blocos.length + " níveis)");
