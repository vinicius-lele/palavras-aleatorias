// Extrai as tabelas do E-LEITURA (Banco de palavras, Ensino Fundamental I)
// do texto já decodificado e gera scripts/eleitura-banco.json:
//   { alta: [{palavra, silabas, freq}], media: [...], baixa: [...] }
import { readFileSync, writeFileSync } from "node:fs";

const texto = readFileSync(process.argv[2], "utf8");

// banda confiável = cabeçalho de página "LISTA DE PALAVRAS DE <BANDA> FREQUÊNCIA"
// (os títulos "Tabela Suplementar N" vêm fora de ordem nos streams do PDF)
let t = texto
  .replace(/LISTA DE PALAVRAS DE ALTA FREQUÊNCIA E-LEITURA I/g, "\n@ALTA\n")
  .replace(/LISTA DE PALAVRAS DE MÉDIA FREQUÊNCIA E-LEITURA I/g, "\n@MEDIA\n")
  .replace(/LISTA DE PALAVRAS DE BAIXA FREQUÊNCIA E-LEITURA I/g, "\n@BAIXA\n")
  .replace(/PalavrasNúmero sílabasEstrutura sílaba inicialFrequência Ocorrência/g, "")
  .replace(/Tabela Suplementar \d+\. Continuação\.*/g, "")
  .replace(/Tabela Suplementar \d+\.[^\n]*/g, "")
  .replace(/\d+\/41/g, "");

const bandas = { "@ALTA": [], "@MEDIA": [], "@BAIXA": [] };
// entrada: palavra + dígitos(sílabas) + estrutura [VC]+ + dígitos(frequência).
// Casa em texto SEM \n — o PDF quebra entradas no meio (ex.: "vaca2\nCV133").
const re = /([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ-]*?)(\d{1,2})([VC]{1,12})(\d{1,5})/g;
let banda = null;
for (const bloco of t.split(/\n(@ALTA|@MEDIA|@BAIXA)\n/)) {
  if (bandas[bloco] !== undefined) { banda = bloco; continue; }
  if (!banda) continue;
  for (const m of bloco.replace(/\n/g, "").matchAll(re)) {
    const palavra = m[1].toLowerCase();
    const silabas = Number(m[2]);
    const estrutura = m[3];
    const freq = Number(m[4]);
    if (silabas < 1 || silabas > 12) continue;
    // "Estrutura sílaba inicial" é só da 1ª sílaba — serve de sanidade mínima
    if (!/[VC]/.test(estrutura) || !estrutura.includes("V")) continue;
    if (palavra.length < 2 && !/[aeiouáéíóúâêôãõ]/i.test(palavra)) continue;
    bandas[banda].push({ palavra, silabas, freq });
  }
}

for (const [k, v] of Object.entries(bandas)) console.log(k, v.length, "entradas");
console.log("alta amostra:", bandas["@ALTA"].slice(0, 8).map((e) => e.palavra + "/" + e.silabas + "/" + e.freq).join(" "));
console.log("media amostra:", bandas["@MEDIA"].slice(0, 8).map((e) => e.palavra + "/" + e.silabas + "/" + e.freq).join(" "));
console.log("baixa amostra:", bandas["@BAIXA"].slice(0, 8).map((e) => e.palavra + "/" + e.silabas + "/" + e.freq).join(" "));
// checagem de sanidade: contagem de sílabas bate com nosso silabificador?
const { syllables } = await import(new URL("../syllables.js", import.meta.url).href);
let ok = 0, dif = 0, exemplos = [];
for (const e of bandas["@ALTA"]) {
  const n = syllables(e.palavra).length;
  if (n === e.silabas) ok++; else { dif++; if (exemplos.length < 8) exemplos.push(e.palavra + " pdf:" + e.silabas + " nos:" + n); }
}
console.log(`sanidade alta: ${ok} iguais, ${dif} diferentes | ex: ${exemplos.join(" | ")}`);

writeFileSync("scripts/eleitura-banco.json", JSON.stringify({
  alta: bandas["@ALTA"], media: bandas["@MEDIA"], baixa: bandas["@BAIXA"]
}), "utf8");
console.log("-> scripts/eleitura-banco.json");
