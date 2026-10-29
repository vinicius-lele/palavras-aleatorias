# Palavras Aleatórias — Treino de Leitura

Plataforma estática de treino de leitura por **níveis de leitura** (não por ano),
com atividades alinhadas à BNCC: sem banco de dados, sem dependências, sem build.
A tela inicial mostra os cards das atividades; cada atividade abre por rota
(`#/atividade/<id>`).

O corpus tem **9.679 palavras** (níveis 1–5, 1 a 19 sílabas) com divisões
silábicas oficiais do Portal da Língua Portuguesa (base local de 149.342 lemas)
e um complemento curado para as palavras que o Portal não traz.
As listas são **curadas para o ensino fundamental (1º ao 5º ano)**: cada palavra
é do corpus manual original (11 temas + "outros", seleção manual) ou tem
evidência de frequência em pelo menos uma fonte — E-LEITURA (banco de palavras
do Ensino Fundamental I), Word_Freq_Children (percentil ≥ 70 em livros
infantis) ou wordfreq pt (≥ 1 em 1 milhão de tokens). Os temas "nomes" e
"cidades" mantêm os nomes próprios, e uma blocklist de conteúdo infantil é
aplicada sempre. Curadoria reexecutável: `node scripts/curar-palavras.mjs`.

## Arquivos

| Arquivo                | O que é                                                        |
|------------------------|----------------------------------------------------------------|
| `words.js`             | **Listas de palavras por nível e tema** (edite só isto)        |
| `vocabulario.js`       | **Palavras + significados** do módulo Palavras Desconhecidas  |
| `encontros.js`         | **Classificador de ditongo/tritongo/hiato** + tritongos curados |
| `index.html`           | Casca mínima; o resto é montado pelo roteador                  |
| `styles.css`           | Visual (tema claro e escuro)                                   |
| `main.js`              | Entrypoint: registra rotas e liga o roteador                   |
| `router.js`            | Roteador por hash (`#/`, `#/atividade/<id>`)                   |
| `home.js`              | Tela inicial com os cards                                      |
| `prefs.js`             | Preferências (localStorage)                                    |
| `words-data.js`        | Acesso central às listas (`WORDS`)                             |
| `silabas-portal.js`    | ⚠️ Gerado: divisões silábicas oficiais (Portal da Língua)      |
| `scripts/baixar-dicionario-portal.js` | Baixa o dicionário do Portal e gera `silabas-portal.js` |
| `scripts/dicionario-portal.json` | Dicionário do Portal completo (fonte offline das divisões) |
| `scripts/silabas-extras.json` | Complemento curado: divisões que o Portal não traz |
| `scripts/validar-palavras.mjs` | Valida a base e os arquivos derivados            |
| `scripts/curar-palavras.mjs` | Curadoria escolar: filtra `words.js` por evidência |
| `scripts/podar-images.mjs`   | Remove do `images.js` chaves órfãs do corpus     |
| `scripts/words-manual.js`    | ⚠️ Snapshot do corpus manual (fonte da herança)   |
| `scripts/eleitura-banco.json` | E-LEITURA: banco de palavras do EF I (BR)        |
| `scripts/word-freq-children.tsv` | Word_Freq_Children: frequência em livros infantis |
| `scripts/wordfreq-pt.tsv`    | wordfreq: frequência geral do português (cB)     |
| `scripts/gerar-separadas.js` | Exporta listas já silabificadas (material de apoio)   |
| `levels.js`            | Descritores dos níveis de leitura                              |
| `syllables.js`         | Silabificador + gerador de divisões erradas + rima             |
| `quiz.js`              | Fluxo comum das atividades de questão (10 questões/rodada)     |
| `images.js`            | Mapa palavra → emoji (Palavra e Imagem; edite para crescer)    |
| `emoji.js`             | Helper `emojiHTML()`: renderiza o emoji como SVG com fallback    |
| `activities/registry.js` | Registro das atividades (cards + selos BNCC)                 |
| `activities/treino-livre.js` | Atividade Treino Livre (a tela original)                |
| `activities/silabas-complexas.js` | Sílabas em Blocos (divisão silábica)               |
| `activities/palavra-imagem.js` | Palavra e Imagem (associação com emojis)             |
| `activities/contar-silabas.js` | Contar Sílabas (contagem + blocos de feedback)      |
| `activities/arrastar-silabas.js` | Montar com Sílabas (arrastar e soltar sílabas)  |
| `activities/rimas.js`  | Caça-Rimas (encontrar a palavra que rima)                     |
| `activities/palavras-desconhecidas.js` | Palavras Desconhecidas (vocabulário em passo)    |
| `activities/encontros-vocalicos.js` | Encontros Vocálicos (classificar vogais)        |
| `activities/tela-cheia.js` | Controle de tela cheia compartilhado (Treino Livre e Palavras Desconhecidas) |

