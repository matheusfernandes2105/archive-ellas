import { ensure } from "../shared/DomainError.js";

const CATEGORIES = Object.freeze({
  aneis: "Anéis",
  brincos: "Brincos",
  colares: "Colares",
  pulseiras: "Pulseiras",
});

/** Categoria de joia (objeto de valor, lista fechada). */
export class Category {
  #code;

  /** @param {string} code */
  constructor(code) {
    ensure(Category.isValid(code), `Categoria desconhecida: ${String(code).slice(0, 40)}`, "INVALID_CATEGORY");
    this.#code = code;
    Object.freeze(this);
  }

  /** @param {string} code */
  static from(code) {
    return new Category(code);
  }

  /** @param {unknown} code */
  static isValid(code) {
    return typeof code === "string" && Object.hasOwn(CATEGORIES, code);
  }

  static all() {
    return Object.keys(CATEGORIES).map((code) => new Category(code));
  }

  get code() {
    return this.#code;
  }

  get label() {
    return CATEGORIES[this.#code];
  }

  /** @param {Category} other */
  equals(other) {
    return other instanceof Category && other.code === this.#code;
  }
}
