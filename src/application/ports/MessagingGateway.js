/**
 * Porta de saída: transforma uma mensagem do domínio em um link de conversa
 * com a loja. Hoje a implementação é o WhatsApp; poderia ser outro canal.
 */
export class MessagingGateway {
  /**
   * @param {import("../../domain/purchase/PurchaseMessage.js").PurchaseMessage} _message
   * @returns {string} URL https segura para abrir a conversa
   */
  conversationLinkFor(_message) {
    throw new Error("MessagingGateway.conversationLinkFor() não implementado.");
  }
}
