/**
 * Catálogo mockado da primeira coleção ELLAS — edite aqui.
 *
 * Os dados são validados pelo domínio ao carregar o site: um campo inválido
 * (preço negativo, imagem fora de assets/produtos/, SKU fora do padrão etc.)
 * impede o catálogo de aparecer e o erro é mostrado no console do navegador.
 *
 * - categoria: "aneis" | "brincos" | "colares" | "pulseiras"
 * - preco e acrescimo: em reais, com até 2 casas decimais. O acréscimo soma ao preço base
 *   (use valor negativo para desconto).
 * - tamanhos: opcional (anéis/colares). Remova o campo para peças sem tamanho.
 * - imagem: arquivo dentro de assets/produtos/ (svg, png, jpg, webp ou avif).
 */
export const productsData = Object.freeze([
  {
    id: "anel-raiz",
    sku: "EL-01",
    nome: "Anel Raiz",
    categoria: "aneis",
    selo: "Nova",
    preco: 249,
    imagem: "assets/produtos/anel-raiz.svg",
    resumo: "Aro robusto com superfície martelada à mão.",
    descricao:
      "Inspirado no que cresce firme e sem pressa. Cada Anel Raiz é martelado à mão, então nenhum é igual ao outro: as marcas do processo ficam na peça, como raízes que contam por onde passaram.",
    acabamentos: [
      { nome: "Prata 925", acrescimo: 0 },
      { nome: "Prata 925 com banho de ouro 18k", acrescimo: 60 },
    ],
    tamanhos: ["12", "14", "16", "18", "20", "22"],
  },
  {
    id: "brincos-pos-chuva",
    sku: "EL-02",
    nome: "Brincos Pós-Chuva",
    categoria: "brincos",
    selo: "Mais desejado",
    preco: 219,
    imagem: "assets/produtos/brincos-pos-chuva.svg",
    resumo: "Gotas orgânicas que balançam com leveza.",
    descricao:
      "Nascidos do cheiro de terra molhada depois da chuva. As gotas têm volumes levemente diferentes, pensadas para se mover com você e refletir a luz de um jeito sempre novo.",
    acabamentos: [
      { nome: "Banho de ouro 18k", acrescimo: 0 },
      { nome: "Prata 925", acrescimo: -20 },
    ],
  },
  {
    id: "colar-caramelo",
    sku: "EL-03",
    nome: "Colar Caramelo",
    categoria: "colares",
    preco: 389,
    imagem: "assets/produtos/colar-caramelo.svg",
    resumo: "Pingente oval com pedra em tom âmbar.",
    descricao:
      "Calor e luminosidade em forma de pingente. A pedra em tom âmbar é envolvida por uma moldura orgânica e acompanha corrente delicada, que pode ser ajustada em dois comprimentos.",
    acabamentos: [
      { nome: "Banho de ouro 18k", acrescimo: 0 },
      { nome: "Prata 925", acrescimo: -30 },
    ],
    tamanhos: ["45 cm", "60 cm"],
    rotuloTamanho: "Comprimento",
  },
  {
    id: "bracelete-mare",
    sku: "EL-04",
    nome: "Bracelete Maré",
    categoria: "pulseiras",
    preco: 459,
    imagem: "assets/produtos/bracelete-mare.svg",
    resumo: "Bracelete aberto em ondas suaves.",
    descricao:
      "O desenho acompanha o movimento das marés: ondas que vão e voltam, sem pressa. Aberto atrás, se ajusta ao pulso com conforto e pode ser usado sozinho ou em composição.",
    acabamentos: [
      { nome: "Prata 925", acrescimo: 0 },
      { nome: "Prata 925 com banho de ouro 18k", acrescimo: 90 },
    ],
  },
  {
    id: "argolas-terra-molhada",
    sku: "EL-05",
    nome: "Argolas Terra Molhada",
    categoria: "brincos",
    preco: 279,
    imagem: "assets/produtos/argolas-terra-molhada.svg",
    resumo: "Argolas encorpadas, de forma imperfeita.",
    descricao:
      "Argolas grossas com superfície irregular, que lembram a textura da terra depois da chuva. Marcantes no dia a dia, sem perder a leveza para usar por horas.",
    acabamentos: [
      { nome: "Banho de ouro 18k", acrescimo: 0 },
      { nome: "Prata 925", acrescimo: -20 },
    ],
  },
  {
    id: "anel-duas",
    sku: "EL-06",
    nome: "Anel Duas",
    categoria: "aneis",
    selo: "Edição especial",
    preco: 329,
    imagem: "assets/produtos/anel-duas.svg",
    resumo: "Dois aros entrelaçados, prata e ouro.",
    descricao:
      "Uma homenagem à amizade que deu origem à ELLAS: dois universos diferentes que encontram beleza nas mesmas coisas. Um aro em prata e outro com banho de ouro, entrelaçados para sempre.",
    acabamentos: [{ nome: "Prata 925 + banho de ouro 18k", acrescimo: 0 }],
    tamanhos: ["12", "14", "16", "18", "20", "22"],
  },
]);
