// Camada única de mídia: emoji local (images.js) ou pictograma ARASAAC
// carregado direto do servidor (imagens.js).
//
// As imagens NÃO ficam no repositório: o site é online e o navegador busca
// https://api.arasaac.org/api/pictograms/{id}. O fallback (onerror) troca a
// imagem por um ícone neutro para não quebrar a atividade.

import { IMAGES } from "./images.js";
import { IMAGENS } from "./imagens.js";
import { emojiHTML } from "./emoji.js";

var ARASAAC = "https://api.arasaac.org/api/pictograms/";

// SVG neutro (imagem indisponível) — não revela a palavra da resposta.
var FALLBACK = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
  '<rect x="6" y="12" width="52" height="40" rx="6" fill="#e7e0d2" stroke="#8a7f6a" stroke-width="3"/>' +
  '<circle cx="22" cy="26" r="5" fill="#8a7f6a"/>' +
  '<path d="M10 48l14-14 9 9 8-7 13 12z" fill="#8a7f6a"/>' +
  "</svg>"
);

if (typeof window !== "undefined") {
  window.__figuraErro = function (img) {
    img.onerror = null;
    img.src = FALLBACK;
    img.alt = "";
  };
}

function chavePalavra(word) {
  return String(word).toLowerCase();
}

// Devolve { tipo: "imagem"|"emoji", ... } ou null.
export function figuraDe(word) {
  var k = chavePalavra(word);
  var img = IMAGENS[k];
  if (img) return { tipo: "imagem", id: img.id, src: ARASAAC + img.id };
  var em = IMAGES[word];
  if (em) return { tipo: "emoji", emoji: em };
  return null;
}

export function temFigura(word) {
  return !!figuraDe(word);
}

// Chave para comparar figuras em uma mesma questão (evita repetir a imagem).
export function figuraChave(word) {
  var f = figuraDe(word);
  if (!f) return "";
  return f.tipo === "imagem" ? "img:" + f.id : "emoji:" + f.emoji;
}

// HTML da figura. Para imagem remota usa loading=lazy e fallback neutro.
export function figuraHTML(word) {
  var f = figuraDe(word);
  if (!f) return "";
  if (f.tipo === "emoji") return emojiHTML(f.emoji);
  return '<img class="figura-img" src="' + f.src + '" alt="" ' +
    'loading="lazy" decoding="async" referrerpolicy="no-referrer" ' +
    'onerror="window.__figuraErro&&window.__figuraErro(this)">';
}
