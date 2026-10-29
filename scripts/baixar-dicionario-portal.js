// Baixa o DICTIONÁRIO COMPLETO de Divisão Silábica do Portal da Língua
// Portuguesa (ILTEC/GELP) e gera o arquivo de dados `silabas-portal.js`
// (const SILABAS_PORTAL) a partir dele — sem consulta palavra por palavra.
//
// Uso:
//   node scripts/baixar-dicionario-portal.js          # baixa (1x, ~2h) e gera
//   node scripts/baixar-dicionario-portal.js --gerar  # só regenera (offline)
//
// Por que o dicionário inteiro: a listagem do Portal aceita o parâmetro
// `letter` (seção por letra inicial; a busca vazia devolve só a letra "a").
// Baixar todas as seções custa ~1.830 requisições (~2h com o Crawl-delay: 3
// do robots.txt) e torna a regeneração de silabas-portal.js instantânea e
// offline — adicionar palavras ao words.js passa a exigir apenas
// "node scripts/baixar-dicionario-portal.js --gerar". O dicionário completo
// também serve para conferir grafia de palavras novas sem rede.
//
// O progresso fica em cache (os.tmpdir()) e o script retoma de onde parou.
// O dicionário baixado é gravado em scripts/dicionario-portal.json (commitado).
//
// Regras de curadoria do dicionário:
//   - só lemas SEM hífen e SEM espaços: compostos ("joão-de-barro") são
//     resolvidos no runtime pela soma das partes (syllables.js), porque o
//     Portal registra alguns compostos com células quebradas; expressões
//     multi-palavra ("anjo da guarda") também vêm com células quebradas;
//   - a célula precisa recompor o lema (comparação sem acentos) — células
//     defeituosas ficam de fora e o algoritmo do syllables.js resolve.
//
// Fonte: https://www.portaldalinguaportuguesa.org/index.php?action=syllables

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
var LETRAS = "abcdefghijklmnopqrstuvwxyz".split("");
var SO_GERAR = process.argv.indexOf("--gerar") !== -1;
var CACHE = join(tmpdir(), "portal-dicionario-cache.json");

var root = join(dirname(fileURLToPath(import.meta.url)), "..");
var ARQ_DICIONARIO = join(root, "scripts", "dicionario-portal.json");
var ARQ_EXTRAS = join(root, "scripts", "silabas-extras.json");
var ARQ_WORDS = join(root, "words.js");
var ARQ_SAIDA = join(root, "silabas-portal.js");

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

function decodeEntities(s) {
  return s
    .replace(/&middot;/g, "\u00b7")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// Ordem alfabética aproximada (sem acentos, minúsculas) — só p/ conferência.
function chave(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Busca uma página de uma seção de letra. Devolve
// { total, lemas: { lema: [silabas] } } só com lemas SEM hífen/espacos,
// com célula válida (as sílabas recompõem o lema).
async function pagina(letra, start) {
  var url = BASE + "?action=syllables&act=list&letter=" + letra +
    "&start=" + start;
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
      console.log("  retry " + tentativa + " (" + letra + ":" + start + "): " +
        e.message);
      await sleep(DELAY_MS * 2);
    }
  }
}

var stats = { hifen: 0, expressoes: 0, celulas: 0 };

// A tabela id=rollovertable traz, por linha:
//   <td title='Palavra'><b><a ...>lema</a></b> (classe) <td ...>di·vi·são
function parsear(html) {
  var out = { total: 0, lemas: {} };
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
    if (lema.indexOf("-") !== -1) { stats.hifen++; continue; }
    if (/\s/.test(lema)) { stats.expressoes++; continue; }
    if (lema in out.lemas) continue;        // homônimos (mesma divisão)
    var celula = linhas[i].split(/<td[^>]*>/i)[2] || "";
    var divisao = decodeEntities(celula.replace(/<[^>]+>/g, ""))
      .replace(/\s+/g, "").trim();
    var silabas = divisao.split("\u00b7").map(function (s) { return s.trim(); })
      .filter(Boolean);
    if (silabas.length === 0) { stats.celulas++; continue; }
    // Sanidade: as sílabas recompõem o lema? Célula defeituosa fica de fora.
    if (chave(silabas.join("")) !== chave(lema)) {
      stats.celulas++;
      continue;
    }
    out.lemas[lema] = silabas;
  }
  return out;
}

