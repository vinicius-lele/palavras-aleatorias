// Curadoria do corpus: mantém apenas palavras compatíveis com alunos de
// 1º ao 5º ano do ensino fundamental, com evidência de frequência escolar.
//
// Uso:  node scripts/curar-palavras.mjs           # filtra words.js (in-place)
//       node scripts/curar-palavras.mjs --dry     # só mostra o resultado
//
// REGRA DE MANUTENÇÃO (corte "firme" −600 + herança manual):
//   mantém a palavra se ELA SATISFIZER PELO MENOS UMA:
//     a) HERANÇA — já existia no corpus manual pré-expansão (5.295 palavras,
//        commit cad22fa~1: os 11 temas manuais + "outros"). É a curadoria
//        original da plataforma; a regra de frequência erra vocabulário
//        escolar legítimo (bugio, abobrinha, gengiva, calçar ficam entre
//        −600 e −690 cB no corpus geral), então o que é manual fica;
//     b) E-LEITURA (banco de palavras do Ensino Fundamental I, BR) —
//        qualquer banda (alta/média/baixa). Fonte: scripts/eleitura-banco.json,
//        extraído do PDF "Tabela Suplementar" (scripts/parsear-eleitura.js);
//     c) Word_Freq_Children (CIE-ISPA, PT) com percentil >= 70 em livros
//        infantis — scripts/word-freq-children.tsv;
//     d) wordfreq pt com frequência >= -600 cB (>= 1 em 1 milhão de tokens)
//        — scripts/wordfreq-pt.tsv (agrega Wikipedia, notícias, livros, legendas);
//   OU é nome próprio dos temas "nomes"/"cidades" (mantidos por inteiro).
//   Palavras da blocklist de conteúdo infantil são removidas SEMPRE, mesmo
//   que passem nas regras acima.
//
// Para regenerar a lista de herança (raro — só se o corpus pré-expansão
// mudar), extraia com:  git show cad22fa~1:words.js > words-manual.js
// e aponte CURAR_HERANCA nele. O padrão é scripts/words-manual.js, que é o
// snapshot commitado do corpus manual.
//
// A filtragem é por REMOÇÃO: tudo o que saiu antes (bloqueio de conteúdo
// infantil) continua fora. A estrutura tema x nível não muda (nível =
// faixa de sílabas), e a ordem original das palavras é preservada.
//
// Fontes regeneráveis:
//   node scripts/parsear-eleitura.js <pdf-texto>   # eleitura-banco.json
//   node scripts/baixar-word-freq-children.js      # word-freq-children.tsv
//   node scripts/baixar-wordfreq.js                # wordfreq-pt.tsv

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dry = process.argv.includes("--dry");

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s'-]+/g, "");
const ehProprio = (w) => /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(w);

// --- fonte a) E-LEITURA ---
const eleitura = JSON.parse(readFileSync(join(root, "scripts", "eleitura-banco.json"), "utf8"));
const cobreEleitura = new Set();
for (const lista of Object.values(eleitura)) for (const e of lista) cobreEleitura.add(norm(e.palavra));

// --- fonte b) Word_Freq_Children (ISPA) ---
const ispa = new Map();
for (const l of readFileSync(join(root, "scripts", "word-freq-children.tsv"), "utf8").trim().split("\n").slice(1)) {
  const [palavra, ocorrencias, percentile] = l.split("\t");
  const k = norm(palavra);
  const reg = { ocorrencias: Number(ocorrencias), percentile: Number(String(percentile).replace(",", ".")) };
  const antigo = ispa.get(k);
  if (!antigo || reg.ocorrencias > antigo.ocorrencias) ispa.set(k, reg);
}

// --- fonte c) wordfreq (centibels) ---
const wordfreq = new Map();
for (const l of readFileSync(join(root, "scripts", "wordfreq-pt.tsv"), "utf8").trim().split("\n").slice(1)) {
  const [palavra, cb] = l.split("\t");
  const k = norm(palavra);
  const v = Number(cb);
  const antigo = wordfreq.get(k);
  if (antigo === undefined || v > antigo) wordfreq.set(k, v);
}

const CB_MINIMO = -600; // corte firme aprovado: >= 1 em 1 milhão de tokens
const ISPA_MINIMO = 70; // percentil em corpus infantil

// --- fonte a) herança: corpus manual pré-expansão ---
const arqManual = process.env.CURAR_HERANCA ?? join(root, "scripts", "words-manual.js");
const heranca = new Set();
try {
  const manual = new Function(readFileSync(arqManual, "utf8") + "\nreturn WORDS;")();
  for (const nivel of Object.keys(manual))
    for (const arr of Object.values(manual[nivel]))
      for (const w of arr) heranca.add(norm(w));
} catch (e) {
  throw new Error("corpus manual não encontrado em " + arqManual + " — regenere com: git show cad22fa~1:words.js > scripts/words-manual.js (" + e.message + ")");
}

