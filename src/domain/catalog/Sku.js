import { ensure } from "../shared/DomainError.js";

const SKU = /^EL-\d{2,4}$/;

/** Código de referência da peça, ex. "EL-01". */
export class Sku {
  #value;

  /** @param {unknown} value */
  constructor(value) {
    ensure(typeof value === "string" && SKU.test(value), "Código (SKU) inválido. Use o formato EL-01.", "INVALID_SKU");
    this.#value = value;
    Object.freeze(this);
  }

  /** @param {unknown} value */
  static from(value) {
    return new Sku(value);
  }

  get value() {
    return this.#value;
  }
}
