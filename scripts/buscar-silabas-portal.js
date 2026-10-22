// Busca a divisão silábica oficial de cada palavra do words.js no
// Dicionário de Divisão Silábica do Portal da Língua Portuguesa (ILTEC/GELP)
// e gera o arquivo de dados `silabas-portal.js` (const SILABAS_PORTAL).
//
// Uso:  node scripts/buscar-silabas-portal.js [limite]
//   limite: número máximo de palavras a consultar neste lote (teste).
//
// Fonte: https://www.portaldalinguaportuguesa.org/index.php?action=syllables
// A busca do site é por substring ("rato" → 459 resultados) e os resultados
// vêm em ordem alfabética paginada (start=); a página que contém o lema
// exato é localizada por busca binária, minimizando requisições.
// Conforme o robots.txt (Crawl-delay: 3), há 3,5 s entre requisições.
// O progresso fica em cache (os.tmpdir()) e o script retoma de onde parou.
//
// Palavras compostas com hífen ("joão-de-barro") que o dicionário não
// registra são resolvidas pela soma das partes.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

var BASE = "https://www.portaldalinguaportuguesa.org/index.php";
var UA = "palavras-aleatorias/1.0 (projeto educacional open-source; " +
  "consulta pontual de divisao silabica)";
var DELAY_MS = 3500;              // robots.txt: Crawl-delay: 3
var TIMEOUT_MS = 90000;
var RETENTATIVAS = 3;
var POR_PAGINA = 100;
var LIMITE = parseInt(process.argv[2] || "0", 10); // 0 = sem limite
var CACHE = join(tmpdir(), "portal-silabas-cache.json");

var root = join(dirname(fileURLToPath(import.meta.url)), "..");

// words.js é script clássico (const WORDS = {...}); avaliação devolve o objeto.
var src = readFileSync(join(root, "words.js"), "utf8");
var WORDS = new Function(src + "\nreturn WORDS;")();

// Palavras únicas (minúsculas, NFC) de todos os níveis/temas.
var alvo = [];
var vistos = {};
Object.keys(WORDS).forEach(function (nivel) {
  Object.keys(WORDS[nivel]).forEach(function (tema) {
    WORDS[nivel][tema].forEach(function (p) {
      var k = p.toLowerCase().normalize("NFC");
      if (!vistos[k]) { vistos[k] = true; alvo.push(k); }
    });
  });
});

var cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
function salvarCache() { writeFileSync(CACHE, JSON.stringify(cache), "utf8"); }

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function decodeEntities(s) {
  return s
    .replace(/&middot;/g, "\u00b7")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Ordem alfabética aproximada (sem acentos, minúsculas) para a busca binária.
function chave(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Busca uma página de resultados; devolve {total, primeiro, ultimo, lemas}.
// lemas mapeia lema exato -> array de sílabas.
async function pagina(palavra, start) {
  var url = BASE + "?action=syllables&act=list&search=" +
    encodeURIComponent(palavra) + "&start=" + start;
  for (var tentativa = 1; tentativa <= RETENTATIVAS; tentativa++) {
    try {
      var resp = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return parsear(await resp.text());
    } catch (e) {
      if (tentativa === RETENTATIVAS) throw e;
      console.log("  retry " + tentativa + " (" + start + "): " + e.message);
      await sleep(DELAY_MS * 2);
    }
  }
  await sleep(DELAY_MS);
}

// O resultado é uma tabela id=rollovertable; cada linha:
//   <td title='Palavra'><b><a ...>lema</a></b> (classe) <td ...>di·vi·são
// Ao final, "1 - 100 de 459 resultados".
function parsear(html) {
  var out = { total: 0, primeiro: null, ultimo: null, lemas: {} };
  var m = html.match(/1 - \d+ de (\d+) resultados/);
  if (m) out.total = parseInt(m[1], 10);
  var inicio = html.indexOf("id=rollovertable");
  if (inicio === -1) return out;
  var fim = html.indexOf("</table>", inicio);
  var tabela = html.slice(inicio, fim === -1 ? html.length : fim);
  var linhas = tabela.split(/<tr[^>]*>/i);
  for (var i = 0; i < linhas.length; i++) {
    var a = linhas[i].match(/<a href='\?action=lemma[^']*'>([^<]+)<\/a>/);
    if (!a) continue;
    var lema = decodeEntities(a[1]).trim().toLowerCase();
    if (out.primeiro === null) out.primeiro = lema;
    out.ultimo = lema;
    if (lema in out.lemas) continue;
    var celula = linhas[i].split(/<td[^>]*>/i)[2] || "";
    var divisao = decodeEntities(celula.replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, "").trim();
    var silabas = divisao.split("\u00b7").map(function (s) { return s.trim(); })
      .filter(Boolean);
    if (silabas.length === 0) continue;
    // Sanidade: as sílabas recompõem o lema?
    if (chave(silabas.join("")) !== chave(lema)) {
      console.log("  AVISO: recompõe errado: " + lema + " -> " + divisao);
      continue;
    }
    out.lemas[lema] = silabas;
  }
  return out;
}

// Localiza o lema exato paginando (busca binária entre páginas).
async function consultar(palavra) {
  var p0 = await pagina(palavra, 0);
  if (palavra in p0.lemas) return p0.lemas[palavra];
  if (p0.total <= POR_PAGINA) return null; // coube numa página só
  var lo = 1;
  var hi = Math.floor((p0.total - 1) / POR_PAGINA);
  while (lo <= hi) {
    var mid = (lo + hi) >> 1;
    var pg = await pagina(palavra, mid * POR_PAGINA);
    await sleep(DELAY_MS);
    if (palavra in pg.lemas) return pg.lemas[palavra];
    if (pg.primeiro === null) { hi = mid - 1; continue; } // página vazia
    var c1 = chave(palavra).localeCompare(chave(pg.primeiro));
    var c2 = pg.ultimo ? chave(palavra).localeCompare(chave(pg.ultimo)) : 1;
    if (c1 < 0) hi = mid - 1;          // alvo antes desta página
    else if (c2 > 0) lo = mid + 1;     // alvo depois desta página
    else return null;                  // dentro do intervalo e ausente
  }
  return null;
}

// Resolve uma palavra: tenta o lema completo; se composto com hífen não
// existir, soma as partes.
async function resolver(palavra) {
  var r = await consultar(palavra);
  if (r) return r;
  if (palavra.indexOf("-") === -1) return null;
  var partes = palavra.split("-");
  var syls = [];
  for (var i = 0; i < partes.length; i++) {
    var p = partes[i];
    if (!(p in cache)) {
      cache[p] = await consultar(p);
      salvarCache();
      await sleep(DELAY_MS);
    }
    if (!cache[p]) return null;
    syls = syls.concat(cache[p]);
  }
  return syls;
}

async function main() {
  var pendentes = alvo.filter(function (w) { return !(w in cache); });
  console.log("Alvo: " + alvo.length + " | já no cache: " +
    (alvo.length - pendentes.length));
  if (LIMITE > 0) pendentes = pendentes.slice(0, LIMITE);
  console.log("A consultar agora: " + pendentes.length);

  for (var i = 0; i < pendentes.length; i++) {
    var w = pendentes[i];
    cache[w] = await resolver(w);
    salvarCache();
    console.log("[" + (i + 1) + "/" + pendentes.length + "] " + w + " -> " +
      (cache[w] ? cache[w].join("\u00b7") : "(ausente)"));
    await sleep(DELAY_MS);
  }

  if (LIMITE > 0) { console.log("Lote de teste concluído."); return; }

  // Gera silabas-portal.js apenas com as palavras encontradas.
  var encontradas = alvo.filter(function (w) { return cache[w]; });
  var ausentes = alvo.filter(function (w) { return !cache[w]; });
  var linhas = encontradas.sort().map(function (w) {
    return "  " + JSON.stringify(w) + ": " + JSON.stringify(cache[w]) + ",";
  });
  var data = new Date().toISOString().slice(0, 10);
  var out =
    "// \u26a0\ufe0f ARQUIVO GERADO AUTOMATICAMENTE \u2014 N\u00c3O EDITE \u00c0 M\u00c3O.\n" +
    "//\n" +
    "// Divis\u00f5es sil\u00e1bicas oficiais das palavras do words.js, consultadas no\n" +
    "// Dicion\u00e1rio de Divis\u00e3o Sil\u00e1bica do Portal da L\u00edngua Portuguesa\n" +
    "// (portaldalinguaportuguesa.org), em conformidade com a Base XX do\n" +
    "// Acordo Ortogr\u00e1fico de 1990.\n" +
    "//\n" +
    "// Gerado em " + data + " por scripts/buscar-silabas-portal.js \u2014 regenere com:\n" +
    "//     node scripts/buscar-silabas-portal.js\n" +
    "//\n" +
    "// O syllables.js usa este mapa antes de recorrer ao algoritmo; o mapa\n" +
    "// EXCEPTIONS (decis\u00f5es pedag\u00f3gicas pontuais) tem prioridade sobre ele.\n" +
    "const SILABAS_PORTAL = {\n" + linhas.join("\n") + "\n};\n";
  writeFileSync(join(root, "silabas-portal.js"), out, "utf8");

  console.log("\nOK: " + encontradas.length + " encontradas, " + ausentes.length +
    " ausentes -> silabas-portal.js");
  if (ausentes.length) console.log("Ausentes: " + ausentes.join(", "));
}

main().catch(function (e) {
  console.error("ERRO: " + e.message + " (cache salvo; reexecute para retomar)");
  process.exit(1);
});
