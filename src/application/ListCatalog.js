import { Category } from "../domain/catalog/Category.js";
import { ApplicationError } from "./ApplicationError.js";
import { toProductView } from "./ProductView.js";

export const ALL_CATEGORIES = "todas";

/** Caso de uso: listar a vitrine, opcionalmente filtrada por categoria. */
export class ListCatalog {
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

  /** @param {{ category?: string }} [input] */
  async execute({ category = ALL_CATEGORIES } = {}) {
    let filter = null;
    if (category !== ALL_CATEGORIES) {
      if (!Category.isValid(category)) {
        throw new ApplicationError("Categoria inválida.", "INVALID_CATEGORY_FILTER");
      }
      filter = Category.from(category);
    }

    const products = await this.#productRepository.findAll();
    return Object.freeze(
      products
        .filter((product) => filter === null || product.belongsTo(filter))
        .map((product) => toProductView(product, { installments: this.#installments })),
    );
  }
}
