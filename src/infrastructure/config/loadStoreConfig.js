import { WhatsAppNumber } from "../../domain/contact/WhatsAppNumber.js";
import { parseSafeExternalUrl } from "../security/safeUrl.js";
import { ConfigurationError } from "./ConfigurationError.js";

const ALLOWED_HOSTS = Object.freeze({
  instagram: Object.freeze(["instagram.com", "www.instagram.com"]),
  spotify: Object.freeze(["open.spotify.com"]),
});

/** @param {unknown} value */
function parseInstallments(value) {
  if (!Number.isInteger(value) || /** @type {number} */ (value) < 1 || /** @type {number} */ (value) > 12) {
    throw new ConfigurationError("parcelas: use um número inteiro de 1 a 12.", "INVALID_INSTALLMENTS");
  }
  return /** @type {number} */ (value);
}

/**
 * Valida a configuração bruta e devolve uma versão congelada e segura.
 * @param {Record<string, unknown>} raw
 */
export function loadStoreConfig(raw) {
  if (raw === null || typeof raw !== "object") throw new ConfigurationError("Configuração ausente.");

  return Object.freeze({
    whatsapp: WhatsAppNumber.parse(raw.whatsapp),
    instagramUrl: parseSafeExternalUrl(raw.instagram, { field: "instagram", allowedHosts: ALLOWED_HOSTS.instagram }),
    spotifyUrl: parseSafeExternalUrl(raw.spotify, { field: "spotify", allowedHosts: ALLOWED_HOSTS.spotify }),
    installments: parseInstallments(raw.parcelas),
  });
}
