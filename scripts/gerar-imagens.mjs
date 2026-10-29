// Gera o mapa `imagens.js` (palavra -> pictograma ARASAAC) SEM baixar imagens.
//
// O site é online: o navegador carrega o pictograma direto de
// https://api.arasaac.org/api/pictograms/{id}. O repositório guarda apenas o
// mapa de IDs (pequeno) e os créditos.
//
// Uso:
//   node scripts/gerar-imagens.mjs --dry        # relatório, sem gravar
//   node scripts/gerar-imagens.mjs              # grava imagens.js + créditos
//   node scripts/gerar-imagens.mjs --refresh    # baixa de novo o índice ARASAAC
//   node scripts/gerar-imagens.mjs --limit 40   # lote piloto
//
// Licença: pictogramas ARASAAC (https://arasaac.org), autor Sergio Palao,
// CC BY-NC-SA 4.0. O projeto é gratuito e NÃO pode exibir anúncios.
// A atribuição fica em CREDITS.md e creditos.html (link "Créditos" no rodapé).
//
// `scripts/imagens-manual.json` permite fixar/ignorar palavras:
//   { "tatu": 8031, "palavra": "skip" }
//
// O índice completo (13.891 pictogramas, ~7,4 MB) é baixado uma vez para o
// tmpdir e reutilizado; não é commitado.

import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { gerarCreditos } from "./creditos.mjs";

var root = join(dirname(fileURLToPath(import.meta.url)), "..");
var ARQ_WORDS = join(root, "words.js");
var ARQ_EMOJIS = join(root, "images.js");
var ARQ_FONTE = join(root, "scripts", "imagens-fonte.json");
var ARQ_MANUAL = join(root, "scripts", "imagens-manual.json");
var ARQ_SAIDA = join(root, "imagens.js");
var CACHE = join(tmpdir(), "arasaac-br.json");

var LIMIT = Infinity;
for (var i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === "--limit") LIMIT = parseInt(process.argv[++i], 10);
}
var DRY = process.argv.includes("--dry");
var REFRESH = process.argv.includes("--refresh");
var SO_ANIMAIS = process.argv.includes("--animais");

var TEMAS = ["animais", "alimentos", "objetos", "natureza", "corpo", "cidades",
  "cores", "numerais", "verbos", "emoções", "outros"];

// Temas com referência visual concreta. Em "outros", só entram palavras do
// corpus manual (herança): a expansão automática tem muitos abstratos/técnicos
// que não rendem imagem honesta.
var CONCRETOS = ["animais", "alimentos", "objetos", "natureza", "corpo",
  "cidades", "cores", "numerais"];

// Verbos/funções abstratas: pictograma genérico confunde mais do que ajuda.
var ABSTRATOS = new Set(["ser", "estar", "haver", "ter", "ir", "vir", "poder",
  "querer", "dever", "saber", "conhecer", "achar", "parecer", "ficar", "tornar",
  "existir", "pertencer", "conter", "consistir", "depender", "precisar",
  "conseguir", "deixar", "fazer", "dizer", "falar", "pensar", "sentir", "amar",
  "odiar", "gostar", "importar", "significar", "representar", "acontecer",
  "ocorrer"]);

