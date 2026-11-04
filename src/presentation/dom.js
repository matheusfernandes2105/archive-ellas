/**
 * Utilitários de DOM seguros.
 *
 * Regras:
 * - texto entra sempre via textContent (nunca innerHTML);
 * - só atributos de uma lista permitida (nada de on*, style, srcdoc...);
 * - href/src só aceitam âncoras locais, caminhos de assets ou https.
 * O site também roda com Trusted Types obrigatório na CSP, que bloqueia
 * qualquer uso de innerHTML no navegador.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

const ALLOWED_ATTRIBUTES = new Set([
  "class", "id", "type", "name", "value", "for", "role", "hidden",
  "href", "target", "rel", "src", "alt", "width", "height", "loading", "decoding",
  "aria-label", "aria-pressed", "aria-hidden", "aria-live",
  "data-categoria", "data-product-id",
]);

const LOCAL_ASSET = /^assets\/[a-z0-9/_-]+\.(?:svg|png|jpe?g|webp|avif)$/;

/** @param {string} value */
export function isSafeUrl(value) {
  if (value.startsWith("#")) return /^#[a-z0-9-]*$/i.test(value);
  if (LOCAL_ASSET.test(value)) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Cria um elemento HTML.
 * @param {string} tag
 * @param {{ attrs?: Record<string, string | number | boolean | null | undefined>, text?: string, children?: (Node | null | undefined | false)[] }} [options]
 */
export function el(tag, { attrs = {}, text, children = [] } = {}) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (!ALLOWED_ATTRIBUTES.has(name)) throw new Error(`Atributo não permitido: ${name}`);
    const str = value === true ? "" : String(value);
    if ((name === "href" || name === "src") && !isSafeUrl(str)) throw new Error(`URL não permitida em ${name}.`);
    node.setAttribute(name, str);
  }
  if (text != null) node.textContent = text;
  for (const child of children) if (child) node.append(child);
  return node;
}

/**
 * Ícone do sprite SVG do index.html (ex. icon("wa") → #i-wa).
 * @param {string} name
 */
export function icon(name) {
  if (!/^[a-z-]+$/.test(name)) throw new Error("Nome de ícone inválido.");
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS(SVG_NS, "use");
  use.setAttribute("href", `#i-${name}`);
  svg.append(use);
  return svg;
}

/**
 * Define um link com URL validada.
 * @param {HTMLAnchorElement} anchor
 * @param {string} url
 */
export function setSafeHref(anchor, url) {
  if (!isSafeUrl(url)) throw new Error("URL não permitida.");
  anchor.href = url;
  if (anchor.target === "_blank") anchor.rel = "noopener noreferrer";
}

/**
 * @template {Element} T
 * @param {ParentNode} root
 * @param {string} selector
 * @returns {T}
 */
export function required(root, selector) {
  const found = root.querySelector(selector);
  if (!found) throw new Error(`Elemento não encontrado: ${selector}`);
  return /** @type {T} */ (found);
}
