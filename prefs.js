// Preferências do usuário (localStorage) — compartilhado por todas as telas.
// As chaves "pa.*" são as mesmas do projeto original, então quem já usou
// o Treino Livre mantém nível, tema, segundos, caixa e tema escuro.

export var LS = {
  nivel: "pa.nivel",
  tema: "pa.tema",
  seg: "pa.seg",
  cs: "pa.cs",
  theme: "pa.theme"
};

export function readPref(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; } // modo privado
}

export function savePref(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* modo privado */ }
}

export function isDark() {
  return readPref(LS.theme) === "1";
}

export function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  savePref(LS.theme, dark ? "1" : "0");
}
