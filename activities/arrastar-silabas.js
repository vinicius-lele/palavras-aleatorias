// Montar com Sílabas — arrastar e soltar: as sílabas da palavra aparecem
// embaralhadas na bandeja e a criança as arrasta (ou toca) para a área de
// montagem. Vale como acerto apenas a ordem exata (CHI-NE-LO, nunca
// NE-CHI-LO). A palavra nunca aparece na tela antes da resposta; o emoji,
// quando existe, é a única dica de significado.
//
// O arrastar usa Pointer Events (funciona igual no mouse e no toque) e o
// toque no bloco também move — caminho alternativo para quem tem dificuldade
// com o arrasto (e para teclado: os blocos são botões).

import { createQuiz } from "../quiz.js";
import { syllables } from "../syllables.js";
import { wordsForLevel, isProperNoun, initialUpper } from "../words-data.js";
import { IMAGES } from "../images.js";
import { emojiHTML } from "../emoji.js";

function pickUnused(pool, round) {
  if (round.pool.length === 0) round.pool = pool.slice();
  var i = Math.floor(Math.random() * round.pool.length);
  return round.pool.splice(i, 1)[0];
}

// Índices 0..n-1 embaralhados em deranjo: NENHUM bloco pode cair na posição
// certa (senão a resposta já apareceria meio pronta na bandeja). O fallback
// (rotação de 1) é sempre um deranjo válido para n >= 2.
function ordemEmbaralhada(n) {
  var idx = [];
  for (var i = 0; i < n; i++) idx.push(i);
  for (var t = 0; t < 20; t++) {
    var a = idx.slice();
    for (var j = a.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = a[j]; a[j] = a[k]; a[k] = tmp;
    }
    if (a.every(function (v, pos) { return v !== pos; })) return a;
  }
  var r = idx.slice(1);
  r.push(0);
  return r;
}

// Blocos coloridos por sílaba: a correção oficial (Q21a). Em nomes próprios,
// o primeiro bloco mantém a inicial maiúscula (syllables() normaliza para
// minúsculas — a caixa é só de exibição, e nunca aparece antes da resposta).
function blocksHTML(syls, word) {
  var shown = syls.map(function (s, i) {
    return (i === 0 && isProperNoun(word)) ? initialUpper(s) : s;
  });
  return '<div class="blocos" aria-hidden="true">' +
    shown.map(function (s) {
      return '<span class="bloco">' + s + "</span>";
    }).join("") +
    "</div>";
}

