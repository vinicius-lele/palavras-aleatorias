// Baixa a lista Word_Freq_Children (CIE-ISPA) — páginas alfabéticas A–Z.
import { writeFileSync } from "node:fs";

const UA = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36" };
const letras = "abcdefghijklmnopqrstuvwxyz".split("");
const linhas = [];

for (const letra of letras) {
  const r = await fetch("https://cie.ispa.pt/instruments/alphabetical/" + letra, { headers: UA });
  const h = await r.text();
  const rows = h.match(/<tr[\s\S]*?<\/tr>/g) || [];
  let n = 0;
  for (const tr of rows) {
    const cells = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1].replace(/<[^>]+>/g, "").trim());
    if (cells.length >= 3 && /^\d+$/.test(cells[1])) {
      linhas.push(cells[0] + "\t" + cells[1] + "\t" + cells[2]);
      n++;
    }
  }
  console.log(letra, n);
}

writeFileSync("scripts/word-freq-children.tsv", "palavra\tocorrencias\tpercentil\n" + linhas.join("\n") + "\n", "utf8");
console.log("total:", linhas.length);
