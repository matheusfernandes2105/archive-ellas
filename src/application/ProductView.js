/**
 * DTO de leitura entregue à interface. É um objeto simples e congelado:
 * a apresentação nunca recebe nem altera entidades do domínio.
 */

/**
 * @param {import("../domain/shared/Money.js").Money} price
 * @param {number} installments
 */
function priceView(price, installments) {
  return Object.freeze({
    cents: price.cents,
    label: price.toBRL(),
    installment:
      installments > 1
        ? Object.freeze({ count: installments, label: price.installment(installments).toBRL() })
        : null,
  });
}

/**
 * @param {import("../domain/catalog/Product.js").Product} product
 * @param {{ installments: number }} options
 */
export function toProductView(product, { installments }) {
  const finishes = product.finishes.map((finish, index) =>
    Object.freeze({
      name: finish.name,
      isDefault: index === 0,
      price: priceView(product.priceWith(finish), installments),
    }),
  );

  return Object.freeze({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: Object.freeze({ code: product.category.code, label: product.category.label }),
    badge: product.badge,
    summary: product.summary,
    description: product.description,
    image: product.image,
    price: finishes[0].price,
    finishes: Object.freeze(finishes),
    sizes: product.sizes,
    sizeLabel: product.sizeLabel,
  });
}
