import { MessagingGateway } from "../../application/ports/MessagingGateway.js";
import { WhatsAppNumber } from "../../domain/contact/WhatsAppNumber.js";
import { PurchaseMessage } from "../../domain/purchase/PurchaseMessage.js";

const WHATSAPP_BASE = "https://wa.me/";

/** Implementação da porta de mensageria usando links wa.me do WhatsApp. */
export class WhatsAppGateway extends MessagingGateway {
  #number;

  /** @param {WhatsAppNumber} number */
  constructor(number) {
    super();
    if (!(number instanceof WhatsAppNumber)) throw new TypeError("WhatsAppGateway precisa de um WhatsAppNumber.");
    this.#number = number;
  }

  /** @param {PurchaseMessage} message */
  conversationLinkFor(message) {
    if (!(message instanceof PurchaseMessage)) throw new TypeError("Mensagem inválida.");
    // encodeURIComponent codifica &, #, ?, quebras de linha etc. — o texto
    // nunca consegue alterar o destino ou adicionar parâmetros ao link.
    return `${WHATSAPP_BASE}${this.#number.digits}?text=${encodeURIComponent(message.text)}`;
  }
}
