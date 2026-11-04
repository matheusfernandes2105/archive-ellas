import { ProductId } from "../domain/catalog/ProductId.js";
import { PurchaseIntent } from "../domain/purchase/PurchaseIntent.js";
import { PurchaseMessage } from "../domain/purchase/PurchaseMessage.js";
import { ApplicationError } from "./ApplicationError.js";

/**
 * Caso de uso: iniciar a compra de uma peça.
 * Valida a escolha (acabamento/tamanho) no domínio, monta a mensagem e
 * devolve o link de conversa com a loja.
 */
export class StartPurchase {
  #productRepository;
  #messagingGateway;

  /**
   * @param {{
   *   productRepository: import("../domain/catalog/ProductRepository.js").ProductRepository,
   *   messagingGateway: import("./ports/MessagingGateway.js").MessagingGateway
   * }} deps
   */
  constructor({ productRepository, messagingGateway }) {
    this.#productRepository = productRepository;
    this.#messagingGateway = messagingGateway;
  }

  /** @param {{ productId: string, finishName?: string | null, size?: string | null }} input */
  async execute({ productId, finishName = null, size = null }) {
    const id = ProductId.from(productId);
    const product = await this.#productRepository.findById(id.value);
    if (!product) throw new ApplicationError("Produto não encontrado.", "PRODUCT_NOT_FOUND");

    const intent = PurchaseIntent.create({ product, finishName, size });
    const message = PurchaseMessage.forPurchase(intent);

    return Object.freeze({
      url: this.#messagingGateway.conversationLinkFor(message),
      total: intent.total.toBRL(),
    });
  }
}