Novas atividades entram como um arquivo em `activities/` + uma entrada no
`registry.js`.

## Atividades

| Atividade | O que faz | BNCC |
|---|---|---|
| 🎬 Treino Livre | Palavras passam na tela no ritmo escolhido (tela cheia) | EF12LP01 |
| 🧱 Sílabas em Blocos | Escolher onde a palavra se divide (divisões erradas geradas pelo algoritmo) | EF01LP06, EF02LP02 |
| 🖼️ Palavra e Imagem | Palavra → imagem e imagem → palavra, com emojis (direção alterna) | EF15LP18, EF12LP08 |
| 🔢 Contar Sílabas | Contar as sílabas; os blocos coloridos aparecem como correção | EF03LP05 |
| 🧩 Montar com Sílabas | Arrastar as sílabas embaralhadas para montar a palavra (ordem exata vale) | EF01LP06, EF02LP02 |
| 🎵 Caça-Rimas | Escolher, entre 4 palavras, a que rima com o alvo | EF12LP07, EF01LP09 |
| 🔍 Palavras Desconhecidas | Palavras incomuns passam na tela com o significado (sem acerto/erro) | EF35LP05 |
| 🔤 Encontros Vocálicos | Classificar as vogais: ditongo, tritongo, hiato ou nenhum | EF04LP02, EF03LP02 |

Níveis de leitura (1 a 5) descritos pelo tamanho e complexidade das palavras,
não por ano escolar — o descritor aparece dentro de cada atividade. Duas
exceções: a **Palavras Desconhecidas** é vocabulário de ampliação, então não
tem seletor de nível nem questão (a lista é uma só, `vocabulario.js`); e o
**Encontros Vocálicos** limita o seletor aos **níveis 3 a 5** (3º ao 5º ano,
onde a BNCC pede o conceito) e traz um filtro extra **Conceito** (Mistura,
Ditongo, Tritongo, Hiato) que muda o mix das questões.

## Como usar

1. Na tela inicial, escolha uma atividade clicando no card.
2. No **Treino Livre**: escolha **Nível**, **Tema** e **Segundos** no menu
   superior; use os switches de caixa (minúsculo/maiúsculo) e de tema
   claro/escuro.
3. Clique no **Play** (ou aperte **Espaço**). Durante a execução todos os
   selects e switches ficam bloqueados; só o botão e a tela cheia continuam
   ativos.
4. Clique no ícone de tela cheia (canto superior direito do campo das palavras)
   para esconder o menu e mostrar só a palavra. Em navegadores sem tela cheia
   nativa (iPhone) o modo é simulado via CSS: toque no mesmo ícone ou tecle
   `Esc` para sair.
5. **Stop** (ou Espaço) congela a palavra atual na tela; **Play** retoma de onde
   parou (a palavra pausada fica mais N segundos e o ciclo continua).
6. O botão **←** (ou o voltar do navegador) retorna à tela inicial.

### Filtros

- **Nível**: `Todos os níveis` embaralha tudo junto; senão, só o nível
  escolhido.
- **Tema**: `Todos os temas` usa o nível inteiro; senão, só o tema escolhido.
- Os temas listados são **dinâmicos**: ao trocar de nível, o tema volta para
  `Todos os temas` caso não exista no nível novo.
- Se a combinação nível + tema não tiver nenhuma palavra, o Play fica
  desabilitado e o campo mostra `Nenhuma palavra neste filtro`.

As preferências (nível, tema, segundos, caixa e modo escuro) ficam salvas no
navegador. O padrão é o tema claro.

## Editar as palavras / adicionar nível

Abra `words.js`. A estrutura é `nível -> tema -> palavras`:

```js
nivel1: {
  animais: ["gato", "cão", "peixe"],
  cores: ["azul", "verde", "preto"],
  // ...
}
```

Temas válidos (use exatamente estes nomes):

`animais`, `alimentos`, `cores`, `numerais`, `cidades`, `nomes`, `verbos`,
`natureza`, `corpo`, `objetos`, `emoções`, `outros`

Regras das listas:

- Cada nível precisa de **pelo menos 120 palavras** no total (sem máximo).
- Cada palavra aparece **uma única vez**: sem repetição dentro do nível nem
  entre níveis.
- Cada palavra fica em **um só tema** (casos ambíguos vão no tema mais óbvio).
- Nomes próprios e cidades ficam com maiúscula inicial; **essa inicial é
  obrigatória em toda a plataforma**. A regra de exibição (em `words-data.js`)
  usa a caixa do `words.js` como fonte da verdade: nome próprio aparece com
  a primeira letra maiúscula em qualquer circunstância — inclusive no modo
  MINÚSCULO do Treino Livre e nas strings derivadas de sílabas (blocos de
  "Contar Sílabas" e divisões "Jo-ão" de "Sílabas em Blocos"). Basta gravar
  o nome com maiúscula; nunca é preciso ajustar a tela.

Para criar um nível novo, adicione uma chave — ele aparece sozinho no select:

```js
nivel6: {
  animais: ["palavra1", "palavra2"],
  outros: ["palavra3"]
}
```

## Curadoria do corpus (1º ao 5º ano)

`words.js` é filtrado por evidência de frequência — nada entra sem sinal
escolar, e a ordem é: **herança** (corpus manual pré-expansão) **ou**
**E-LEITURA** (qualquer banda) **ou** **ISPA** (percentil ≥ 70 em livros
infantis) **ou** **wordfreq** (≥ −600 cB, 1 em 1 milhão de tokens), com
blocklist de conteúdo infantil aplicada sempre e nomes próprios dos temas
`nomes`/`cidades` mantidos.

```bash
node scripts/curar-palavras.mjs --dry   # simula sem gravar
node scripts/curar-palavras.mjs         # filtra words.js (in-place)
node scripts/podar-images.mjs           # remove emojis órfãos do images.js
node scripts/validar-palavras.mjs       # gate final (rode sempre depois)
```

As fontes de evidência são regeneráveis (estão em `scripts/`):
`parsear-eleitura.js` (do texto do PDF), `baixar-word-freq-children.js` e
`baixar-wordfreq.js`. A lista de herança é o snapshot imutável
`scripts/words-manual.js` (extraído de `git show cad22fa~1:words.js` — não
edite à mão).

## Manutenção das atividades

- **Palavras Desconhecidas (EF35LP05)**: a base mora em `vocabulario.js`,
  com entradas `{ palavra, significado }` — palavra em minúsculas, uma por
  linha, sem repetição, e significado de uma linha só em português simples.
  Para acrescentar vocabulário, edite o arquivo e rode
  `node scripts/validar-palavras.mjs` (checa duplicatas, caixa e campos
  vazios). Não há frase de contexto por decisão de projeto: o módulo expõe a
  palavra nova e o sentido; inferir pelo contexto é o trabalho da aula.
- **Encontros Vocálicos (EF04LP02, EF03LP02)**: a classificação mora em
  `encontros.js` e é derivada da divisão oficial do Portal — sílaba com 2
  vogais = ditongo, com 3 = tritongo, fronteira entre sílabas caindo entre
  duas vogais = hiato. As letras mudas são descontadas como a escola ensina
  (o u de "qu" nunca conta; o u de "gu" só conta quando sustenta tritongo,
  como em "u-ru-guai"). Duas curadorias pontuais, editáveis à mão: o mapa
  `EXCECOES` (ex.: "joão", cujo o é glide) e a lista `TRITONGOS` — o corpus
  dos níveis 3–5 não tem nenhum tritongo utilizável (é raríssimo no
  português), então "uruguai", "paraguai" e "uau" vêm curados, com a
  divisão e a sílaba do encontro à mão. Palavras "misto" (ditongo E hiato,
  como "capoeira") ficam de fora do pool: teriam duas respostas certas.
  Os casos-teste do validador congelam as decisões — rode
  `node scripts/validar-palavras.mjs` depois de qualquer mexida.