// --- blocklist de conteúdo impróprio para crianças (defesa em profundidade) ---
const BLOCK = new Set(
  [
    // anatomia/atos sexuais
    "penis", "pênis", "vulva", "vagina", "seio", "seios", "mamilo", "mamilos",
    "testículo", "testículos", "útero", "ovário", "ovários", "esperma", "sêmen",
    "orgasmo", "sexo", "transar", "transa", "foder", "fodido", "pube",
    "púbis", "pubis", "escroto", "libido", "tesão",
    // pornografia/erotismo
    "erótico", "erótica", "pornografia", "pornográfico", "pornográfica", "porno",
    "ninfeta", "cafetão", "boquete", "punheta", "piroca", "buceta", "boceta",
    "xoxota", "xereca", "siririca", "masturbar", "masturbação", "ejacular",
    "ejaculação", "adultério", "adúltero", "prostituta", "prostituição",
    // palavrões/desabono
    "puta", "puto", "putaria", "merda", "caralho", "porra", "bosta", "cu",
    "cuzão", "cuzudo", "cacete", "safado", "tarado", "pervertido", "pedofilia",
    "pedófilo", "corno", "viado", "bicha", "traveco", "arrombado", "vadia",
    // violência extrema
    "estupro", "estuprar", "estuprador", "violador", "suicídio", "suicidar",
    "homicídio", "assassinato", "assassino", "chacina", "tortura", "torturador",
    "massacre",
    // drogas ilícitas
    "maconha", "cocaína", "crack", "heroína", "marijuana", "ópio", "coca",
    "metanfetamina", " LSD ",
  ].map(norm)
);

const mantem = (w) => {
  const k = norm(w);
  if (BLOCK.has(k)) return false;
  return (
    heranca.has(k) ||
    cobreEleitura.has(k) ||
    (ispa.get(k)?.percentil ?? -1) >= ISPA_MINIMO ||
    (wordfreq.get(k) ?? -Infinity) >= CB_MINIMO
  );
};

// --- carrega e filtra ---
const src = readFileSync(join(root, "words.js"), "utf8");
const WORDS = new Function(src + "\nreturn WORDS;")();

const nomes = "nomes,cidades";
let antes = 0;
let depois = 0;
const removidas = [];
const porNivel = {};

for (const nivel of Object.keys(WORDS)) {
  porNivel[nivel] = 0;
  for (const tema of Object.keys(WORDS[nivel])) {
    const arr = WORDS[nivel][tema];
    antes += arr.length;
    const fica = arr.filter((w) => {
      // nomes próprios dos temas permitidos ficam sempre
      if (ehProprio(w) && nomes.includes(tema)) return true;
      const ok = mantem(w);
      if (!ok) removidas.push(w);
      return ok;
    });
    WORDS[nivel][tema] = fica;
    depois += fica.length;
    porNivel[nivel] += fica.length;
  }
}

console.log(`curadoria: ${antes} -> ${depois} palavras (removidas ${antes - depois}, ${(((antes - depois) / antes) * 100).toFixed(1)}%)`);
for (const nivel of Object.keys(porNivel)) console.log(`  ${nivel}: ${porNivel[nivel]}`);
if (removidas.length < 40) console.log("removidas:", removidas.join(", "));
else console.log("amostra removida:", removidas.slice(0, 30).join(", "), "...");

// valida mínimo por nível antes de gravar
for (const [nivel, n] of Object.entries(porNivel)) {
  if (n < 120) throw new Error(`${nivel} ficou com ${n} palavras (mínimo do validador: 120)`);
}
if (dry) { console.log("--dry: nada gravado"); process.exit(0); }

// --- grava no mesmo formato do words.js: temas com recuo, 10 por linha ---
function formatar(palavras) {
  const linhas = [];
  for (let i = 0; i < palavras.length; i += 10) {
    linhas.push(
      "      " +
        palavras
          .slice(i, i + 10)
          .map((p) => JSON.stringify(p))
          .join(", ") +
        (i + 10 < palavras.length ? "," : "")
    );
  }
  return linhas.join("\n");
}

const cabecalho = [
  "// Listas de palavras por nível, organizadas por tema.",
  "// Estrutura: nivelX -> tema -> array de palavras.",
  "//",
  "// Temas válidos (use exatamente estes nomes):",
  "//   animais, alimentos, cores, numerais, cidades, nomes,",
  "//   verbos, natureza, corpo, objetos, emoções, outros",
  "//",
  "// CURADORIA ESCOLAR (1º ao 5º ano do ensino fundamental): cada palavra é do",
  "// corpus manual original (11 temas + \"outros\" pré-expansão) OU tem evidência",
  "// de frequência em pelo menos uma fonte — E-LEITURA (banco de palavras do",
  "// Ensino Fundamental I), Word_Freq_Children (percentil >= 70 em livros",
  "// infantis) ou wordfreq pt (>= -600 cB, 1 em 1 milhão de tokens). Temas",
  "// \"nomes\" e \"cidades\" mantêm os nomes próprios.",
  "// Regenere/apure com:  node scripts/curar-palavras.mjs",
  "//",
  "// O nível é faixa de sílabas (1-2 / 3 / 4 / 5 / 6+), não ano escolar.",
  "// Para adicionar um nível novo, basta criar uma nova chave (nivel6, ...)",
  "// e ele aparece automaticamente no select. Cada nível deve ter no",
  "// mínimo 120 palavras.",
  "const WORDS = {",
].join("\n");

const blocos = Object.keys(WORDS)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((nivel) => {
    const partes = Object.keys(WORDS[nivel]).map(
      (tema) => "    " + JSON.stringify(tema) + ": [\n" + formatar(WORDS[nivel][tema]) + "\n    ]"
    );
    return "  " + JSON.stringify(nivel) + ": {\n" + partes.join(",\n") + "\n  }";
  });

writeFileSync(join(root, "words.js"), cabecalho + blocos.join(",\n") + "\n};\n", "utf8");
console.log("-> words.js gravado (" + depois + " palavras)");
