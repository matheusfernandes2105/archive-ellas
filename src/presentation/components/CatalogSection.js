import { ALL_CATEGORIES } from "../../application/ListCatalog.js";
import { el } from "../dom.js";
import { createProductCard } from "./ProductCard.js";

/**
 * Mensagem exibida quando o catálogo não pode ser carregado.
 * @param {HTMLElement} grid
 */
export function renderCatalogUnavailable(grid) {
  grid.replaceChildren(
    el("li", {
      attrs: { class: "empty-state" },
      text: "O catálogo está indisponível no momento. Fale com a gente pelo WhatsApp.",
    }),
  );
}

/** Vitrine: filtros por categoria + grade de produtos. */
export class CatalogSection {
  #grid;
  #chips;
  #listCatalog;
  #startPurchase;
  #onOpenProduct;
  #renderToken = 0;

  /**
   * @param {{
   *   grid: HTMLElement,
   *   filters: HTMLElement,
   *   listCatalog: import("../../application/ListCatalog.js").ListCatalog,
   *   startPurchase: import("../../application/StartPurchase.js").StartPurchase,
   *   onOpenProduct: (productId: string) => void
   * }} deps
   */
  constructor({ grid, filters, listCatalog, startPurchase, onOpenProduct }) {
    this.#grid = grid;
    this.#chips = /** @type {HTMLButtonElement[]} */ ([...filters.querySelectorAll("[data-filter]")]);
    this.#listCatalog = listCatalog;
    this.#startPurchase = startPurchase;
    this.#onOpenProduct = onOpenProduct;

    for (const chip of this.#chips) {
      chip.addEventListener("click", () => {
        this.#markActive(chip);
        void this.render(chip.dataset.filter ?? ALL_CATEGORIES);
      });
    }
  }

  /** @param {HTMLButtonElement} active */
  #markActive(active) {
    for (const chip of this.#chips) {
      const isActive = chip === active;
      chip.classList.toggle("is-active", isActive);
      chip.setAttribute("aria-pressed", String(isActive));
    }
  }

  /** @param {string} category */
  async render(category) {
    const token = ++this.#renderToken;
    const views = await this.#listCatalog.execute({ category });
    const buyLinks = await Promise.all(views.map((view) => this.#startPurchase.execute({ productId: view.id })));
    if (token !== this.#renderToken) return; // um filtro mais novo já foi pedido

    if (views.length === 0) {
      this.#grid.replaceChildren(
        el("li", { attrs: { class: "empty-state" }, text: "Em breve, novas peças nesta categoria." }),
      );
      return;
    }

    this.#grid.replaceChildren(
      ...views.map((view, index) =>
        createProductCard(view, { buyUrl: buyLinks[index].url, index, onOpen: this.#onOpenProduct }),
      ),
    );
  }
}
