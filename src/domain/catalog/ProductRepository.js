/**
 * Porta (interface) do repositório de produtos.
 *
 * O domínio define o contrato; a infraestrutura escolhe de onde os dados vêm
 * (hoje um arquivo estático; amanhã, se houver, uma API). Os métodos são
 * assíncronos para que a troca de implementação não mude quem os usa.
 */
export class ProductRepository {
  /** @returns {Promise<import("./Product.js").Product[]>} */
  async findAll() {
    throw new Error("ProductRepository.findAll() não implementado.");
  }

  /**
   * @param {string} _id
   * @returns {Promise<import("./Product.js").Product | null>}
   */
  async findById(_id) {
    throw new Error("ProductRepository.findById() não implementado.");
  }
}
