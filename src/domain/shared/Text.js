import { ensure } from "./DomainError.js";

/**
 * Caracteres proibidos em qualquer texto do domínio:
 * - controle (inclui quebras de linha, que poderiam forjar linhas na mensagem do WhatsApp);
 * - largura zero e marcas/overrides bidirecionais (usados para falsificar textos).
 */
const FORBIDDEN_CHARS = /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]/u;

/** Marcadores de formatação do WhatsApp: proibidos em campos que entram na mensagem. */
const WHATSAPP_MARKUP = /[*_~`]/;

/**
 * Valida e normaliza um texto do domínio.
 * @param {unknown} value
 * @param {{ field: string, min?: number, max: number, noMarkup?: boolean }} rules
 * @returns {string}
 */
export function safeText(value, { field, min = 1, max, noMarkup = false }) {
  ensure(typeof value === "string", `${field} deve ser um texto.`, "INVALID_TEXT");
  const text = value.normalize("NFC").trim();
  ensure(
    text.length >= min && text.length <= max,
    `${field} deve ter entre ${min} e ${max} caracteres.`,
    "INVALID_TEXT_LENGTH",
  );
  ensure(!FORBIDDEN_CHARS.test(text), `${field} contém caracteres não permitidos.`, "INVALID_TEXT_CHARS");
  if (noMarkup) {
    ensure(!WHATSAPP_MARKUP.test(text), `${field} não pode conter os caracteres * _ ~ \``, "INVALID_TEXT_CHARS");
  }
  return text;
}
