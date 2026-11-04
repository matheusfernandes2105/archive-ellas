import { ensure } from "../shared/DomainError.js";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Identificador do produto: slug minúsculo, ex. "anel-raiz". */
export class ProductId {
  #value;

  /** @param {unknown} value */
  constructor(value) {
    ensure(
      typeof value === "string" && value.length <= 60 && SLUG.test(value),
      "Identificador de produto inválido.",
      "INVALID_PRODUCT_ID",
    );
    this.#value = value;
    Object.freeze(this);
  }

  /** @param {unknown} value */
  static from(value) {
    return new ProductId(value);
  }

  get value() {
    return this.#value;
  }

  /** @param {ProductId} other */
  equals(other) {
    return other instanceof ProductId && other.value === this.#value;
  }
}
