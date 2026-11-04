import { Category } from "../../domain/catalog/Category.js";
import { Finish } from "../../domain/catalog/Finish.js";
import { Product } from "../../domain/catalog/Product.js";
import { ProductId } from "../../domain/catalog/ProductId.js";
import { ProductImage } from "../../domain/catalog/ProductImage.js";
import { Sku } from "../../domain/catalog/Sku.js";
import { DomainError } from "../../domain/shared/DomainError.js";
import { Money } from "../../domain/shared/Money.js";

/** @param {unknown} value */
function isPlainObject(value) {
  return value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

/**
 * Anticorrupção: converte o formato do arquivo de dados (em português, valores
 * em reais) para entidades do domínio. Toda validação acontece no domínio.
 *
 * @param {unknown} raw
 */
export function toDomain(raw) {
  if (!isPlainObject(raw)) throw new DomainError("Registro de produto inválido.", "INVALID_PRODUCT");
  const data = /** @type {Record<string, any>} */ (raw);

  // Acabamentos são opcionais: peças sem variação não têm o campo.
  const rawFinishes = data.acabamentos ?? [];
  if (!Array.isArray(rawFinishes)) {
    throw new DomainError(`Produto "${String(data.id).slice(0, 60)}": acabamentos inválidos.`, "INVALID_FINISH");
  }

  return Product.create({
    id: ProductId.from(data.id),
    sku: Sku.from(data.sku),
    name: data.nome,
    category: Category.from(data.categoria),
    badge: data.selo ?? null,
    basePrice: Money.fromReais(data.preco),
    summary: data.resumo,
    description: data.descricao,
    image: ProductImage.from(data.imagem),
    finishes: rawFinishes.map((/** @type {unknown} */ finish) => {
      if (!isPlainObject(finish)) throw new DomainError("Acabamento inválido.", "INVALID_FINISH");
      const f = /** @type {Record<string, any>} */ (finish);
      return Finish.create({ name: f.nome, surcharge: Money.fromReais(f.acrescimo ?? 0) });
    }),
    sizes: data.tamanhos ?? null,
    sizeLabel: data.rotuloTamanho ?? "Tamanho",
  });
}
