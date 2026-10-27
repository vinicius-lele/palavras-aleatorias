// Fluxo comum das atividades de quiz — 10 questões por rodada, feedback
// imediato e AVANÇO MANUAL: a resposta fica na tela até apertar
// "Continuar" (o público é leitor iniciante — sem timer tirando a leitura),
// placar no final. Cada atividade só precisa fornecer as questões:
//
//   createQuiz({
//     id: "silabas-complexas",       // usado na preferência do nível
//     nome: "Sílabas Complexas",     // cabeçalho
//     icone: "<svg …/>",          // ícone em traço (ver activities/icones.js)
//     bncc: ["EF01LP06", "EF02LP02"],
//     createQuestion(nivel) {        // nivel: "nivel1".."nivel5" ou "*"
//       return {
//         prompt: "<span class='...'>gato</span>",
//         options: [{ html: "ga-to", correct: true }, ...]
//       };
//     }
//   })
//
// createQuestion pode retornar null quando o filtro não tem material — o
// quiz mostra o estado vazio com dica.
//
// Questão interativa (arrastar-e-soltar etc.): em vez de `options`, a
// questão pode trazer `custom(el, report)`. O quiz chama `custom` passando
// o container de opções; a atividade monta a própria UI ali e chama
// `report(true|false)` quando a resposta estiver decidida. `custom` pode
// devolver uma função de limpeza (chamada ao trocar de questão/sair).

import { navigate } from "./router.js";
import { levelKeys, levelLabel } from "./words-data.js";
import { noteFor } from "./levels.js";
import { readPref, savePref } from "./prefs.js";

var ALL = "*";
var TOTAL = 10;

// Avanço é MANUAL: depois de responder, a resposta fica na tela até a
// criança (ou o professor) apertar "Continuar". Relógio aqui tirava o tempo
// de ler a resposta certa de quem está começando — e deixava a tela mudar
// sozinha no meio da leitura.
var ARROW = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>';

var BACK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>';
var CHECK = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>';
var X = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>';

