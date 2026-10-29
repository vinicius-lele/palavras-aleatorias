// Gera `fotos.js` (palavra -> foto do Wikimedia Commons) para fauna/flora
// que ainda não tem figura. Não baixa as fotos: usa hotlink via
// Special:FilePath e guarda autor/licença para a atribuição.
//
// Uso:
//   node scripts/gerar-fotos.mjs --dry
//   node scripts/gerar-fotos.mjs --temas animais,alimentos
//   node scripts/gerar-fotos.mjs --limit 40
//   node scripts/gerar-fotos.mjs --refresh
//
// Fonte: imagem principal do artigo da Wikipédia em português, com metadados
// do Wikimedia Commons. Só entram licenças CC0/domínio público/CC BY/CC BY-SA
// (inclusive NC, pois o projeto não tem anúncios). Imagens não livres são
// descartadas.
//
// `scripts/fotos-manual.json` permite ignorar/trocar palavras:
//   { "gavião": "skip" }

import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { gerarCreditos } from "./creditos.mjs";

var root = join(dirname(fileURLToPath(import.meta.url)), "..");
var ARQ_WORDS = join(root, "words.js");
var ARQ_EMOJIS = join(root, "images.js");
var ARQ_ARASAAC = join(root, "imagens.js");
var ARQ_GERADAS = join(root, "figuras-geradas.js");
var ARQ_FONTE = join(root, "scripts", "fotos-fonte.json");
var ARQ_MANUAL = join(root, "scripts", "fotos-manual.json");
var ARQ_SAIDA = join(root, "fotos.js");
var CACHE = join(tmpdir(), "ptwiki-pageimages.json");

var LIMIT = Infinity;
var TEMAS = ["animais", "alimentos", "natureza"];
for (var i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === "--limit") LIMIT = parseInt(process.argv[++i], 10);
  if (process.argv[i] === "--temas") {
    TEMAS = String(process.argv[++i] || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }
}
var DRY = process.argv.includes("--dry");
var REFRESH = process.argv.includes("--refresh");

var UA = "palavras-aleatorias/1.0 (projeto educacional open-source; " +
  "fotos do Wikimedia Commons)";
var DELAY_MS = 1200;

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function norm(s) {
  return String(s).toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim();
}
function isProper(w) {
  var f = w.charAt(0);
  return f !== f.toLowerCase() && f === f.toUpperCase();
}
function limparHTML(s) {
  return String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

var WORDS = new Function(readFileSync(ARQ_WORDS, "utf8") + "\nreturn WORDS;")();
var IMAGES = new Function(readFileSync(ARQ_EMOJIS, "utf8")
  .replace("export var IMAGES", "var IMAGES") + "\nreturn IMAGES;")();
var IMAGENS = new Function(readFileSync(ARQ_ARASAAC, "utf8")
  .replace("export var IMAGENS", "var IMAGENS") + "\nreturn IMAGENS;")();
var FIGURAS = new Function(readFileSync(ARQ_GERADAS, "utf8")
  .replace("export var FIGURAS", "var FIGURAS") + "\nreturn FIGURAS;")();
var manual = existsSync(ARQ_MANUAL)
  ? JSON.parse(readFileSync(ARQ_MANUAL, "utf8")) : {};

var cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, "utf8")) : {};

function resolverTitulo(word, normalized, redirects) {
  var t = normalized[word] || word;
  for (var i = 0; i < 5; i++) {
    if (!redirects[t]) break;
    t = redirects[t];
  }
  return t;
}

