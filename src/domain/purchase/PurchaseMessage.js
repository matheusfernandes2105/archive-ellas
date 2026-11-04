import { ensure } from "../shared/DomainError.js";
import { PurchaseIntent } from "./PurchaseIntent.js";

export const MAX_MESSAGE_LENGTH = 1000;

/**
 * Texto enviado à loja pelo cliente. É montado apenas a partir de dados já
 * validados pelo domínio, então não carrega quebras de linha nem marcações
 * vindas de fora — o cliente vê exatamente o que a loja definiu.
 */
export class PurchaseMessage {
  #text;

  /** @param {string} text */
  constructor(text) {
    ensure(
      typeof text === "string" && text.length > 0 && text.length <= MAX_MESSAGE_LENGTH,
      "Mensagem inválida.",
      "INVALID_MESSAGE",
    );
    this.#text = text;
    Object.freeze(this);
  }

  /** @param {PurchaseIntent} intent */
  static forPurchase(intent) {
    ensure(intent instanceof PurchaseIntent, "Intenção de compra inválida.", "INVALID_MESSAGE");
    const { product, finish, size } = intent;

    const lines = ["Olá, ELLAS! Vi no site e quero comprar esta peça:", "", `*${product.name}* (${product.sku})`];
    if (finish) lines.push(`Acabamento: ${finish.name}`);
    if (product.hasSizes) {
      lines.push(`${product.sizeLabel}: ${size ?? "preciso de ajuda para escolher"}`);
    }
    lines.push(`Valor: ${intent.total.toBRL()}`);
    lines.push("");
    lines.push("Ainda está disponível? Pode me passar as formas de pagamento e entrega?");

    return new PurchaseMessage(lines.join("\n"));
  }

  static generalInquiry() {
    return new PurchaseMessage(
      "Olá, ELLAS! Vim pelo site e gostaria de saber mais sobre as peças da primeira coleção.",
    );
  }

  get text() {
    return this.#text;
  }
}
