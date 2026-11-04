import { ensure } from "../shared/DomainError.js";

/** Formato E.164 sem o "+": DDI + DDD + número, de 10 a 15 dígitos. */
const E164_DIGITS = /^[1-9]\d{9,14}$/;
const FORMATTING = /[\s().+-]/g;

/** Número de WhatsApp da loja (objeto de valor). */
export class WhatsAppNumber {
  #digits;

  /** @param {string} digits */
  constructor(digits) {
    ensure(
      typeof digits === "string" && E164_DIGITS.test(digits),
      "Número de WhatsApp inválido. Use DDI + DDD + número, ex. 5592999999999.",
      "INVALID_WHATSAPP",
    );
    this.#digits = digits;
    Object.freeze(this);
  }

  /**
   * Aceita o número com ou sem formatação ("+55 (92) 99999-9999").
   * @param {unknown} raw
   */
  static parse(raw) {
    ensure(typeof raw === "string" && raw.length <= 32, "Número de WhatsApp inválido.", "INVALID_WHATSAPP");
    return new WhatsAppNumber(raw.replace(FORMATTING, ""));
  }

  get digits() {
    return this.#digits;
  }
}