export function createArrastarSilabas() {
  return createQuiz({
    id: "arrastar-silabas",
    nome: "Montar com Sílabas",
    icone: "🧩",
    bncc: ["EF01LP06", "EF02LP02"],

    createQuestion: function (nivel, round) {
      // Só dá para embaralhar palavras com 2+ sílabas, e "be-be" (tudo
      // igual) não admite outra ordem — fica de fora.
      var pool = wordsForLevel(nivel).filter(function (w) {
        var s = syllables(w);
        return s.length >= 2 && s.some(function (x) { return x !== s[0]; });
      });
      if (pool.length < 4) return null;

      var word = pickUnused(pool, round);
      var syls = syllables(word);
      var ordem = ordemEmbaralhada(syls.length);
      var emoji = IMAGES[word];

      return {
        // Sem a palavra: só o significado (emoji, se houver) e a instrução.
        prompt: (emoji ? '<span class="enunciado-emoji">' + emojiHTML(emoji) + "</span>" : "") +
                '<span class="enunciado-dica">Arraste as sílabas para a área tracejada e monte a palavra.</span>',
        // Blocos corrigidos entram após a resposta (Q21a), tempo maior.
        feedbackHTML: blocksHTML(syls, word),
        feedbackMs: 1600,

        custom: function (host, report) {
          var CORES = ["#2E7D6F", "#3B7DD8", "#D9822B", "#8E44AD"];
          var total = syls.length;
          var locked = false;
          var arrastou = false;

          host.innerHTML =
            '<div class="arrastar">' +
              '<div class="arrastar-zona" data-el="zona">' +
                '<span class="arrastar-zona-vazia" data-el="vazio">Arraste para cá</span>' +
              "</div>" +
              '<div class="arrastar-bandeja" data-el="bandeja"></div>' +
              '<button class="btn-primario arrastar-conferir" data-el="conferir" type="button" disabled>Conferir</button>' +
            "</div>";

          var zona = host.querySelector('[data-el="zona"]');
          var vazio = host.querySelector('[data-el="vazio"]');
          var bandeja = host.querySelector('[data-el="bandeja"]');
          var btnConferir = host.querySelector('[data-el="conferir"]');

          ordem.forEach(function (origIdx, pos) {
            var chip = document.createElement("button");
            chip.type = "button";
            chip.className = "syl-chip";
            chip.dataset.idx = String(origIdx);
            // Posição inicial na bandeja: devolver um bloco o reinsere aqui,
            // então a ordem embaralhada nunca vira a resposta por acaso.
            chip.dataset.pos = String(pos);
            // Cor pela posição embaralhada, nunca pela palavra: a paleta
            // não pode denunciar onde o bloco entra.
            chip.style.background = CORES[pos % CORES.length];
            chip.textContent = syls[origIdx];
            bandeja.appendChild(chip);
            ligaChip(chip);
          });

          function atualizaZona() {
            var n = zona.querySelectorAll(".syl-chip").length;
            vazio.hidden = n > 0;
            btnConferir.disabled = locked || n !== total;
          }

          function movePara(chip, destino) {
            destino.appendChild(chip);
            atualizaZona();
          }

          // Devolve ao lugar inicial do bloco na bandeja: a ordem
          // embaralhada fica estável e nunca entrega a resposta.
          function voltaPraBandeja(chip) {
            var pos = Number(chip.dataset.pos);
            var irmaos = bandeja.querySelectorAll(".syl-chip");
            for (var i = 0; i < irmaos.length; i++) {
              if (Number(irmaos[i].dataset.pos) > pos) {
                bandeja.insertBefore(chip, irmaos[i]);
                atualizaZona();
                return;
              }
            }
            bandeja.appendChild(chip);
            atualizaZona();
          }

          // Toque/tecla: alterna entre bandeja e zona (antes de conferir).
          // `arrastou` evita que o clique gerado ao fim de um arrasto mova
          // o bloco de novo: o próximo gesto (pointerdown/keydown) o limpa,
          // e o clique órfão consome a bandeira ao ser engolido.
          function ligaChip(chip) {
            chip.addEventListener("click", function () {
              if (locked) return;
              if (arrastou) { arrastou = false; return; }
              if (chip.parentNode === zona) voltaPraBandeja(chip);
              else movePara(chip, zona);
            });

            chip.addEventListener("keydown", function () { arrastou = false; });

            var startX = 0, startY = 0, offX = 0, offY = 0, moved = false;

            chip.addEventListener("pointerdown", function (e) {
              if (locked || e.button > 0) return;
              arrastou = false; // novo gesto
              startX = e.clientX; startY = e.clientY; moved = false;
              chip.setPointerCapture(e.pointerId);
              chip.addEventListener("pointermove", onMove);
              chip.addEventListener("pointerup", onUp);
              chip.addEventListener("pointercancel", onUp);
            });

            function onMove(e) {
              if (locked) return;
              if (!moved) {
                // Só arrasta depois de uma folga de 6px: toque firme não conta.
                if (Math.abs(e.clientX - startX) < 6 &&
                    Math.abs(e.clientY - startY) < 6) return;
                var r = chip.getBoundingClientRect();
                offX = startX - r.left;
                offY = startY - r.top;
                moved = true;
                chip.classList.add("syl-arrastando");
              }
              chip.style.left = (e.clientX - offX) + "px";
              chip.style.top = (e.clientY - offY) + "px";
              zona.classList.toggle("arrastar-zona-sobre", !!alvoEm(e.clientX, e.clientY, zona));
            }

            function onUp(e) {
              chip.removeEventListener("pointermove", onMove);
              chip.removeEventListener("pointerup", onUp);
              chip.removeEventListener("pointercancel", onUp);
              zona.classList.remove("arrastar-zona-sobre");
              if (!moved) return; // foi um toque: o click resolve
              chip.classList.remove("syl-arrastando");
              chip.style.left = "";
              chip.style.top = "";
              var alvo = alvoEm(e.clientX, e.clientY, zona) ||
                         alvoEm(e.clientX, e.clientY, bandeja);
              if (alvo === zona) movePara(chip, zona);
              else if (alvo === bandeja) voltaPraBandeja(chip);
              // Fora de qualquer área, o bloco volta sozinho ao lugar.
              arrastou = true;
            }
          }

          function dentro(el, x, y) {
            var r = el.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
          }

          function alvoEm(x, y, el) {
            return dentro(el, x, y) ? el : null;
          }

          btnConferir.addEventListener("click", function () {
            if (locked) return;
            locked = true;
            btnConferir.disabled = true;
            var chips = zona.querySelectorAll(".syl-chip");
            var ok = true;
            for (var i = 0; i < chips.length; i++) {
              if (chips[i].dataset.idx !== String(i)) { ok = false; break; }
            }
            zona.classList.add(ok ? "arrastar-ok" : "arrastar-erro");
            report(ok);
          });

          atualizaZona();
        }
      };
    }
  });
}