function shuffled(list) {
  var a = list.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

export function createQuiz(config) {
  var prefKey = "pa.quiz.nivel." + config.id;
  var nivel = readPref(prefKey) || ALL;
  if (nivel !== ALL && levelKeys().indexOf(nivel) === -1) nivel = ALL;

  var state = { idx: 0, acertos: 0, locked: false, answered: 0 };
  var destroyed = false;

  var container = document.createElement("div");
  container.className = "screen quiz-screen";

  container.innerHTML =
    '<header class="quiz-header">' +
      '<button class="btn-back" data-el="back" type="button" aria-label="Voltar para a tela inicial">' + BACK + '</button>' +
      '<div class="quiz-id">' +
        '<span class="quiz-icone" aria-hidden="true">' + config.icone + '</span>' +
        '<span class="quiz-nome">' + config.nome + '</span>' +
      '</div>' +
      '<span class="quiz-bncc">BNCC: ' + config.bncc.join(" · ") + '</span>' +
      '<div class="ctrl quiz-nivel">' +
        '<label class="ctrl-label" for="qzNivel">Nível de leitura</label>' +
        '<select id="qzNivel"></select>' +
      '</div>' +
    '</header>' +

    '<p class="quiz-nota" data-el="nota"></p>' +

    '<main class="quiz-main">' +
      '<div class="quiz-stage" data-el="stage">' +
        '<div class="quiz-progresso" data-el="progresso"></div>' +
        '<div class="quiz-enunciado" data-el="enunciado"></div>' +
        '<div class="quiz-feedback" data-el="feedback" hidden></div>' +
        '<div class="quiz-opcoes" data-el="opcoes"></div>' +
        '<button class="btn-primario btn-continuar" data-el="continuar" type="button" hidden>' +
          'Continuar ' + ARROW +
        '</button>' +
      '</div>' +

      '<div class="quiz-fim" data-el="fim" hidden>' +
        '<div class="quiz-fim-icone" data-el="fimIcone"></div>' +
        '<h2 class="quiz-fim-titulo" data-el="fimTitulo"></h2>' +
        '<p class="quiz-fim-sub" data-el="fimSub"></p>' +
        '<div class="quiz-fim-acoes">' +
          '<button class="btn-primario" data-el="deNovo" type="button">Jogar de novo</button>' +
          '<button class="btn-secundario" data-el="home" type="button">Voltar ao início</button>' +
        '</div>' +
      '</div>' +

      '<div class="quiz-vazio" data-el="vazio" hidden>' +
        '<p class="quiz-vazio-texto">Nenhuma questão neste filtro.</p>' +
        '<p class="quiz-vazio-dica">Escolha outro nível de leitura acima.</p>' +
      '</div>' +
    '</main>';

  var el = {};
  container.querySelectorAll("[data-el]").forEach(function (n) {
    el[n.getAttribute("data-el")] = n;
  });
  var selNivel = container.querySelector("#qzNivel");

  /* ---------- Nível ---------- */

  function populateNiveis() {
    var all = document.createElement("option");
    all.value = ALL;
    all.textContent = "Todos os níveis";
    selNivel.appendChild(all);

    levelKeys().forEach(function (key) {
      var o = document.createElement("option");
      o.value = key;
      o.textContent = levelLabel(key);
      selNivel.appendChild(o);
    });

    selNivel.value = nivel;
  }

  function updateNota() {
    el.nota.textContent = nivel === ALL
      ? "Todos os níveis: as questões misturam palavras de todos os níveis."
      : noteFor(nivel);
  }

  /* ---------- Rodada ---------- */

  function showStage() {
    el.stage.hidden = false;
    el.fim.hidden = true;
    el.vazio.hidden = true;
  }

  // Questão atual: o feedback pós-resposta (blocos etc.) consulta estes dados.
  var currentQ = null;

  // Limpeza da UI interativa da questão atual (se houver).
  var teardownCustom = null;

  function renderQuestion(q) {
    if (teardownCustom) { teardownCustom(); teardownCustom = null; }
    currentQ = q;
    el.progresso.textContent = "Questão " + (state.idx + 1) + " de " + TOTAL;
    el.enunciado.innerHTML = q ? q.prompt : "";
    el.feedback.hidden = true;
    el.feedback.textContent = "";
    el.continuar.hidden = true;

    el.opcoes.textContent = "";
    if (!q) {
      el.vazio.hidden = false;
      el.progresso.textContent = "";
      return;
    }

    // UI interativa: a atividade cuida dos próprios controles.
    if (q.custom) {
      teardownCustom = q.custom(el.opcoes, answerCustom) || null;
      return;
    }

    shuffled(q.options).forEach(function (opt) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quiz-opcao";
      b.innerHTML = opt.html;
      b.dataset.correta = opt.correct ? "1" : "0";
      b.addEventListener("click", function () { onAnswer(b, opt); });
      el.opcoes.appendChild(b);
    });
  }

  function onAnswer(btn, opt) {
    if (state.locked || destroyed) return;
    state.locked = true;
    state.answered++;

    var buttons = el.opcoes.querySelectorAll(".quiz-opcao");
    buttons.forEach(function (b) { b.disabled = true; });

    if (opt.correct) {
      state.acertos++;
      btn.classList.add("opcao-certa");
      btn.insertAdjacentHTML("beforeend", '<span class="opcao-marca">' + CHECK + "</span>");
    } else {
      btn.classList.add("opcao-errada");
      btn.insertAdjacentHTML("beforeend", '<span class="opcao-marca">' + X + "</span>");
      buttons.forEach(function (b) {
        if (b.dataset.correta === "1") b.classList.add("opcao-certa-destaque");
      });
    }

    // Feedback visual da questão (ex.: blocos silábicos) — Q21a.
    if (currentQ && currentQ.feedbackHTML) {
      el.feedback.innerHTML = currentQ.feedbackHTML;
      el.feedback.hidden = false;
    }

    mostrarContinuar();
  }

  // A resposta fica na tela até o "Continuar" (avanço manual, sem timer).
  // O foco vai para o botão: quem navega por teclado/leitor de tela segue
  // direto, e repetir Enter na opção já respondida não reage mais (ela
  // está disabled).
  function mostrarContinuar() {
    el.continuar.hidden = false;
    el.continuar.focus();
  }

  // Resposta vinda de uma UI interativa (q.custom): o placar e o feedback
  // seguem as mesmas regras dos botões de opção.
  function answerCustom(correct) {
    if (state.locked || destroyed) return;
    state.locked = true;
    state.answered++;
    if (correct) state.acertos++;

    if (currentQ && currentQ.feedbackHTML) {
      el.feedback.innerHTML = currentQ.feedbackHTML;
      el.feedback.hidden = false;
    }

    mostrarContinuar();
  }

  // Sorteia a próxima questão. Usa um "pool" criado por rodada para não
  // repetir palavra até esgotar; se a questão vier null, encerra a rodada.
  var round = { pool: [] };

  function next() {
    if (destroyed) return;
    state.locked = false;
    state.idx++;

    if (state.idx >= TOTAL) { endRound(); return; }
    var q = config.createQuestion(nivel, round);
    if (!q) { endRound(); return; }
    renderQuestion(q);
  }

  function startRound() {
    state.idx = 0;
    state.acertos = 0;
    state.answered = 0;
    state.locked = false;
    round.pool = [];

    showStage();
    var q = config.createQuestion(nivel, round);
    if (!q) { el.enunciado.textContent = ""; el.progresso.textContent = ""; el.vazio.hidden = false; return; }
    renderQuestion(q);
  }

  function endRound() {
    var total = state.answered;
    var acertos = state.acertos;

    el.stage.hidden = true;
    el.fim.hidden = false;

    var emoji = total === 0 ? "🌱" : (acertos === total ? "🏆" : (acertos >= total / 2 ? "👏" : "💪"));
    el.fimIcone.textContent = emoji;
    el.fimTitulo.textContent = total === 0
      ? "Sem questões neste filtro"
      : "Você acertou " + acertos + " de " + total + "!";

    el.fimSub.textContent = total > 0 && acertos < total
      ? "Bora tentar de novo para melhorar?"
      : "Muito bem!";
  }

  /* ---------- Eventos ---------- */

  function onNivelChange() {
    nivel = selNivel.value;
    savePref(prefKey, nivel);
    updateNota();
    startRound();
  }

  el.back.addEventListener("click", function () { navigate("/"); });
  el.deNovo.addEventListener("click", startRound);
  el.home.addEventListener("click", function () { navigate("/"); });
  el.continuar.addEventListener("click", function () {
    el.continuar.hidden = true;
    next();
  });
  selNivel.addEventListener("change", onNivelChange);

  /* ---------- Montagem ---------- */

  populateNiveis();
  updateNota();
  startRound();

  return {
    el: container,
    destroy: function () {
      destroyed = true;
      if (teardownCustom) { teardownCustom(); teardownCustom = null; }
    }
  };
}
