import { ProductRepository } from "../../domain/catalog/ProductRepository.js";
import { DomainError } from "../../domain/shared/DomainError.js";
import { toDomain } from "./ProductMapper.js";

/**
 * Repositório que lê o catálogo de um arquivo estático (products.data.js).
 * Valida tudo uma única vez, na criação: se algum produto for inválido,
 * o repositório não é criado (falha rápida, nada parcial chega à tela).
 */
export class StaticProductRepository extends ProductRepository {
  /** @type {Map<string, import("../../domain/catalog/Product.js").Product>} */
  #byId;

  /** @param {readonly unknown[]} rawProducts */
  constructor(rawProducts) {
    super();
    if (!Array.isArray(rawProducts)) throw new DomainError("Catálogo inválido.", "INVALID_CATALOG");

    const products = rawProducts.map((raw) => toDomain(raw));
    const skus = new Set();
    this.#byId = new Map();
    for (const product of products) {
      if (this.#byId.has(product.id)) throw new DomainError(`Produto repetido: ${product.id}`, "DUPLICATE_PRODUCT");
      if (skus.has(product.sku)) throw new DomainError(`SKU repetido: ${product.sku}`, "DUPLICATE_SKU");
      this.#byId.set(product.id, product);
      skus.add(product.sku);
    }
  }

  async findAll() {
    return [...this.#byId.values()];
  }

  /** @param {string} id */
  async findById(id) {
    return this.#byId.get(id) ?? null;
  }
}
