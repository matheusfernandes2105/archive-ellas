/**
 * Catálogo da primeira coleção ELLAS — edite aqui.
 *
 * Os dados são validados pelo domínio ao carregar o site: um campo inválido
 * (preço negativo, imagem fora de assets/produtos/, SKU fora do padrão etc.)
 * impede o catálogo de aparecer e o erro é mostrado no console do navegador.
 * Rode `npm test` depois de editar para conferir antes de publicar.
 *
 * Campos:
 * - categoria: "aneis" | "brincos" | "colares" | "pulseiras"
 * - preco: em reais, com até 2 casas decimais.
 * - resumo: frase curta exibida no card (até 120 caracteres).
 * - imagem: foto 4:5 em assets/produtos/. Para cada "nome.webp" (1200px) deve
 *   existir também "nome-640.webp", a versão leve usada no celular.
 * - selo (opcional): etiqueta sobre a foto, ex. "Nova".
 * - acabamentos / tamanhos (opcionais): só para peças com variação. Sem eles,
 *   o cliente apenas compra a peça, como nesta coleção.
 *
 * ATENÇÃO: os preços abaixo são PROVISÓRIOS — substitua pelos valores reais.
 */
export const productsData = Object.freeze([
  {
    id: "anel-ventos-do-sul",
    sku: "EL-01",
    nome: "Anel Ventos do Sul",
    categoria: "aneis",
    preco: 289, // PREÇO PROVISÓRIO
    imagem: "assets/produtos/anel-ventos-do-sul.webp",
    resumo: "Anel orgânico com cravação delicada.",
    descricao:
      "Inspirado na fluidez dos elementos naturais e na suavidade do vento, este anel autoral traz formas orgânicas esculpidas à mão, pontuadas por zircônias delicadas. Uma joia pensada para carregar significados e acompanhar a sua identidade em todos os momentos.",
  },
  {
    id: "anel-rastro-do-tempo",
    sku: "EL-02",
    nome: "Anel Rastro do Tempo",
    categoria: "aneis",
    preco: 259, // PREÇO PROVISÓRIO
    imagem: "assets/produtos/anel-rastro-do-tempo.webp",
    resumo: "Anel texturizado martelado.",
    descricao:
      "Atemporal, marcante e profundamente expressivo. O Anel Rastro do Tempo possui uma superfície inteiramente martelada que captura a luz de forma única, celebrando a beleza daquilo que resiste e ganha personalidade com os anos.",
  },
  {
    id: "anel-valsa-dourada",
    sku: "EL-03",
    nome: "Anel Valsa Dourada",
    categoria: "aneis",
    preco: 319, // PREÇO PROVISÓRIO
    imagem: "assets/produtos/anel-valsa-dourada.webp",
    resumo: "Anel orgânico envolvente dourado.",
    descricao:
      "Com um design sinuoso que parece dançar ao redor da pele, este anel traduz o encontro entre a força e a leveza. Suas curvas orgânicas trazem um relevo sutil que transforma o acessório em um verdadeiro objeto de desejo.",
  },
  {
    id: "colar-elegia-de-prata",
    sku: "EL-04",
    nome: "Colar Elegia de Prata",
    categoria: "colares",
    preco: 349, // PREÇO PROVISÓRIO
    imagem: "assets/produtos/colar-elegia-de-prata.webp",
    resumo: "Colar com pingente orgânico e elos vazados.",
    descricao:
      "Uma ode à arquitetura das formas puras. O Colar Elegia combina uma corrente de elos irregulares a um pingente central de toque escovado, materializando a essência de transformar ideias e memórias em poesia para vestir.",
  },
  {
    id: "brincos-sinfonia-fluida",
    sku: "EL-05",
    nome: "Brincos Sinfonia Fluida",
    categoria: "brincos",
    preco: 279, // PREÇO PROVISÓRIO
    imagem: "assets/produtos/brincos-sinfonia-fluida.webp",
    resumo: "Brincos longos pendentes orgânicos.",
    descricao:
      "Inspirados no ritmo e na atmosfera sensorial da música, estes brincos pendentes misturam hastes sinuosas a formas orgânicas suspensas. Uma joia expressiva que traz movimento, leveza e um forte apelo editorial para o visual.",
  },
  {
    id: "argolas-atos-de-luz",
    sku: "EL-06",
    nome: "Argolas Atos de Luz",
    categoria: "brincos",
    preco: 239, // PREÇO PROVISÓRIO
    imagem: "assets/produtos/argolas-atos-de-luz.webp",
    resumo: "Argolas orgânicas texturizadas.",
    descricao:
      "Uma releitura contemporânea e artística do clássico. As Argolas Atos possuem ondulações orgânicas que brincam com o reflexo da luz, trazendo sofisticação, conforto e uma presença marcante para o dia a dia.",
  },
]);
