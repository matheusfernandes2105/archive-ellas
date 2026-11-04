import { el, icon } from "../dom.js";
import { installmentText } from "../format.js";

/**
 * Card de produto da vitrine.
 * @param {ReturnType<typeof import("../../application/ProductView.js").toProductView>} view
 * @param {{ buyUrl: string, index: number, onOpen: (productId: string) => void }} options
 */
export function createProductCard(view, { buyUrl, index, onOpen }) {
  const media = el("button", {
    attrs: { type: "button", class: "product-media", "aria-label": `Ver detalhes de ${view.name}` },
    children: [
      view.badge ? el("span", { attrs: { class: "product-tag" }, text: view.badge }) : null,
      el("img", {
        attrs: {
          src: view.image,
          alt: `${view.name} — ${view.summary}`,
          width: 800,
          height: 1000,
          loading: index < 3 ? "eager" : "lazy",
          decoding: "async",
        },
      }),
    ],
  });
  media.addEventListener("click", () => onOpen(view.id));

  const details = el("button", { attrs: { type: "button", class: "btn btn-details" }, text: "Detalhes" });
  details.addEventListener("click", () => onOpen(view.id));

  const buy = el("a", {
    attrs: {
      class: "btn btn-wa",
      href: buyUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": `Comprar ${view.name} pelo WhatsApp`,
    },
    children: [icon("wa"), document.createTextNode(" Comprar")],
  });

  const card = el("li", {
    attrs: { class: "product-card", "data-categoria": view.category.code },
    children: [
      media,
      el("div", {
        attrs: { class: "product-body" },
        children: [
          el("div", {
            attrs: { class: "product-top" },
            children: [
              el("h3", { attrs: { class: "product-name" }, text: view.name }),
              el("span", { attrs: { class: "product-price" }, text: view.price.label }),
            ],
          }),
          el("p", { attrs: { class: "product-summary" }, text: view.summary }),
          el("p", { attrs: { class: "product-install" }, text: installmentText(view.price) }),
          el("div", { attrs: { class: "product-actions" }, children: [buy, details] }),
        ],
      }),
    ],
  });
  // CSSOM (permitido pela CSP), em vez do atributo style.
  card.style.animationDelay = `${(index % 3) * 80}ms`;
  return card;
}
