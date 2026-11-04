import { ensure } from "../shared/DomainError.js";
import { Money } from "../shared/Money.js";
import { safeText } from "../shared/Text.js";

/** Acabamento de uma peça (ex. "Prata 925") e o acréscimo/desconto sobre o preço base. */
export class Finish {
  #name;
  #surcharge;

  /** @param {{ name: string, surcharge?: Money }} props */
  constructor({ name, surcharge = Money.zero() }) {
    ensure(surcharge instanceof Money, "Acréscimo do acabamento inválido.", "INVALID_FINISH");
    this.#name = safeText(name, { field: "Nome do acabamento", max: 60, noMarkup: true });
    this.#surcharge = surcharge;
    Object.freeze(this);
  }

  /** @param {{ name: string, surcharge?: Money }} props */
  static create(props) {
    return new Finish(props);
  }

  get name() {
    return this.#name;
  }

  get surcharge() {
    return this.#surcharge;
  }

  /** @param {Finish} other */
  equals(other) {
    return other instanceof Finish && other.name === this.#name;
  }
}