// Consulta até 20 títulos por requisição (a API da Wikipédia limita muito
// requisições isoladas; em lote a coleta fica rápida e estável).
async function paginas(palavras) {
  var pendentes = palavras.filter(function (w) {
    return REFRESH || cache[w.toLowerCase()] === undefined;
  });
  for (var i = 0; i < pendentes.length; i += 20) {
    var lote = pendentes.slice(i, i + 20);
    var url = "https://pt.wikipedia.org/w/api.php?action=query&format=json" +
      "&prop=pageimages&piprop=original|name&redirects=1&titles=" +
      encodeURIComponent(lote.join("|"));
    for (var t = 1; t <= 5; t++) {
      try {
        var r = await fetch(url, { headers: { "User-Agent": UA } });
        if (r.status === 429) { await sleep(4000 * t); continue; }
        if (!r.ok) throw new Error("HTTP " + r.status);
        var j = await r.json();
        var normalized = {};
        (j.query.normalized || []).forEach(function (n) { normalized[n.from] = n.to; });
        var redirects = {};
        (j.query.redirects || []).forEach(function (x) { redirects[x.from] = x.to; });
        var porTitulo = {};
        Object.values(j.query.pages).forEach(function (p) { porTitulo[p.title] = p; });
        lote.forEach(function (w) {
          var titulo = resolverTitulo(w, normalized, redirects);
          var p = porTitulo[titulo];
          var out = null;
          if (p && !p.missing && p.original) {
            var file = p.pageimage;
            if (!file) file = decodeURIComponent(p.original.source.split("/").pop());
            out = { file: file.replace(/ /g, "_"), titulo: p.title };
          }
          cache[w.toLowerCase()] = out;
        });
        writeFileSync(CACHE, JSON.stringify(cache), "utf8");
        break;
      } catch (e) {
        if (t === 5) {
          lote.forEach(function (w) { cache[w.toLowerCase()] = null; });
          break;
        }
        await sleep(2000 * t);
      }
    }
    await sleep(400);
  }
}

var LIC_OK = /^(CC0|Public domain|CC BY|CC BY-SA|CC BY-NC|CC BY-NC-SA)/i;
var LIC_RUIM = /(GFDL|non-free|fair use|copyright|all rights reserved)/i;

async function metadados(files) {
  var out = {};
  for (var i = 0; i < files.length; i += 20) {
    var lote = files.slice(i, i + 20);
    var titles = lote.map(function (f) { return "File:" + f; }).join("|");
    var url = "https://commons.wikimedia.org/w/api.php?action=query&format=json" +
      "&prop=imageinfo&iiprop=extmetadata|url&titles=" + encodeURIComponent(titles);
    for (var t = 1; t <= 4; t++) {
      try {
        var r = await fetch(url, { headers: { "User-Agent": UA } });
        if (r.status === 429) { await sleep(5000 * t); continue; }
        if (!r.ok) throw new Error("HTTP " + r.status);
        var j = await r.json();
        Object.values(j.query.pages).forEach(function (p) {
          if (!p.imageinfo || !p.imageinfo[0]) return;
          var md = p.imageinfo[0].extmetadata || {};
          var file = p.title.replace(/^File:/, "").replace(/ /g, "_");
          var autor = limparHTML(md.Artist ? md.Artist.value : "") ||
            limparHTML(md.Credit ? md.Credit.value : "") ||
            limparHTML(md.Attribution ? md.Attribution.value : "");
          out[file] = {
            licenca: md.LicenseShortName ? md.LicenseShortName.value : "",
            autor: autor,
            descricao: limparHTML(md.ImageDescription ? md.ImageDescription.value : "")
          };
        });
        break;
      } catch (e) {
        if (t === 4) throw e;
        await sleep(2000 * t);
      }
    }
    await sleep(300);
  }
  return out;
}

function creditosArasaac() {
  return Object.keys(IMAGENS).sort(function (a, b) {
    return a.localeCompare(b, "pt-BR");
  }).map(function (k) {
    return { palavra: k, id: IMAGENS[k].id, url: IMAGENS[k].url };
  });
}

