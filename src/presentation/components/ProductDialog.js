import { el, required, setSafeHref } from "../dom.js";
import { installmentText } from "../format.js";

/**
 * Janela de detalhes do produto, com escolha de acabamento/tamanho.
 * Preço e link de compra vêm sempre dos casos de uso — a interface não calcula nada.
 */
export class ProductDialog {
  #dialog;
  #getProductDetails;
  #startPurchase;
  /** @type {ReturnType<typeof import("../../application/ProductView.js").toProductView> | null} */
  #view = null;
  #choice = { finishName: /** @type {string | null} */ (null), size: /** @type {string | null} */ (null) };
  #updateToken = 0;

  /**
   * @param {{
   *   dialog: HTMLDialogElement,
   *   getProductDetails: import("../../application/GetProductDetails.js").GetProductDetails,
   *   startPurchase: import("../../application/StartPurchase.js").StartPurchase
   * }} deps
   */
  constructor({ dialog, getProductDetails, startPurchase }) {
    this.#dialog = dialog;
    this.#getProductDetails = getProductDetails;
    this.#startPurchase = startPurchase;

    required(dialog, "[data-dialog-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close(); // clique fora do conteúdo
    });
    dialog.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  }

  /** @param {string} selector */
  #part(selector) {
    return /** @type {HTMLElement} */ (required(this.#dialog, selector));
  }

  /** @param {string} productId */
  async open(productId) {
    const view = await this.#getProductDetails.execute({ productId });
    this.#view = view;
    this.#choice = { finishName: view.finishes[0].name, size: null };

    const img = /** @type {HTMLImageElement} */ (this.#part("[data-d-img]"));
    img.src = view.image;
    img.alt = `${view.name} — ${view.summary}`;
    this.#part("[data-d-cat]").textContent = view.category.label;
    this.#part("[data-d-name]").textContent = view.name;
    this.#part("[data-d-desc]").textContent = view.description;
    this.#part("[data-d-sku]").textContent = `Código ${view.sku}`;

    this.#renderOptions(
      this.#part("[data-d-finishes]"),
      "acabamento",
      view.finishes.map((finish) => finish.name),
      0,
      (name) => {
        this.#choice.finishName = name;
        void this.#update();
      },
    );
    this.#part("[data-d-finish-group]").hidden = view.finishes.length < 2;

    const sizeGroup = this.#part("[data-d-size-group]");
    if (view.sizes) {
      sizeGroup.hidden = false;
      this.#part("[data-d-size-label]").textContent = view.sizeLabel;
      this.#renderOptions(this.#part("[data-d-sizes]"), "tamanho", view.sizes, -1, (size) => {
        this.#choice.size = size;
        void this.#update();
      });
    } else {
      sizeGroup.hidden = true;
      this.#part("[data-d-sizes]").replaceChildren();
    }

    await this.#update();
    if (!this.#dialog.open) this.#dialog.showModal();
    document.body.classList.add("no-scroll");
  }

  /**
   * @param {HTMLElement} container
   * @param {string} group
   * @param {readonly string[]} values
   * @param {number} checkedIndex
   * @param {(value: string) => void} onChange
   */
  #renderOptions(container, group, values, checkedIndex, onChange) {
    const nodes = values.flatMap((value, index) => {
      const id = `opt-${group}-${index}`;
      const input = /** @type {HTMLInputElement} */ (
        el("input", { attrs: { type: "radio", name: group, id, value: String(index) } })
      );
      input.checked = index === checkedIndex;
      input.addEventListener("change", () => {
        if (input.checked) onChange(value);
      });
      return [input, el("label", { attrs: { for: id }, text: value })];
    });
    container.replaceChildren(...nodes);
  }

  async #update() {
    const view = this.#view;
    if (!view) return;
    const token = ++this.#updateToken;

    const finish = view.finishes.find((f) => f.name === this.#choice.finishName) ?? view.finishes[0];
    const purchase = await this.#startPurchase.execute({
      productId: view.id,
      finishName: finish.name,
      size: this.#choice.size,
    });
    if (token !== this.#updateToken) return; // escolha mais recente em andamento

    this.#part("[data-d-price]").textContent = purchase.total;
    this.#part("[data-d-install]").textContent = installmentText(finish.price);
    setSafeHref(/** @type {HTMLAnchorElement} */ (this.#part("[data-d-buy]")), purchase.url);
  }
}
