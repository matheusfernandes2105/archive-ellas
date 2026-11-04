# ELLAS — site da loja

Site e vitrine da ELLAS (joias autorais). A compra acontece pelo WhatsApp: cada produto gera uma mensagem pronta com a peça, o acabamento, o tamanho e o valor.

O site é estático: HTML, CSS e JavaScript (módulos ES), sem build e **sem nenhuma dependência externa**, nem em produção nem em desenvolvimento.

## Como rodar

Requer Node.js 20 ou superior.

```bash
npm start    # http://localhost:8000, com os mesmos cabeçalhos de segurança de produção
npm test     # testes de domínio, aplicação, infraestrutura e do servidor local
```

> Abrir o `index.html` direto pelo arquivo (`file://`) não funciona: módulos ES exigem um servidor.

## Onde editar

| O quê | Arquivo |
| --- | --- |
| WhatsApp, Instagram, Spotify, parcelamento | `src/infrastructure/config/store.config.js` |
| Produtos (nome, preço, acabamentos, tamanhos, imagem) | `src/infrastructure/catalog/products.data.js` |
| Textos das seções | `index.html` |
| Cores, fontes e layout | `css/styles.css` |

> **Antes de publicar:** troque o número fictício `5592900000000` pelo WhatsApp real da loja e coloque o link do Instagram.

Tudo o que você edita é validado quando o site carrega. Se algo estiver errado (preço negativo, imagem fora de `assets/produtos/`, link que não é https etc.), o catálogo não aparece e o motivo é mostrado no console do navegador (F12). Rode `npm test` depois de editar: o teste "o catálogo real e a configuração real são válidos" acusa o erro antes de publicar.

## Arquitetura (DDD)

```
src/
├── domain/                 Regras de negócio puras, sem DOM e sem rede
│   ├── shared/             Money (centavos inteiros), DomainError, validação de texto
│   ├── catalog/            Product (raiz de agregado), Category, Finish, Sku, ProductId,
│   │                       ProductImage, ProductRepository (porta)
│   ├── purchase/           PurchaseIntent (escolha válida), PurchaseMessage (texto enviado)
│   └── contact/            WhatsAppNumber
├── application/            Casos de uso, que orquestram o domínio
│   ├── ListCatalog, GetProductDetails, StartPurchase, StartConversation
│   ├── ProductView         DTO congelado entregue à interface
│   └── ports/              MessagingGateway (porta de saída)
├── infrastructure/         Implementações concretas das portas
│   ├── catalog/            StaticProductRepository, ProductMapper (anticorrupção), dados
│   ├── messaging/          WhatsAppGateway (links wa.me)
│   ├── config/             configuração da loja + validação
│   └── security/           validação de URLs externas
├── presentation/           Interface: componentes e utilitários de DOM seguro
└── main.js                 Composition root, o único ponto que conecta as camadas
```

As dependências sempre apontam para dentro: `presentation → application → domain`, e `infrastructure` implementa as portas definidas no domínio e na aplicação. O domínio não conhece navegador, WhatsApp nem arquivo de dados. Por isso, trocar o catálogo estático por uma API no futuro é só criar outro `ProductRepository`.

Regras que o domínio garante:
- preço em centavos inteiros e parcelamento arredondado para cima;
- todo produto tem ao menos um acabamento, sem repetição, e todo preço final é positivo;
- só se compra com acabamento e tamanho que a peça oferece;
- entidades e objetos de valor são imutáveis.

## Segurança

- **Content Security Policy estrita:**
  - só recursos do próprio site;
  - nenhum script ou estilo inline;
  - nenhuma conexão externa (`connect-src 'none'`);
  - nenhum formulário (`form-action 'none'`).
- **Trusted Types obrigatório:** o navegador bloqueia `innerHTML`, `eval` e similares. A interface monta o DOM só com `textContent` e `createElement` (`src/presentation/dom.js`), com lista fechada de atributos e URLs validadas.
- **Sem terceiros:** as fontes (Prata e Hanken Grotesk, licença SIL OFL) ficam em `assets/fonts/`. Não há Google Fonts, CDN, analytics nem rastreadores, e nenhuma dependência npm.
- **Validação de todos os dados:**
  - imagens só de `assets/produtos/`;
  - textos sem caracteres de controle, de largura zero ou bidirecionais (bloqueia falsificação da mensagem);
  - links de redes só em https e nos domínios permitidos;
  - número de WhatsApp no formato E.164.
- **Mensagem do WhatsApp:** é montada só a partir de dados já validados e codificada com `encodeURIComponent`. O texto não consegue mudar o destino do link.
- **Links externos:** abrem com `rel="noopener noreferrer"`.
- **Cabeçalhos HTTP** em `_headers` (Netlify / Cloudflare Pages) e `vercel.json` (Vercel):
  - CSP com `frame-ancestors 'none'`;
  - HSTS;
  - `X-Content-Type-Options`;
  - `X-Frame-Options`;
  - `Referrer-Policy`;
  - `Permissions-Policy`;
  - COOP/CORP.
- **Servidor local (`scripts/serve.js`):**
  - só escuta em `127.0.0.1` e só aceita GET/HEAD;
  - bloqueia path traversal e arquivos ocultos;
  - serve apenas os arquivos do site.

### Onde hospedar

Prefira **Netlify, Cloudflare Pages ou Vercel**: eles aplicam os cabeçalhos de segurança automaticamente.

O **GitHub Pages** não permite cabeçalhos customizados. Nele, a CSP vale pela tag `<meta>` do `index.html`, e o site se esconde se for aberto dentro de um iframe. Ainda assim, HSTS e `frame-ancestors` não ficam ativos.

## Produtos e identidade visual

Os 6 produtos são mockados. As imagens em `assets/produtos/*.svg` são ilustrações provisórias. Quando houver fotos reais, salve-as em `assets/produtos/` (proporção 4:5, por exemplo 1200×1500) e atualize o campo `imagem`.

Guia de marca:
- **Cores:** Manteiga `#FFF1B5`, Vinho `#5D211E`, Cacau `#2F1B1A`, Linho `#F8F5E7`, Grafite `#37333A` e Oliva `#5A5E27`, além de tons suaves derivados para os fundos.
- **Fontes:** Prata nos títulos. Hanken Grotesk substitui a Neue Montreal, que não é livre. Com a licença da Neue Montreal, basta adicionar o `@font-face` dela, porque ela já é a primeira em `--font-body`.
- **Monograma "LL":** usado como máscara CSS, assume qualquer cor da paleta.
