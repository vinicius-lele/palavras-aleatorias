# Palavras Aleatórias — Treino de Leitura

Sistema estático de treino de leitura: palavras do nível escolhido passam na tela
uma por vez, a cada N segundos, em ordem aleatória. Sem banco de dados, sem
dependências, sem build.

## Arquivos

| Arquivo       | O que é                                              |
|---------------|------------------------------------------------------|
| `words.js`    | **Listas de palavras por nível** (edite só este)      |
| `index.html`  | Estrutura da página                                  |
| `styles.css`  | Visual                                                |
| `app.js`      | Lógica (ciclo, tela cheia, atalhos)                   |

## Como usar

1. Escolha **Nível** e **Segundos** no menu superior.
2. Use o switch para alternar entre `minúsculo` e `maiúsculo`.
3. Clique no **Play** (ou aperte **Espaço**). Durante a execução os selects e o
   switch ficam bloqueados; só o botão e a tela cheia continuam ativos.
4. Clique no ícone de tela cheia (canto superior direito do campo das palavras)
   para esconder o menu e mostrar só a palavra.
5. **Stop** (ou Espaço) limpa o campo e volta ao estado inicial.

As preferências (nível, segundos, caixa) ficam salvas no navegador.

## Editar as palavras / adicionar nível

Abra `words.js` e altere as listas. Para criar um nível novo, adicione uma
chave — ele aparece sozinho no select:

```js
nivel6: ["palavra1", "palavra2", "palavra3"]
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
