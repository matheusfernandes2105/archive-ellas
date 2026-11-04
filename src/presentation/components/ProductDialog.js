import { el, isSafeSrcset, required, setSafeHref } from "../dom.js";
import { installmentText } from "../format.js";
import { productImageSources, SIZES } from "../images.js";

/** Mesmo ponto de quebra do CSS em que a janela vira "bottom sheet". */
const SHEET_LAYOUT = window.matchMedia("(max-width: 699.98px)");
const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");
const SWIPE_CLOSE_THRESHOLD = 110;

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

    required(dialog, "[data-dialog-close]").addEventListener("click", () => this.#close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) this.#close(); // toque fora do conteúdo
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("no-scroll");
      dialog.style.transform = "";
      dialog.style.transition = "";
    });
    this.#enableSwipeToClose();
  }

  /** No celular, a janela desce antes de fechar (mesmo gesto do arrastar). */
  #close() {
    const dialog = this.#dialog;
    if (!dialog.open) return;
    if (!SHEET_LAYOUT.matches || REDUCED_MOTION.matches) {
      dialog.close();
      return;
    }
    dialog.style.transition = "transform 0.24s ease-in";
    dialog.style.transform = "translateY(100%)";
    window.setTimeout(() => dialog.close(), 230);
  }

  /**
   * "Bottom sheet": arrastar para baixo, a partir do topo da janela, fecha.
   * Arrastar para cima continua rolando o conteúdo normalmente.
   */
  #enableSwipeToClose() {
    const dialog = this.#dialog;
    /** @type {number | null} */
    let startY = null;
    let dy = 0;

    dialog.addEventListener(
      "touchstart",
      (event) => {
        startY = SHEET_LAYOUT.matches && event.touches.length === 1 && dialog.scrollTop <= 0 ? event.touches[0].clientY : null;
        dy = 0;
      },
      { passive: true },
    );

    dialog.addEventListener(
      "touchmove",
      (event) => {
        if (startY === null) return;
        dy = event.touches[0].clientY - startY;
        if (dy <= 0) {
          dialog.style.transform = "";
          return;
        }
        event.preventDefault(); // puxando para baixo: a janela acompanha o dedo
        dialog.style.transition = "none";
        dialog.style.transform = `translateY(${Math.round(dy)}px)`;
      },
      { passive: false },
    );

    const end = () => {
      if (startY === null) return;
      startY = null;
      if (dy > SWIPE_CLOSE_THRESHOLD) {
        this.#close();
      } else {
        dialog.style.transition = "transform 0.25s ease-out";
        dialog.style.transform = "";
      }
      dy = 0;
    };
    dialog.addEventListener("touchend", end);
    dialog.addEventListener("touchcancel", end);
  }

  /** @param {string} selector */
  #part(selector) {
    return /** @type {HTMLElement} */ (required(this.#dialog, selector));
  }

  /** @param {string} productId */
  async open(productId) {
    const view = await this.#getProductDetails.execute({ productId });
    this.#view = view;
    this.#choice = { finishName: view.finishes[0]?.name ?? null, size: null };

    const img = /** @type {HTMLImageElement} */ (this.#part("[data-d-img]"));
    const sources = productImageSources(view.image);
    if (sources.srcset && isSafeSrcset(sources.srcset)) {
      img.sizes = SIZES.dialog;
      img.srcset = sources.srcset;
    } else {
      img.removeAttribute("srcset");
      img.removeAttribute("sizes");
    }
    img.src = sources.src;
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
    this.#dialog.scrollTop = 0;
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

    // Peças sem variação não têm acabamento: o preço é o da própria peça.
    const finish = view.finishes.find((f) => f.name === this.#choice.finishName) ?? view.finishes[0] ?? null;
    const purchase = await this.#startPurchase.execute({
      productId: view.id,
      finishName: finish?.name ?? null,
      size: this.#choice.size,
    });
    if (token !== this.#updateToken) return; // escolha mais recente em andamento

    this.#part("[data-d-price]").textContent = purchase.total;
    this.#part("[data-d-buy-price]").textContent = purchase.total;
    this.#part("[data-d-install]").textContent = installmentText((finish ?? view).price);
    setSafeHref(/** @type {HTMLAnchorElement} */ (this.#part("[data-d-buy]")), purchase.url);
  }
}
