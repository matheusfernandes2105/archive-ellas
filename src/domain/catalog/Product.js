import { ensure } from "../shared/DomainError.js";
import { Money } from "../shared/Money.js";
import { safeText } from "../shared/Text.js";
import { Category } from "./Category.js";
import { Finish } from "./Finish.js";
import { ProductId } from "./ProductId.js";
import { ProductImage } from "./ProductImage.js";
import { Sku } from "./Sku.js";

const MAX_FINISHES = 10;
const MAX_SIZES = 20;

/**
 * Peça do catálogo (raiz de agregado).
 *
 * Invariantes:
 * - variações são opcionais: sem acabamentos, a peça é vendida pelo preço base;
 * - acabamentos, quando existem, não repetem nome e todo preço final é positivo;
 * - tamanhos, quando existem, não se repetem;
 * - todo texto é validado (sem caracteres de controle ou de falsificação).
 */
export class Product {
  #id;
  #sku;
  #name;
  #category;
  #badge;
  #basePrice;
  #summary;
  #description;
  #image;
  #finishes;
  #sizes;
  #sizeLabel;

  /**
   * @param {{
   *   id: ProductId, sku: Sku, name: string, category: Category, badge?: string | null,
   *   basePrice: Money, summary: string, description: string, image: ProductImage,
   *   finishes?: Finish[] | null, sizes?: string[] | null, sizeLabel?: string
   * }} props
   */
  constructor(props) {
    ensure(props.id instanceof ProductId, "Produto sem identificador válido.", "INVALID_PRODUCT");
    ensure(props.sku instanceof Sku, "Produto sem SKU válido.", "INVALID_PRODUCT");
    ensure(props.category instanceof Category, "Produto sem categoria válida.", "INVALID_PRODUCT");
    ensure(props.image instanceof ProductImage, "Produto sem imagem válida.", "INVALID_PRODUCT");
    ensure(props.basePrice instanceof Money && props.basePrice.isPositive(), "Preço base deve ser positivo.", "INVALID_PRICE");

    this.#id = props.id;
    this.#sku = props.sku;
    this.#category = props.category;
    this.#image = props.image;
    this.#basePrice = props.basePrice;
    this.#name = safeText(props.name, { field: "Nome do produto", max: 60, noMarkup: true });
    this.#summary = safeText(props.summary, { field: "Resumo do produto", max: 120 });
    this.#description = safeText(props.description, { field: "Descrição do produto", max: 600 });
    this.#badge = props.badge == null ? null : safeText(props.badge, { field: "Selo do produto", max: 24 });

    this.#finishes = Product.#validateFinishes(props.finishes, props.basePrice);
    this.#sizes = Product.#validateSizes(props.sizes);
    this.#sizeLabel = safeText(props.sizeLabel ?? "Tamanho", { field: "Rótulo do tamanho", max: 20, noMarkup: true });

    Object.freeze(this);
  }

  /** @param {ConstructorParameters<typeof Product>[0]} props */
  static create(props) {
    return new Product(props);
  }

  /**
   * @param {unknown} finishes
   * @param {Money} basePrice
   */
  static #validateFinishes(finishes, basePrice) {
    if (finishes == null) return Object.freeze([]);
    ensure(Array.isArray(finishes), "Lista de acabamentos inválida.", "INVALID_FINISH");
    ensure(finishes.length <= MAX_FINISHES, `Produto aceita no máximo ${MAX_FINISHES} acabamentos.`, "INVALID_FINISH");
    const names = new Set();
    for (const finish of finishes) {
      ensure(finish instanceof Finish, "Acabamento inválido.", "INVALID_FINISH");
      ensure(!names.has(finish.name), `Acabamento repetido: ${finish.name}`, "INVALID_FINISH");
      ensure(basePrice.add(finish.surcharge).isPositive(), `Preço final do acabamento "${finish.name}" deve ser positivo.`, "INVALID_PRICE");
      names.add(finish.name);
    }
    return Object.freeze([...finishes]);
  }

  /** @param {unknown} sizes */
  static #validateSizes(sizes) {
    if (sizes == null) return null;
    ensure(Array.isArray(sizes) && sizes.length >= 1, "Lista de tamanhos inválida.", "INVALID_SIZE");
    ensure(sizes.length <= MAX_SIZES, `Produto aceita no máximo ${MAX_SIZES} tamanhos.`, "INVALID_SIZE");
    const clean = sizes.map((size) => safeText(size, { field: "Tamanho", max: 12, noMarkup: true }));
    ensure(new Set(clean).size === clean.length, "Tamanhos repetidos.", "INVALID_SIZE");
    return Object.freeze(clean);
  }

  get id() {
    return this.#id.value;
  }

  get sku() {
    return this.#sku.value;
  }

  get name() {
    return this.#name;
  }

  get category() {
    return this.#category;
  }

  get badge() {
    return this.#badge;
  }

  get basePrice() {
    return this.#basePrice;
  }

  get summary() {
    return this.#summary;
  }

  get description() {
    return this.#description;
  }

  get image() {
    return this.#image.path;
  }

  /** @returns {readonly Finish[]} */
  get finishes() {
    return this.#finishes;
  }

  /** @returns {Finish | null} null quando a peça não tem variações */
  get defaultFinish() {
    return this.#finishes[0] ?? null;
  }

  get hasFinishes() {
    return this.#finishes.length > 0;
  }

  /** @returns {readonly string[] | null} */
  get sizes() {
    return this.#sizes;
  }

  get sizeLabel() {
    return this.#sizeLabel;
  }

  get hasSizes() {
    return this.#sizes !== null;
  }

  /** @param {Category} category */
  belongsTo(category) {
    return this.#category.equals(category);
  }

  /** @param {unknown} name */
  findFinish(name) {
    return this.#finishes.find((finish) => finish.name === name) ?? null;
  }

  /** @param {Finish} finish */
  offers(finish) {
    return this.#finishes.some((own) => own.equals(finish));
  }

  /** @param {unknown} size */
  acceptsSize(size) {
    return this.#sizes !== null && typeof size === "string" && this.#sizes.includes(size);
  }

  /**
   * Preço final. Sem acabamento (null), vale o preço base — permitido
   * apenas para peças sem variações.
   * @param {Finish | null} finish
   */
  priceWith(finish) {
    if (finish === null) {
      ensure(!this.hasFinishes, "Escolha um acabamento para esta peça.", "INVALID_FINISH");
      return this.#basePrice;
    }
    ensure(this.offers(finish), "Acabamento indisponível para esta peça.", "INVALID_FINISH");
    return this.#basePrice.add(finish.surcharge);
  }
}
