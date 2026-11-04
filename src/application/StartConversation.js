import { PurchaseMessage } from "../domain/purchase/PurchaseMessage.js";

/** Caso de uso: abrir uma conversa geral com a loja (dúvidas, atendimento). */
export class StartConversation {
  #messagingGateway;

  /** @param {{ messagingGateway: import("./ports/MessagingGateway.js").MessagingGateway }} deps */
  constructor({ messagingGateway }) {
    this.#messagingGateway = messagingGateway;
  }

  execute() {
    return this.#messagingGateway.conversationLinkFor(PurchaseMessage.generalInquiry());
  }
}
