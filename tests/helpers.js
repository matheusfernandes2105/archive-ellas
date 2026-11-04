/** Dados válidos de um produto no formato do arquivo de dados, para os testes. */
export function rawProduct(overrides = {}) {
  return {
    id: "anel-teste",
    sku: "EL-99",
    nome: "Anel Teste",
    categoria: "aneis",
    preco: 249,
    imagem: "assets/produtos/anel-teste.svg",
    resumo: "Resumo curto.",
    descricao: "Descrição da peça.",
    acabamentos: [
      { nome: "Prata 925", acrescimo: 0 },
      { nome: "Banho de ouro 18k", acrescimo: 60 },
    ],
    tamanhos: ["14", "16"],
    ...overrides,
  };
}