async function main() {
  var candidatas = [];
  var vistos = {};
  for (var nivel of Object.keys(WORDS)) {
    for (var tema of Object.keys(WORDS[nivel])) {
      if (TEMAS.indexOf(tema) === -1) continue;
      for (var w of WORDS[nivel][tema]) {
        var k = w.toLowerCase();
        if (vistos[k]) continue;
        vistos[k] = true;
        if (isProper(w) || w.indexOf("-") !== -1) continue;
        if (IMAGES[w] || IMAGENS[k] || FIGURAS[k]) continue;
        if (manual[k] === "skip") continue;
        candidatas.push({ word: w, key: k, tema: tema, nivel: nivel });
      }
    }
  }
  candidatas.sort(function (a, b) { return a.word.localeCompare(b.word, "pt-BR"); });
  if (Number.isFinite(LIMIT)) candidatas = candidatas.slice(0, LIMIT);
  console.log("Candidatas: " + candidatas.length, JSON.stringify(
    candidatas.reduce(function (acc, c) { acc[c.tema] = (acc[c.tema] || 0) + 1; return acc; }, {})
  ));

  var achadas = [];
  var sem = [];
  await paginas(candidatas.map(function (c) { return c.word; }));
  for (var c of candidatas) {
    var p = cache[c.key];
    if (!p) { sem.push(c.word); continue; }
    achadas.push({ word: c.word, key: c.key, tema: c.tema, file: p.file, titulo: p.titulo });
  }

  var files = Array.from(new Set(achadas.map(function (a) { return a.file; })));
  console.log("Com página/imagem: " + achadas.length + "; arquivos únicos: " + files.length +
    "; sem imagem: " + sem.length);
  if (DRY) {
    console.log("--dry: nada gravado");
    if (sem.length) console.log("Sem imagem: " + sem.join(", "));
    return;
  }

  var metas = await metadados(files);
  var fonte = existsSync(ARQ_FONTE)
    ? JSON.parse(readFileSync(ARQ_FONTE, "utf8")) : {};
  if (!Number.isFinite(LIMIT)) {
    var validas = new Set(candidatas.map(function (c) { return c.key; }));
    Object.keys(fonte).forEach(function (k) {
      if (!validas.has(k)) delete fonte[k];
    });
  }
  var aceitas = 0;
  var mantidas = 0;
  var recusadas = [];
  for (var a of achadas) {
    var m = metas[a.file] || {};
    var lic = m.licenca || "";
    var metaOk = !!m.licenca;
    if (LIC_OK.test(lic) && !LIC_RUIM.test(lic)) {
      var precisaAutor = /^CC BY/i.test(lic) && !/public domain|cc0/i.test(lic);
      if (precisaAutor && !m.autor) {
        delete fonte[a.key];
        recusadas.push(a.word + " (sem autor)");
        continue;
      }
      var nome = a.file;
      var arquivo = "https://commons.wikimedia.org/wiki/Special:FilePath/" +
        encodeURIComponent(nome) + "?width=500";
      fonte[a.key] = {
        arquivo: arquivo,
        arquivoNome: nome,
        fonte: "Wikimedia Commons",
        autor: m.autor || "Wikimedia Commons",
        licenca: lic,
        url: "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(nome),
        titulo: a.titulo
      };
      aceitas++;
    } else if (!metaOk && fonte[a.key] && !Number.isFinite(LIMIT)) {
      // Metadados do Commons falharam nesta execução: preserva a entrada
      // já validada em uma rodada anterior.
      mantidas++;
    } else {
      delete fonte[a.key];
      recusadas.push(a.word + " (" + (lic || "sem licença") + ")");
    }
  }

  // Remove entradas de palavras que deixaram de ser candidatas (skip etc.).
  // (feito acima, antes de preservar entradas antigas)

  var chaves = Object.keys(fonte).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
  var corpo = chaves.map(function (k) {
    return "  " + JSON.stringify(k) + ": " + JSON.stringify(fonte[k]) + ",";
  }).join("\n");
  writeFileSync(ARQ_SAIDA, "// \u26a0\ufe0f ARQUIVO GERADO POR scripts/gerar-fotos.mjs \u2014 N\u00c3O EDITE \u00c0 M\u00c3O.\n" +
    "//\n// Fotos do Wikimedia Commons por hotlink (Special:FilePath).\n" +
    "// Autor e licen\u00e7a por imagem; veja CREDITS.md e creditos.html.\n" +
    "// Para refazer: node scripts/gerar-fotos.mjs\n\n" +
    "export var FOTOS = {\n" + corpo + "\n};\n", "utf8");
  writeFileSync(ARQ_FONTE, JSON.stringify(fonte, null, 2) + "\n", "utf8");

  var fotosCreditos = chaves.map(function (k) {
    return { palavra: k, autor: fonte[k].autor, licenca: fonte[k].licenca, url: fonte[k].url };
  });
  gerarCreditos(creditosArasaac(), fotosCreditos);

  console.log("Aceitas: " + aceitas + "; mantidas de rodada anterior: " + mantidas +
    "; recusadas por licença: " + recusadas.length +
    "; total em fotos.js: " + chaves.length);
  if (recusadas.length) console.log("Recusadas: " + recusadas.join(", "));
  if (sem.length) console.log("Sem imagem: " + sem.join(", "));
}

main().catch(function (e) {
  console.error("ERRO: " + e.message);
  process.exit(1);
});
