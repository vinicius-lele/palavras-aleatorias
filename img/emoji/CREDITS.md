# Créditos de imagens

## Twemoji (img/emoji/*.svg)

Os SVGs de emoji usados pela Palavra e Imagem e pela Caça-Rimas vêm do
projeto **Twemoji**:

- Origem: https://github.com/jdecked/twemoji (fork mantido do
  twitter/twemoji original)
- Licença: **CC BY 4.0** — https://creativecommons.org/licenses/by/4.0/
- © Twitter e contribuidores, conforme a licença.

Foram baixados e versionados neste repositório (783 arquivos, ~1,3 MB),
sem chamadas de rede em runtime. O nome de cada arquivo são os
codepoints do emoji em hexadecimal separados por "-", sem U+FE0F
(ex.: `1f436.svg` = 🐶, `1f468-200d-2695.svg` = 👨‍⚕).

Quando um SVG não existe (3 casos: 🧑‍🚗, ♭, ♯), a página mostra o
emoji do sistema em texto — o fallback está em `emoji.js`.

## Anotações de palavra → emoji (images.js)

Os mapeamentos foram curados manualmente a partir das anotações em
português do **Unicode CLDR** (https://github.com/unicode-org/cldr),
que estão sob a **Unicode License v3** (https://www.unicode.org/license.txt).