- **Silabificação**: `syllables()` resolve em três camadas — mapa
  `EXCEPTIONS` (decisões pedagógicas pontuais), depois `SILABAS_PORTAL`
  (divisões oficiais do Portal da Língua Portuguesa, gerado a partir do
  dicionário completo `scripts/dicionario-portal.json`) e por fim o
  algoritmo com as regras práticas (ditongos, encontros com l/r, dígrafos,
  hífens). Se uma palavra nova aparecer dividida errada, primeiro regenere
  o mapa (abaixo); se ela não estiver no dicionário (nomes próprios,
  neologismos), adicione-a ao mapa `EXCEPTIONS` no topo de `syllables.js`:
  `"saída": ["sa", "í", "da"]`.
- **`silabas-portal.js`** é um arquivo **gerado** (não edite à mão). Depois
  de adicionar ou mudar palavras no `words.js`, regenere (offline, a partir
  do dicionário já commitado):
  `node scripts/baixar-dicionario-portal.js --gerar`.
  O dicionário completo do Portal fica em `scripts/dicionario-portal.json`
  e o complemento curado (palavras que o Portal não traz) em
  `scripts/silabas-extras.json`; os dois são mesclados na geração.
  Para baixá-lo/atualizá-lo (uma vez, ~2 h, respeitando o Crawl-delay: 3 s
  do robots.txt — o progresso fica em cache e o script retoma de onde
  parou): `node scripts/baixar-dicionario-portal.js`.
  Para conferir a base inteira após qualquer edição:
  `node scripts/validar-palavras.mjs` (duplicatas, cobertura do dicionário,
  silabificação, emojis, cobertura de rima por nível).
  Para exportar as listas já silabificadas como material de apoio:
  `node scripts/gerar-separadas.js` (gera `words-separadas.js` sob demanda).
- **Rimas**: a Caça-Rimas compara `rhymeKey()` (`syllables.js`) — rima
  VERDADEIRA: igualdade a partir da vogal TÔNICA ("panela"/"canela" = "ela";
  "esmola"/"janela" não rimam; assonância como "casa"/"mesa" não conta).
  A tônica sai da ortografia: acento escrito > terminação da palavra.
  Palavras que fogem à regra entram em `STRESS_EXCEPTIONS` (topo de
  `syllables.js`): `"palavra": índice da sílaba tônica`. O relatório de
  duplas para conferência sai do teste em `Temp/opencode/teste-rimas.mjs`.
- **Emojis**: `images.js` mapeia palavra → emoji para a Palavra e Imagem e
  para os alvos da Caça-Rimas. Para usar uma palavra nova, adicione uma
  linha `"palavra": "emoji",` **e** o SVG em `img/emoji/` (o validador
  avisa se faltar — sem arquivo, o `emoji.js` cai no emoji do sistema).
  Níveis com menos de 4 palavras mapeadas mostram o aviso "escolha outro
  nível". A renderização é feita por `emojiHTML()` (`emoji.js`): `<img>`
  apontando para `img/emoji/<codepoints>.svg` com `onerror` que devolve o
  emoji em texto — o app nunca fica sem imagem, mesmo offline.
- **Imagens (SVG)**: os arquivos em `img/emoji/` são do **Twemoji**
  (github.com/jdecked/twemoji), licença **CC BY 4.0** — crédito em
  `img/emoji/CREDITS.md`. São ~783 SVGs, 1,3 MB, baixados uma vez e
  versionados; não há nenhuma chamada de rede em runtime. Para adicionar:
  baixe o SVG do repositório Twemoji com o nome `codepoints-hex.svg`
  (sem U+FE0F), ex. `1f436.svg` para 🐶.

## Publicar no GitHub Pages

1. Crie um repositório chamado `palavras-aleatorias` no github.com
   (sem README, sem .gitignore).
2. Rode localmente:

```bash
git remote add origin https://github.com/SEU_USUARIO/palavras-aleatorias.git
git push -u origin main
```

3. No GitHub: **Settings → Pages → Source: Deploy from a branch →
   `main` / `/root` → Save**.
4. O site fica em `https://SEU_USUARIO.github.io/palavras-aleatorias/`.

## Atualizar

```bash
git add .
git commit -m "Descrição da mudança"
git push
```

O GitHub Pages republica sozinho em ~1 minuto.
