// Valida a base de palavras e os arquivos derivados. Roda offline.
//
// Uso:  node scripts/validar-palavras.mjs
//
// Checa:
//   - words.js: estrutura (12 temas canônicos), unicidade global (sem acento
//     e sem caixa), uma palavra por entrada (sem espaços), nível >= 120;
//   - dicionário do Portal: toda palavra (ou cada parte dos compostos com
//     hífen) tem divisão oficial; o que não tem vira AVISO (caso típico:
//     nomes próprios — o algoritmo do syllables.js assume);
//   - silabificação em runtime: as sílabas recompõem a palavra;
//   - silabas-portal.js: cada entrada confere com o dicionário;
//   - images.js: chaves existem no words.js, os emojis são não vazios e
//     têm SVG Twemoji em img/emoji/ (faltando, vira aviso — o onerror
//     do emoji.js cai para o emoji do sistema);
//   - vocabulario.js: estrutura das entradas (palavra em minúsculas e sem
//     repetição, significado presente, só os campos esperados);
//   - cobertura de rima por nível (Caça-Rimas) e distribuição silábica
//     (útil para revisar os textos de levels.js).
//
// Sai com código 1 se houver ERRO (avisos não derrubam).

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

var root = join(dirname(fileURLToPath(import.meta.url)), "..");
var TEMAS = ["animais", "alimentos", "cores", "numerais", "cidades", "nomes",
  "verbos", "natureza", "corpo", "objetos", "emoções", "outros"];

var erros = [];
var avisos = [];

