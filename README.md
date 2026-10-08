# Palavras Aleatórias — Treino de Leitura

Sistema estático de treino de leitura: palavras do nível e do tema escolhidos
passam na tela uma por vez, a cada N segundos, em ordem aleatória. Sem banco de
dados, sem dependências, sem build.

## Arquivos

| Arquivo       | O que é                                              |
|---------------|------------------------------------------------------|
| `words.js`    | **Listas de palavras por nível e tema** (edite só isto) |
| `index.html`  | Estrutura da página                                  |
| `styles.css`  | Visual (tema claro e escuro)                         |
| `app.js`      | Lógica (ciclo, filtros, tela cheia, atalhos)         |

## Como usar

1. Escolha **Nível**, **Tema** e **Segundos** no menu superior.
2. Use o switch para alternar entre `minúsculo` e `maiúsculo`.
3. Use o segundo switch (sol / lua) para alternar entre o **tema claro** e o
   **tema escuro**.
4. Clique no **Play** (ou aperte **Espaço**). Durante a execução todos os
   selects e switches ficam bloqueados; só o botão e a tela cheia continuam
   ativos.
5. Clique no ícone de tela cheia (canto superior direito do campo das palavras)
   para esconder o menu e mostrar só a palavra.
6. **Stop** (ou Espaço) congela a palavra atual na tela; **Play** retoma de onde
   parou (a palavra pausada fica mais N segundos e o ciclo continua).

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
- Nomes próprios e cidades ficam com maiúscula inicial; o switch de caixa
  controla como aparecem na tela.

Para criar um nível novo, adicione uma chave — ele aparece sozinho no select:

```js
nivel6: {
  animais: ["palavra1", "palavra2"],
  outros: ["palavra3"]
}
```

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
