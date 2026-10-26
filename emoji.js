// Renderização de emoji com SVG empacotado + fallback para o emoji do sistema.
//
// IMAGES (images.js) guarda o emoji como caractere Unicode. Para exibir,
// usamos o SVG do Twemoji em img/emoji/<codepoints>.svg — visual idêntico
// em Windows/iPhone/Android e nítido em tela cheia. Se o arquivo não existir
// (ou falhar ao carregar), o onerror troca a <img> pelo próprio emoji em
// texto, que o sistema renderiza — o app nunca fica sem imagem.
//
// Nome do arquivo: codepoints em hex minúsculo separados por "-", SEM o
// VS16 (U+FE0F). Ex.: "🐶" -> 1f436.svg, "👨‍⚕" -> 1f468-200d-2695.svg.

// Extrai o nome de arquivo Twemoji de um emoji (ou sequência).
export function emojiFilename(emoji) {
  var s = String(emoji);
  var out = [];
  for (var i = 0; i < s.length; i++) {
    var cp = s.codePointAt(i);
    if (cp > 0xffff) i++; // par surrogate: consome o baixo
    if (cp === 0xfe0f) continue; // VS16 não entra no nome
    out.push(cp.toString(16));
  }
  return out.join("-");
}

// HTML da imagem. `alt` carrega o emoji em texto: é o que o fallback
// (onerror) devolve ao sistema, e também o que leitores de tela anunciam.
// Sem aspas especiais nos atributos — emoji nunca as contêm.
export function emojiHTML(emoji) {
  var e = String(emoji);
  return '<img class="emoji-svg" src="img/emoji/' + emojiFilename(e) +
    '.svg" alt="' + e + '" onerror="this.outerHTML=this.alt">';
}
