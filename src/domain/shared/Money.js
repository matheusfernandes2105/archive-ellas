import { ensure } from "./DomainError.js";

/** Limite de segurança: R$ 1.000.000,00. */
const MAX_CENTS = 100_000_000;
const MAX_INSTALLMENTS = 24;

/**
 * Valor monetário em reais, guardado em centavos inteiros
 * (nunca em ponto flutuante, para não haver erro de arredondamento).
 * Pode ser negativo para representar descontos/acréscimos.
 */
export class Money {
  #cents;

  /** @param {number} cents */
  constructor(cents) {
    ensure(Number.isSafeInteger(cents), "Valor monetário inválido.", "INVALID_MONEY");
    ensure(Math.abs(cents) <= MAX_CENTS, "Valor monetário fora do limite permitido.", "INVALID_MONEY");
    this.#cents = cents;
    Object.freeze(this);
  }

  /** @param {number} cents */
  static fromCents(cents) {
    return new Money(cents);
  }

  /** @param {number} reais */
  static fromReais(reais) {
    ensure(typeof reais === "number" && Number.isFinite(reais), "Valor em reais inválido.", "INVALID_MONEY");
    const cents = Math.round(reais * 100);
    ensure(Math.abs(reais * 100 - cents) < 1e-6, "Valor em reais deve ter no máximo 2 casas decimais.", "INVALID_MONEY");
    return new Money(cents);
  }

  static zero() {
    return new Money(0);
  }

  get cents() {
    return this.#cents;
  }

  isPositive() {
    return this.#cents > 0;
  }

  /** @param {Money} other */
  add(other) {
    ensure(other instanceof Money, "Só é possível somar valores monetários.", "INVALID_MONEY");
    return new Money(this.#cents + other.cents);
  }

  /**
   * Valor de cada parcela sem juros, arredondado para cima no centavo
   * (o total parcelado nunca fica abaixo do preço).
   * @param {number} count
   */
  installment(count) {
    ensure(
      Number.isInteger(count) && count >= 1 && count <= MAX_INSTALLMENTS,
      `Número de parcelas deve ser um inteiro entre 1 e ${MAX_INSTALLMENTS}.`,
      "INVALID_INSTALLMENTS",
    );
    ensure(this.isPositive(), "Só é possível parcelar valores positivos.", "INVALID_INSTALLMENTS");
    return new Money(Math.ceil(this.#cents / count));
  }

  /** @param {Money} other */
  equals(other) {
    return other instanceof Money && other.cents === this.#cents;
  }

  /** Formato brasileiro, com espaço comum: "R$ 1.249,90". */
  toBRL() {
    const abs = Math.abs(this.#cents);
    const reais = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const cents = String(abs % 100).padStart(2, "0");
    return `${this.#cents < 0 ? "-" : ""}R$ ${reais},${cents}`;
  }

  toString() {
    return this.toBRL();
  }
}
