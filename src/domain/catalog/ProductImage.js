import { ensure } from "../shared/DomainError.js";

/**
 * Só aceita imagens locais da pasta de produtos, com nome em slug e extensão de imagem.
 * Bloqueia URLs externas, "javascript:", "data:", "../" e qualquer outro caminho.
 */
const IMAGE_PATH = /^assets\/produtos\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:svg|png|jpe?g|webp|avif)$/;

/** Caminho da imagem do produto (objeto de valor). */
export class ProductImage {
  #path;

  /** @param {unknown} path */
  constructor(path) {
    ensure(
      typeof path === "string" && IMAGE_PATH.test(path),
      "Imagem do produto deve estar em assets/produtos/ (svg, png, jpg, webp ou avif).",
      "INVALID_IMAGE",
    );
    this.#path = path;
    Object.freeze(this);
  }

  /** @param {unknown} path */
  static from(path) {
    return new ProductImage(path);
  }

  get path() {
    return this.#path;
  }
}
