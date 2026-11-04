import { ProductId } from "../domain/catalog/ProductId.js";
import { ApplicationError } from "./ApplicationError.js";
import { toProductView } from "./ProductView.js";

/** Caso de uso: detalhes de uma peça para a janela de compra. */
export class GetProductDetails {
  #productRepository;
  #installments;

  /**
   * @param {{
   *   productRepository: import("../domain/catalog/ProductRepository.js").ProductRepository,
   *   installments: number
   * }} deps
   */
  constructor({ productRepository, installments }) {
    this.#productRepository = productRepository;
    this.#installments = installments;
  }

  /** @param {{ productId: string }} input */
  async execute({ productId }) {
    const id = ProductId.from(productId);
    const product = await this.#productRepository.findById(id.value);
    if (!product) throw new ApplicationError("Produto não encontrado.", "PRODUCT_NOT_FOUND");
    return toProductView(product, { installments: this.#installments });
  }
}