// Baixa todas as seções de letra, página a página (retomável).
async function baixar() {
  var cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};
  var gravar = function () { writeFileSync(CACHE, JSON.stringify(cache), "utf8"); };
  var restantes = 0;

  for (var li = 0; li < LETRAS.length; li++) {
    var letra = LETRAS[li];
    var chaveTotal = "_total_" + letra;
    if (!cache[chaveTotal]) {
      var p0 = await pagina(letra, 0);
      cache[chaveTotal] = p0.total;
      cache[letra + ":0"] = p0.lemas;
      gravar();
      await sleep(DELAY_MS);
    }
    var total = cache[chaveTotal];
    var paginas = Math.ceil(total / POR_PAGINA);
    for (var pg = 1; pg < paginas; pg++) {
      if (cache[letra + ":" + pg]) continue;
      restantes++;
    }
    console.log("letra " + letra + ": " + total + " lemas, " + paginas +
      " páginas");
  }
  console.log("Faltam " + restantes + " páginas para baixar (~" +
    Math.round(restantes * 4.2 / 60) + " min)");

  for (var lj = 0; lj < LETRAS.length; lj++) {
    var l = LETRAS[lj];
    var tot = cache["_total_" + l];
    var npag = Math.ceil(tot / POR_PAGINA);
    for (var p = 1; p < npag; p++) {
      if (cache[l + ":" + p]) continue;
      var r = await pagina(l, p * POR_PAGINA);
      if (r.total !== tot) {
        // A seção cresceu/atrasou entre requisições: reajusta e segue.
        cache["_total_" + l] = r.total;
        tot = r.total;
        npag = Math.ceil(tot / POR_PAGINA);
      }
      cache[l + ":" + p] = r.lemas;
      gravar();
      if ((p % 25) === 0) console.log("  " + l + ":" + p + "/" + npag);
      await sleep(DELAY_MS);
    }
    console.log("letra " + l + " completa (" + npag + " páginas)");
  }

  // Achata em lemma -> sílabas (as seções de letra são disjuntas).
  var dicionario = {};
  Object.keys(cache).forEach(function (k) {
    if (k.charAt(0) === "_") return;
    var lemas = cache[k];
    Object.keys(lemas).forEach(function (w) {
      if (!(w in dicionario)) dicionario[w] = lemas[w];
    });
  });
  writeFileSync(ARQ_DICIONARIO, JSON.stringify(dicionario) + "\n", "utf8");
  console.log("OK: " + Object.keys(dicionario).length + " lemas -> " +
    "scripts/dicionario-portal.json");
  console.log("  descartados: " + stats.hifen + " compostos com hífen, " +
    stats.expressoes + " expressões, " + stats.celulas + " células inválidas");
  return dicionario;
}

// words.js é script clássico (const WORDS = {...}); avaliação devolve o objeto.
function lerWords() {
  return new Function(readFileSync(ARQ_WORDS, "utf8") + "\nreturn WORDS;")();
}

// Gera silabas-portal.js (só as palavras do words.js, no formato do app).
// Compostos com hífen = soma das partes (cada parte consultada normalmente);
// palavra com parte ausente do dicionário fica de fora — o syllables.js
// cai no algoritmo (caso típico: nomes próprios).
function gerar(dicionario) {
  var WORDS = lerWords();
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

  function resolver(palavra) {
    var partes = palavra.split("-");
    var syls = [];
    for (var i = 0; i < partes.length; i++) {
      var s = dicionario[partes[i]];
      if (!s) return null;
      syls = syls.concat(s);
    }
    return syls;
  }

  var encontradas = [];
  var ausentes = [];
  alvo.forEach(function (w) {
    var s = resolver(w);
    if (s) encontradas.push([w, s]); else ausentes.push(w);
  });

  var linhas = encontradas.sort(function (a, b) {
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  }).map(function (par) {
    return "  " + JSON.stringify(par[0]) + ": " + JSON.stringify(par[1]) + ",";
  });
  var data = new Date().toISOString().slice(0, 10);
  var out =
    "// \u26a0\ufe0f ARQUIVO GERADO AUTOMATICAMENTE \u2014 N\u00c3O EDITE \u00c0 M\u00c3O.\n" +
    "//\n" +
    "// Divis\u00f5es sil\u00e1bicas oficiais das palavras do words.js, extra\u00eddas do\n" +
    "// Dicion\u00e1rio de Divis\u00e3o Sil\u00e1bica do Portal da L\u00edngua Portuguesa\n" +
    "// e do complemento local (scripts/silabas-extras.json), em conformidade\n" +
    "// com a Base XX do Acordo Ortogr\u00e1fico de 1990.\n" +
    "//\n" +
    "// Gerado em " + data + " por scripts/baixar-dicionario-portal.js \u2014 regenere\n" +
    "// (offline, a partir de scripts/dicionario-portal.json) com:\n" +
    "//     node scripts/baixar-dicionario-portal.js --gerar\n" +
    "//\n" +
    "// O syllables.js usa este mapa antes de recorrer ao algoritmo; o mapa\n" +
    "// EXCEPTIONS (decis\u00f5es pedag\u00f3gicas pontuais) tem prioridade sobre ele.\n" +
    "const SILABAS_PORTAL = {\n" + linhas.join("\n") + "\n};\n";
  writeFileSync(ARQ_SAIDA, out, "utf8");

  console.log("\nOK: " + encontradas.length + " com divisão oficial, " +
    ausentes.length + " ausentes -> silabas-portal.js");
  if (ausentes.length) console.log("Ausentes: " + ausentes.join(", "));
  return { encontradas: encontradas.length, ausentes: ausentes };
}

async function main() {
  var dicionario;
  if (SO_GERAR) {
    if (!existsSync(ARQ_DICIONARIO)) {
      throw new Error("scripts/dicionario-portal.json não encontrado — " +
        "rode sem --gerar primeiro para baixar o dicionário");
    }
    dicionario = JSON.parse(readFileSync(ARQ_DICIONARIO, "utf8"));
    console.log("Dicionário local: " + Object.keys(dicionario).length + " lemas");
  } else {
    dicionario = await baixar();
  }
  // Complemento curado (offline) para palavras que o Portal não traz:
  // divisões conferidas para o corpus atual (ver scripts/silabas-extras.json).
  if (existsSync(ARQ_EXTRAS)) {
    var extras = JSON.parse(readFileSync(ARQ_EXTRAS, "utf8"));
    dicionario = Object.assign({}, dicionario, extras);
    console.log("Complemento local: " + Object.keys(extras).length + " lemas");
  }
  gerar(dicionario);
}

main().catch(function (e) {
  console.error("ERRO: " + e.message + " (cache salvo; reexecute para retomar)");
  process.exit(1);
});