var UA = "palavras-aleatorias/1.0 (projeto educacional open-source; " +
  "pictogramas ARASAAC)";

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
// Chave exata (só caixa): preserva acentos para não confundir "filhós"
// (doce) com "filhos" (plural de filho), "bebê" com "bebe" etc.
function chave(s) {
  return String(s).toLowerCase().normalize("NFC").trim();
}
// Normalização sem acento: só para comparar tags/temas em inglês e a herança.
function norm(s) {
  return chave(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function isProper(w) {
  var f = w.charAt(0);
  return f !== f.toLowerCase() && f === f.toUpperCase();
}

var WORDS = new Function(readFileSync(ARQ_WORDS, "utf8") + "\nreturn WORDS;")();
var IMAGES = new Function(readFileSync(ARQ_EMOJIS, "utf8")
  .replace("export var IMAGES", "var IMAGES") + "\nreturn IMAGES;")();
var manual = existsSync(ARQ_MANUAL)
  ? JSON.parse(readFileSync(ARQ_MANUAL, "utf8")) : {};
var MANUAL_WORDS = new Function(readFileSync(join(root, "scripts", "words-manual.js"), "utf8") + "\nreturn WORDS;")();
var heranca = new Set();
for (var ml of Object.keys(MANUAL_WORDS)) {
  for (var mt of Object.keys(MANUAL_WORDS[ml])) {
    for (var mw of MANUAL_WORDS[ml][mt]) heranca.add(norm(mw));
  }
}

async function indice() {
  var baixar = REFRESH || !existsSync(CACHE);
  if (!baixar) {
    var idade = Date.now() - statSync(CACHE).mtimeMs;
    if (idade > 30 * 24 * 3600 * 1000) baixar = true;
  }
  if (baixar) {
    console.log("Baixando índice ARASAAC (all/br)...");
    var r = await fetch("https://api.arasaac.org/api/pictograms/all/br", {
      headers: { "User-Agent": UA }
    });
    if (!r.ok) throw new Error("ARASAAC HTTP " + r.status);
    writeFileSync(CACHE, await r.text(), "utf8");
  }
  var arr = JSON.parse(readFileSync(CACHE, "utf8"));
  var map = new Map();
  for (var p of arr) {
    for (var kw of p.keywords || []) {
      for (var term of [kw.keyword, kw.plural]) {
        if (!term) continue;
        var k = chave(term);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(p);
      }
    }
  }
  console.log("Índice: " + arr.length + " pictogramas, " + map.size + " termos");
  return { arr: arr, map: map };
}

function pontuar(p, word, theme) {
  var tags = (p.tags || []).map(norm).join(" ");
  var score = 0;
  var exato = false;
  (p.keywords || []).forEach(function (kw) {
    if (chave(kw.keyword) === chave(word)) { score += 10; exato = true; }
    if (kw.plural && chave(kw.plural) === chave(word)) { score += 8; exato = true; }
  });
  if (!exato) return null;
  var regras = {
    animais: ["animal"],
    alimentos: ["food", "feeding", "fruit", "vegetable", "meat", "drink"],
    objetos: ["object", "tool", "household", "clothing", "furniture"],
    natureza: ["nature", "plant", "tree", "flower", "weather"],
    corpo: ["body", "human body", "health"],
    cidades: ["building", "place", "city", "transport"],
    cores: ["color", "colour"],
    numerais: ["number", "mathematics"],
    verbos: ["action", "verb", "activity"],
    "emoções": ["emotion", "feeling", "mood"],
    outros: []
  };
  (regras[theme] || []).forEach(function (tag) {
    if (tags.indexOf(tag) !== -1) score += 3;
  });
  if (p.violence) score -= 20;
  if (p.sex) score -= 40;
  if (p.schematic) score -= 1;
  return score;
}

function escolher(lista, word, theme) {
  var melhor = null;
  (lista || []).forEach(function (p) {
    var score = pontuar(p, word, theme);
    if (score === null) return;
    if (!melhor || score > melhor.score ||
        (score === melhor.score && p._id < melhor.picto._id)) {
      melhor = { picto: p, score: score };
    }
  });
  return melhor;
}

function metaPicto(p, word) {
  return {
    id: p._id,
    fonte: "ARASAAC",
    autor: "Sergio Palao",
    licenca: "CC BY-NC-SA 4.0",
    url: "https://arasaac.org/pictograms/" + p._id
  };
}

async function main() {
  var idx = await indice();

  var candidatas = [];
  var vistos = {};
  for (var nivel of Object.keys(WORDS)) {
    for (var tema of Object.keys(WORDS[nivel])) {
      if (TEMAS.indexOf(tema) === -1) continue;
      if (SO_ANIMAIS && tema !== "animais") continue;
      for (var w of WORDS[nivel][tema]) {
        var k = w.toLowerCase();
        if (vistos[k]) continue;
        vistos[k] = true;
        if (isProper(w) || w.indexOf("-") !== -1 || IMAGES[w]) continue;
        if (manual[k] === "skip") continue;
        if (ABSTRATOS.has(norm(w))) continue;
        var concreto = CONCRETOS.indexOf(tema) !== -1;
        if (!concreto && tema !== "verbos" && tema !== "emoções" &&
            !(tema === "outros" && heranca.has(norm(w)))) continue;
        if (tema === "outros" && !heranca.has(norm(w))) continue;
        candidatas.push({ word: w, key: k, level: nivel, theme: tema });
      }
    }
  }
  candidatas.sort(function (a, b) { return a.word.localeCompare(b.word, "pt-BR"); });
  if (Number.isFinite(LIMIT)) candidatas = candidatas.slice(0, LIMIT);
  var porTema = {};
  candidatas.forEach(function (c) { porTema[c.theme] = (porTema[c.theme] || 0) + 1; });
  console.log("Candidatas: " + candidatas.length, JSON.stringify(porTema));

  var fonte = (Number.isFinite(LIMIT) && existsSync(ARQ_FONTE))
    ? JSON.parse(readFileSync(ARQ_FONTE, "utf8")) : {};
  var novos = [];
  var sem = [];

  for (var c of candidatas) {
    var escolhido = null;
    if (manual[c.key] && manual[c.key] !== "skip") {
      var p = idx.arr.find(function (x) { return x._id === manual[c.key]; });
      if (p) escolhido = { picto: p, score: 100 };
    }
    if (!escolhido) escolhido = escolher(idx.map.get(chave(c.word)), c.word, c.theme);
    if (!escolhido) { sem.push(c.word); continue; }
    fonte[c.key] = {
      id: escolhido.picto._id,
      palavra: c.word,
      tema: c.theme,
      score: escolhido.score
    };
    novos.push({ word: c.word, meta: metaPicto(escolhido.picto, c.word) });
  }

  if (DRY) {
    console.log("--dry: " + novos.length + " selecionadas, " + sem.length +
      " sem pictograma");
    console.log("sem pictograma: " + sem.join(", "));
    return;
  }

  var antigos = {};
  if (Number.isFinite(LIMIT) && existsSync(ARQ_SAIDA)) {
    try {
      antigos = new Function(readFileSync(ARQ_SAIDA, "utf8")
        .replace("export var IMAGENS", "var IMAGENS") + "\nreturn IMAGENS;")();
    } catch (e) { antigos = {}; }
  }
  novos.forEach(function (n) { antigos[n.word] = n.meta; });

  var chaves = Object.keys(antigos).sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });
  var corpo = chaves.map(function (k) {
    return "  " + JSON.stringify(k) + ": " + JSON.stringify(antigos[k]) + ",";
  }).join("\n");
  var header = "// \u26a0\ufe0f ARQUIVO GERADO POR scripts/gerar-imagens.mjs \u2014 N\u00c3O EDITE \u00c0 M\u00c3O.\n" +
    "//\n// Pictogramas ARASAAC (https://arasaac.org), autor Sergio Palao,\n" +
    "// licen\u00e7a CC BY-NC-SA 4.0. Veja CREDITS.md e creditos.html.\n" +
    "//\n// O projeto \u00e9 gratuito e n\u00e3o exibe an\u00fancios enquanto usar este acervo.\n" +
    "// As imagens s\u00e3o carregadas de https://api.arasaac.org/api/pictograms/{id};\n" +
    "// o reposit\u00f3rio guarda s\u00f3 o mapa de IDs.\n" +
    "// Para refazer: node scripts/gerar-imagens.mjs\n\n" +
    "export var IMAGENS = {\n" + corpo + "\n};\n";
  writeFileSync(ARQ_SAIDA, header, "utf8");
  writeFileSync(ARQ_FONTE, JSON.stringify(fonte, null, 2) + "\n", "utf8");

  var entradas = chaves.map(function (k) {
    return { palavra: k, id: antigos[k].id, url: antigos[k].url };
  });
  var fotoEntradas = [];
  var ARQ_FOTOS = join(root, "scripts", "fotos-fonte.json");
  if (existsSync(ARQ_FOTOS)) {
    var fotos = JSON.parse(readFileSync(ARQ_FOTOS, "utf8"));
    fotoEntradas = Object.keys(fotos).sort(function (a, b) {
      return a.localeCompare(b, "pt-BR");
    }).map(function (k) {
      var f = fotos[k];
      return { palavra: k, autor: f.autor, licenca: f.licenca, url: f.url };
    });
  }
  gerarCreditos(entradas, fotoEntradas);

  console.log("Selecionadas: " + novos.length + "; sem pictograma: " + sem.length +
    "; total em imagens.js: " + chaves.length);
  if (sem.length) console.log("Sem pictograma: " + sem.join(", "));
}

main().catch(function (e) {
  console.error("ERRO: " + e.message);
  process.exit(1);
});
