import { ensure } from "../shared/DomainError.js";
import { Product } from "../catalog/Product.js";

/**
 * Intenção de compra: a peça, o acabamento e (opcionalmente) o tamanho
 * que o cliente escolheu. Só é criada se a combinação for válida para a peça.
 */
export class PurchaseIntent {
  #product;
  #finish;
  #size;

  /**
   * @param {Product} product
   * @param {import("../catalog/Finish.js").Finish | null} finish  null em peças sem variações
   * @param {string | null} size
   */
  constructor(product, finish, size) {
    this.#product = product;
    this.#finish = finish;
    this.#size = size;
    Object.freeze(this);
  }

  /**
   * @param {{ product: Product, finishName?: string | null, size?: string | null }} choice
   *   Sem acabamento, usa o padrão da peça (ou nenhum, se ela não tem variações).
   *   Sem tamanho, o cliente pede ajuda para escolher.
   */
  static create({ product, finishName = null, size = null }) {
    ensure(product instanceof Product, "Produto inválido.", "INVALID_PURCHASE");

    let finish = product.defaultFinish;
    if (finishName != null) {
      finish = product.findFinish(finishName);
      ensure(finish !== null, "Acabamento indisponível para esta peça.", "INVALID_FINISH");
    }

    let chosenSize = null;
    if (size != null && size !== "") {
      ensure(product.acceptsSize(size), "Tamanho indisponível para esta peça.", "INVALID_SIZE");
      chosenSize = size;
    }

    return new PurchaseIntent(product, finish, chosenSize);
  }

  get product() {
    return this.#product;
  }

  get finish() {
    return this.#finish;
  }

  /** @returns {string | null} */
  get size() {
    return this.#size;
  }

  get total() {
    return this.#product.priceWith(this.#finish);
  }
}
