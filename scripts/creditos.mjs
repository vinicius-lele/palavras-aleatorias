// Gera a atribuição combinada das imagens (ARASAAC + Wikimedia Commons).
// Usado por scripts/gerar-imagens.mjs e scripts/gerar-fotos.mjs.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

var root = join(dirname(fileURLToPath(import.meta.url)), "..");
var ARQ_CREDITOS = join(root, "CREDITS.md");
var ARQ_CREDITOS_HTML = join(root, "creditos.html");

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function gerarCreditos(arasaac, fotos) {
  arasaac = arasaac || [];
  fotos = fotos || [];

  var linhasArasaac = arasaac.map(function (e) {
    return "<tr><td>" + esc(e.palavra) + "</td><td><a href=\"" + esc(e.url) +
      "\">" + esc(e.id) + "</a></td></tr>";
  }).join("\n");
  var linhasFotos = fotos.map(function (e) {
    return "<tr><td>" + esc(e.palavra) + "</td><td>" + esc(e.autor) +
      "</td><td>" + esc(e.licenca) + "</td><td><a href=\"" + esc(e.url) +
      "\">arquivo</a></td></tr>";
  }).join("\n");

  var html = "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n" +
    "<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
    "<title>Créditos das imagens — Palavras Aleatórias</title>\n" +
    "<style>body{font-family:system-ui,sans-serif;max-width:60rem;margin:2rem auto;padding:0 1rem;line-height:1.5}" +
    "table{border-collapse:collapse;width:100%;font-size:.9rem;margin-bottom:2rem}" +
    "td,th{border-bottom:1px solid #ddd;padding:.2rem .4rem;text-align:left}" +
    "h2{font-size:1.1rem;margin-top:2rem}</style>\n" +
    "</head>\n<body>\n<h1>Créditos das imagens</h1>\n" +
    "<p><a href=\"./\">← Voltar ao jogo</a></p>\n" +
    (arasaac.length ? "<h2>ARASAAC</h2>\n" +
      "<p>Os pictogramas são do <a href=\"https://arasaac.org\">ARASAAC</a>, " +
      "autor <strong>Sergio Palao</strong>, licenciados sob " +
      "<a href=\"https://creativecommons.org/licenses/by-nc-sa/4.0/\">CC BY-NC-SA 4.0</a> " +
      "(Governo de Aragão).</p>\n" +
      "<table><thead><tr><th>Palavra</th><th>Pictograma</th></tr></thead><tbody>\n" +
      linhasArasaac + "\n</tbody></table>\n" : "") +
    (fotos.length ? "<h2>Wikimedia Commons</h2>\n" +
      "<p>As fotos vêm do <a href=\"https://commons.wikimedia.org\">Wikimedia Commons</a>. " +
      "Cada linha traz o autor e a licença da respectiva imagem; consulte o arquivo " +
      "original para os termos completos.</p>\n" +
      "<table><thead><tr><th>Palavra</th><th>Autor</th><th>Licença</th><th>Arquivo</th></tr></thead><tbody>\n" +
      linhasFotos + "\n</tbody></table>\n" : "") +
    "<p>O projeto é gratuito e não exibe anúncios.</p>\n" +
    "</body>\n</html>\n";
  writeFileSync(ARQ_CREDITOS_HTML, html, "utf8");

  var md = "# Créditos das imagens\n\n" +
    (arasaac.length ? "## ARASAAC\n\n" +
      "Pictogramas do **ARASAAC** (https://arasaac.org), autor " +
      "**Sergio Palao**, licença **CC BY-NC-SA 4.0** " +
      "(https://creativecommons.org/licenses/by-nc-sa/4.0/), Governo de Aragão.\n\n" +
      "| Palavra | Pictograma |\n| --- | --- |\n" +
      arasaac.map(function (e) { return "| " + e.palavra + " | " + e.url + " |"; }).join("\n") +
      "\n\n" : "") +
    (fotos.length ? "## Wikimedia Commons\n\n" +
      "Fotos do **Wikimedia Commons**. Autor e licença por imagem; consulte o " +
      "arquivo original para os termos completos.\n\n" +
      "| Palavra | Autor | Licença | Arquivo |\n| --- | --- | --- | --- |\n" +
      fotos.map(function (e) {
        return "| " + e.palavra + " | " + e.autor + " | " + e.licenca +
          " | " + e.url + " |";
      }).join("\n") +
      "\n\n" : "") +
    "O projeto é gratuito e não exibe anúncios.\n";
  writeFileSync(ARQ_CREDITOS, md, "utf8");
}
