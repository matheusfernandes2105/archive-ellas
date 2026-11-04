import { setSafeHref } from "../dom.js";

/**
 * Preenche os links fixos da página (WhatsApp geral, Instagram, Spotify) e o ano.
 * @param {{ whatsappUrl: string | null, instagramUrl: string | null, spotifyUrl: string | null }} links
 */
export function applyStaticLinks({ whatsappUrl, instagramUrl, spotifyUrl }) {
  /** @param {string} selector @param {string | null} url */
  const fill = (selector, url) => {
    for (const anchor of /** @type {NodeListOf<HTMLAnchorElement>} */ (document.querySelectorAll(selector))) {
      if (url) {
        setSafeHref(anchor, url);
      } else {
        // Configuração inválida: o link não leva a lugar nenhum.
        anchor.removeAttribute("href");
        anchor.setAttribute("aria-disabled", "true");
      }
    }
  };
  fill("[data-wa-generic]", whatsappUrl);
  fill("[data-instagram]", instagramUrl);
  fill("[data-spotify]", spotifyUrl);

  for (const node of document.querySelectorAll("[data-year]")) {
    node.textContent = String(new Date().getFullYear());
  }
}
