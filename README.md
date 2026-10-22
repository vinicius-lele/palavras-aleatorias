# Palavras Aleatórias — Treino de Leitura

Plataforma estática de treino de leitura por **níveis de leitura** (não por ano),
com atividades alinhadas à BNCC: sem banco de dados, sem dependências, sem build.
A tela inicial mostra os cards das atividades; cada atividade abre por rota
(`#/atividade/<id>`).

## Arquivos

| Arquivo                | O que é                                                        |
|------------------------|----------------------------------------------------------------|
| `words.js`             | **Listas de palavras por nível e tema** (edite só isto)        |
| `index.html`           | Casca mínima; o resto é montado pelo roteador                  |
| `styles.css`           | Visual (tema claro e escuro)                                   |
| `main.js`              | Entrypoint: registra rotas e liga o roteador                   |
| `router.js`            | Roteador por hash (`#/`, `#/atividade/<id>`)                   |
| `home.js`              | Tela inicial com os cards                                      |
| `prefs.js`             | Preferências (localStorage)                                    |
| `words-data.js`        | Acesso central às listas (`WORDS`)                             |
| `silabas-portal.js`    | ⚠️ Gerado: divisões silábicas oficiais (Portal da Língua)      |
| `scripts/buscar-silabas-portal.js` | Consulta o Portal e gera `silabas-portal.js`        |
| `scripts/gerar-separadas.js` | Exporta listas já silabificadas (material de apoio)   |
| `levels.js`            | Descritores dos níveis de leitura                              |
| `syllables.js`         | Silabificador + gerador de divisões erradas + rima             |
| `quiz.js`              | Fluxo comum das atividades de questão (10 questões/rodada)     |
| `images.js`            | Mapa palavra → emoji (Palavra e Imagem; edite para crescer)    |
| `activities/registry.js` | Registro das atividades (cards + selos BNCC)                 |
| `activities/treino-livre.js` | Atividade Treino Livre (a tela original)                |
| `activities/silabas-complexas.js` | Sílabas em Blocos (divisão silábica)               |
| `activities/palavra-imagem.js` | Palavra e Imagem (associação com emojis)             |
| `activities/contar-silabas.js` | Contar Sílabas (contagem + blocos de feedback)      |
| `activities/rimas.js`  | Caça-Rimas (encontrar a palavra que rima)                     |

Novas atividades entram como um arquivo em `activities/` + uma entrada no
`registry.js`.

## Atividades

| Atividade | O que faz | BNCC |
|---|---|---|
| 🎬 Treino Livre | Palavras passam na tela no ritmo escolhido (tela cheia) | EF12LP01 |
| 🧱 Sílabas em Blocos | Escolher onde a palavra se divide (divisões erradas geradas pelo algoritmo) | EF01LP06, EF02LP02 |
| 🖼️ Palavra e Imagem | Palavra → imagem e imagem → palavra, com emojis (direção alterna) | EF15LP18, EF12LP08 |
| 🔢 Contar Sílabas | Contar as sílabas; os blocos coloridos aparecem como correção | EF03LP05 |
| 🎵 Caça-Rimas | Escolher, entre 4 palavras, a que rima com o alvo | EF12LP07, EF01LP09 |

Níveis de leitura (1 a 5) descritos pelo tamanho e complexidade das palavras,
não por ano escolar — o descritor aparece dentro de cada atividade.

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

## Manutenção das atividades

- **Silabificação**: `syllables()` resolve em três camadas — mapa
  `EXCEPTIONS` (decisões pedagógicas pontuais), depois `SILABAS_PORTAL`
  (divisões oficiais do Portal da Língua Portuguesa, gerado por
  `scripts/buscar-silabas-portal.js`) e por fim o algoritmo com as regras
  práticas (ditongos, encontros com l/r, dígrafos, hífens). Se uma palavra
  nova aparecer dividida errada, primeiro rode o buscador do Portal; se ela
  não estiver no dicionário (nomes próprios, neologismos), adicione-a ao
  mapa `EXCEPTIONS` no topo de `syllables.js`: `"saída": ["sa", "í", "da"]`.
- **`silabas-portal.js`** é um arquivo **gerado** (não edite à mão). Depois
  de adicionar ou mudar palavras no `words.js`, regenere com:
  `node scripts/buscar-silabas-portal.js` (respeita o crawl-delay de 3 s do
  site; o progresso fica em cache e o script retoma de onde parou).
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
  linha `"palavra": "emoji",`. Níveis com menos de 4 palavras mapeadas
  mostram o aviso "escolha outro nível".

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
