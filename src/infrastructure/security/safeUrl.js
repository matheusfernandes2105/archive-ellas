import { ConfigurationError } from "../config/ConfigurationError.js";

/**
 * Valida um link externo: precisa ser https, sem usuário/senha embutidos,
 * sem porta customizada e com o domínio exato numa lista permitida.
 * Bloqueia "javascript:", "data:", http e domínios parecidos (ex. instagram.com.evil.io).
 *
 * @param {unknown} value
 * @param {{ allowedHosts: readonly string[], field: string }} rules
 * @returns {string} URL normalizada
 */
export function parseSafeExternalUrl(value, { allowedHosts, field }) {
  if (typeof value !== "string" || value.length > 2048) {
    throw new ConfigurationError(`${field}: link inválido.`, "INVALID_URL");
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ConfigurationError(`${field}: link inválido.`, "INVALID_URL");
  }

  if (url.protocol !== "https:") throw new ConfigurationError(`${field}: o link precisa usar https.`, "INVALID_URL");
  if (url.username || url.password) throw new ConfigurationError(`${field}: o link não pode conter usuário ou senha.`, "INVALID_URL");
  if (url.port) throw new ConfigurationError(`${field}: o link não pode ter porta.`, "INVALID_URL");
  if (!allowedHosts.includes(url.hostname)) {
    throw new ConfigurationError(`${field}: domínio não permitido (${url.hostname}).`, "INVALID_URL");
  }
  return url.href;
}
