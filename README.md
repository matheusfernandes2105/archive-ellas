# ELLAS — site da loja

Site institucional e vitrine da ELLAS (joias autorais). É um site estático feito com HTML, CSS e JavaScript puros, sem build e sem dependências. A compra acontece pelo WhatsApp: cada produto gera uma mensagem pronta com a peça, o acabamento, o tamanho e o valor.

## Como rodar

Abra o `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

Para publicar, envie a pasta inteira para qualquer hospedagem estática (GitHub Pages, Netlify, Vercel etc.).

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Número do WhatsApp, Instagram, Spotify, parcelamento | `js/config.js` |
| Produtos (nome, preço, acabamentos, tamanhos, imagem) | `js/products.js` |
| Textos das seções | `index.html` |
| Cores, fontes e layout | `css/styles.css` |

> **Antes de publicar:** troque o número fictício `5592900000000` em `js/config.js` pelo WhatsApp real da loja (formato `55` + DDD + número, só dígitos) e coloque o link do Instagram.

### Produtos

Os 6 produtos são mockados. As imagens em `assets/produtos/*.svg` são ilustrações provisórias. Quando houver fotos reais, salve-as em `assets/produtos/` (proporção 4:5, por exemplo 1200×1500) e atualize o campo `imagem` de cada produto.

O preço final soma o `acrescimo` do acabamento escolhido. Peças sem tamanho devem ficar sem o campo `tamanhos`.

## Identidade visual

Segue o guia de marca da ELLAS (Canva):

- **Cores:** Manteiga `#FFF1B5`, Vinho `#5D211E`, Cacau `#2F1B1A`, Linho `#F8F5E7`, Grafite `#37333A`, Oliva `#5A5E27`
- **Títulos:** Prata (Google Fonts)
- **Texto:** Neue Montreal. Ela não está no Google Fonts, então o site usa **Hanken Grotesk** como alternativa. Se a loja tiver a licença da Neue Montreal, basta incluir o `@font-face` e ela passa a ser usada automaticamente, porque já é a primeira da lista em `--font-body`.
- **Monograma "LL":** `assets/brand/monograma.png`, aplicado como máscara CSS para assumir qualquer cor da paleta.