function norm(s) {
  return s.toLowerCase().normalize("NFC")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function isProper(w) {
  var f = w.charAt(0);
  return f !== f.toLowerCase() && f === f.toUpperCase();
}

/* ---------- words.js ---------- */

var srcWords = readFileSync(join(root, "words.js"), "utf8");
var WORDS = new Function(srcWords + "\nreturn WORDS;")();

var niveis = Object.keys(WORDS).sort(function (a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
});
var visto = {};
var total = 0;

niveis.forEach(function (nivel) {
  var lvl = WORDS[nivel];
  Object.keys(lvl).forEach(function (tema) {
    if (TEMAS.indexOf(tema) === -1) {
      erros.push(nivel + ": tema inválido " + JSON.stringify(tema));
    }
  });
  var cont = 0;
  TEMAS.forEach(function (tema) {
    (lvl[tema] || []).forEach(function (w) {
      cont++;
      if (typeof w !== "string" || !w.trim()) {
        erros.push(nivel + "/" + tema + ": entrada vazia/inválida");
        return;
      }
      if (/[\s'’]/.test(w)) {
        erros.push(nivel + "/" + tema + ": entrada multi-palavra " +
          JSON.stringify(w) + " (a plataforma aceita UMA palavra por entrada)");
      }
      var k = norm(w);
      if (visto[k]) {
        erros.push(w + " duplicada (" + visto[k] + " e " + nivel + "/" + tema + ")");
      } else {
        visto[k] = nivel + "/" + tema;
      }
      if (isProper(w) && tema !== "nomes" && tema !== "cidades") {
        avisos.push(nivel + "/" + tema + ": " + w + " com inicial maiúscula " +
          "fora de nomes/cidades");
      }
    });
  });
  if (cont < 120) erros.push(nivel + ": só " + cont + " palavras (mínimo 120)");
  total += cont;
});

/* ---------- dicionário do Portal + silabas-portal.js ---------- */

var ARQ_DICT = join(root, "scripts", "dicionario-portal.json");
var dict = existsSync(ARQ_DICT)
  ? JSON.parse(readFileSync(ARQ_DICT, "utf8")) : null;
if (!dict) {
  avisos.push("scripts/dicionario-portal.json ausente — checagem de " +
    "divisões oficiais pulada");
}

var srcPortal = readFileSync(join(root, "silabas-portal.js"), "utf8");
globalThis.SILABAS_PORTAL = new Function(srcPortal + "\nreturn SILABAS_PORTAL;")();

var alvos = [];
niveis.forEach(function (nivel) {
  Object.keys(WORDS[nivel]).forEach(function (tema) {
    WORDS[nivel][tema].forEach(function (w) {
      alvos.push([w.toLowerCase().normalize("NFC"), nivel, tema]);
    });
  });
});

var semOficial = [];
alvos.forEach(function (par) {
  var w = par[0];
  var silabas = globalThis.SILABAS_PORTAL[w];
  if (dict) {
    var esperado = w.split("-").map(function (p) { return dict[p]; });
    var completo = esperado.every(Boolean);
    if (!completo) semOficial.push(w);
    if (silabas) {
      var soma = esperado.reduce(function (acc, s) {
        return acc && s ? acc.concat(s) : null;
      }, []);
      if (soma && norm(soma.join("")) !== norm(silabas.join(""))) {
        erros.push("silabas-portal.js diverge do dicionário em " + w +
          ": " + silabas.join("-") + " vs " + soma.join("-"));
      }
    } else if (completo) {
      erros.push(w + " tem divisão no dicionário mas não em silabas-portal.js " +
        "(regenere com: node scripts/baixar-dicionario-portal.js --gerar)");
    }
  }
});

if (dict && semOficial.length) {
  avisos.push(semOficial.length + " palavras sem divisão oficial (algoritmo " +
    "assume — confira grafia; nomes próprios são esperados): " +
    semOficial.join(", "));
}

/* ---------- silabificação em runtime ---------- */

var { syllables, rhymeKey } = await import(
  new URL("../syllables.js", import.meta.url).href);

var ruins = 0;
alvos.forEach(function (par) {
  var w = par[0];
  var syls = syllables(w);
  if (!syls.length || norm(syls.join("")) !== norm(w.replace(/-/g, ""))) {
    erros.push("silabificação não reconcilia: " + w + " -> " + syls.join("-"));
    ruins++;
  }
  if (syls.some(function (s) { return !s.trim(); })) {
    erros.push("sílaba vazia em: " + w);
  }
});

/* ---------- images.js ---------- */

var { IMAGES } = await import(new URL("../images.js", import.meta.url).href);
var { emojiFilename } = await import(new URL("../emoji.js", import.meta.url).href);
var semSvg = [];
Object.keys(IMAGES).forEach(function (w) {
  if (!visto[norm(w)]) avisos.push("images.js: " + w + " fora do words.js");
  if (!IMAGES[w] || !String(IMAGES[w]).trim()) {
    erros.push("images.js: emoji vazio para " + w);
    return;
  }
  // SVG Twemoji empacotado (emoji.js cai para o emoji do sistema se faltar,
  // mas o ideal é todo emoji mapeado ter arquivo).
  var svg = join(root, "img", "emoji", emojiFilename(IMAGES[w]) + ".svg");
  if (!existsSync(svg)) semSvg.push(w + " (" + IMAGES[w] + ")");
});
if (semSvg.length) {
  avisos.push(semSvg.length + " emoji(s) sem SVG em img/emoji/ " +
    "(fallback do sistema assume): " + semSvg.join(", "));
}

/* ---------- vocabulario.js (Palavras Desconhecidas) ---------- */

var { VOCABULARIO } = await import(new URL("../vocabulario.js", import.meta.url).href);
if (!Array.isArray(VOCABULARIO)) {
  erros.push("vocabulario.js: VOCABULARIO não é uma lista");
} else {
  if (VOCABULARIO.length < 20) {
    avisos.push("vocabulario.js: só " + VOCABULARIO.length +
      " entradas (pool pequeno: a rodada fica repetindo logo)");
  }
  var vistoVoc = {};
  VOCABULARIO.forEach(function (e, i) {
    var onde = "vocabulario.js[" + i + "]";
    if (!e || typeof e.palavra !== "string" || !e.palavra.trim()) {
      erros.push(onde + ": palavra vazia/inválida");
      return;
    }
    if (e.palavra !== e.palavra.trim()) {
      erros.push(onde + ": sobra espaço em " + JSON.stringify(e.palavra));
    }
    if (e.palavra !== e.palavra.toLowerCase()) {
      erros.push(onde + ": gravar em minúsculas " + JSON.stringify(e.palavra) +
        " (a caixa é aplicada na exibição)");
    }
    if (/\s/.test(e.palavra.trim())) {
      // a habilidade cobre "palavras OU expressões": entrada com espaço é
      // expressão — aceita, mas vale conferir a intenção.
      avisos.push(onde + ": entrada com espaço (expressão, não palavra): " +
        JSON.stringify(e.palavra));
    }
    var k = norm(e.palavra);
    if (vistoVoc[k]) {
      erros.push("vocabulario.js: palavra repetida " + JSON.stringify(e.palavra));
    }
    vistoVoc[k] = true;
    if (e.significado === undefined || e.significado === null ||
        !String(e.significado).trim()) {
      erros.push(onde + ": significado vazio para " + JSON.stringify(e.palavra));
    } else if (String(e.significado).length > 90) {
      avisos.push(onde + ": significado longo (" +
        String(e.significado).length + " caracteres) para " + JSON.stringify(e.palavra));
    }
    ["palavra", "significado"].forEach(function (campo) {
      if (e[campo] !== undefined && typeof e[campo] !== "string") {
        erros.push(onde + ": campo " + campo + " não é string");
      }
    });
    Object.keys(e).forEach(function (campo) {
      if (campo !== "palavra" && campo !== "significado") {
        erros.push(onde + ": campo desconhecido " + JSON.stringify(campo));
      }
    });
  });
}

/* ---------- relatórios ---------- */

console.log("Total: " + total + " palavras em " + niveis.length + " níveis; " +
  Object.keys(IMAGES).length + " emojis mapeados; " +
  (Array.isArray(VOCABULARIO) ? VOCABULARIO.length : 0) +
  " entradas de vocabulário (Palavras Desconhecidas)");

console.log("\nNível  palavras  sílabas(média)  comEmoji  comRima");
niveis.forEach(function (nivel) {
  var ws = [];
  Object.keys(WORDS[nivel]).forEach(function (tema) {
    ws = ws.concat(WORDS[nivel][tema]);
  });
  var sylTotal = ws.reduce(function (s, w) { return s + syllables(w).length; }, 0);
  var comEmoji = ws.filter(function (w) { return !!IMAGES[w]; });
  var chaves = {};
  ws.forEach(function (w) {
    var k = rhymeKey(w);
    (chaves[k] = chaves[k] || []).push(w);
  });
  var comRima = ws.filter(function (w) { return chaves[rhymeKey(w)].length > 1; });
  var alvosComEmojiComRima = comEmoji.filter(function (w) {
    return chaves[rhymeKey(w)].length > 1;
  });
  console.log(nivel + "  " + String(ws.length).padStart(7) + "  " +
    (sylTotal / ws.length).toFixed(1).padStart(13) + "  " +
    String(comEmoji.length).padStart(8) + "  " +
    String(comRima.length).padStart(7) + " (alvos de rima c/emoji: " +
    alvosComEmojiComRima.length + ")");
  if (comEmoji.length < 4) {
    avisos.push(nivel + ": só " + comEmoji.length +
      " palavras com emoji (Palavra e Imagem/Caça-Rimas precisam de >= 4)");
  }
});

var dist = {};
niveis.forEach(function (nivel) {
  dist[nivel] = {};
  Object.keys(WORDS[nivel]).forEach(function (tema) {
    WORDS[nivel][tema].forEach(function (w) {
      var c = syllables(w).length;
      dist[nivel][c] = (dist[nivel][c] || 0) + 1;
    });
  });
});
console.log("\nDistribuição silábica (para levels.js):");
niveis.forEach(function (nivel) {
  var partes = Object.keys(dist[nivel]).map(Number).sort(function (a, b) {
    return a - b;
  }).map(function (k) { return dist[nivel][k] + "×" + k; }).join(", ");
  console.log("  " + nivel + ": " + partes);
});

if (avisos.length) {
  console.log("\nAVISOS (" + avisos.length + "):");
  avisos.forEach(function (a) { console.log("  - " + a); });
}
if (erros.length) {
  console.log("\nERROS (" + erros.length + "):");
  erros.forEach(function (e) { console.log("  - " + e); });
  process.exit(1);
}
console.log("\nOK: sem erros.");
