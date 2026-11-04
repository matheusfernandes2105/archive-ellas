import { required } from "../dom.js";

/**
 * Cabeçalho: estado ao rolar e menu mobile.
 * @param {HTMLElement} header
 */
export function initSiteHeader(header) {
  const toggle = /** @type {HTMLButtonElement} */ (required(header, "[data-menu-toggle]"));
  const toggleLabel = required(toggle, ".sr-only");

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const close = () => {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Abrir menu";
    document.body.classList.remove("no-scroll");
  };
  const open = () => {
    header.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = "Fechar menu";
    document.body.classList.add("no-scroll");
  };

  toggle.addEventListener("click", () => (header.classList.contains("nav-open") ? close() : open()));
  for (const link of header.querySelectorAll(".main-nav a")) link.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) close();
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (mq) => {
    if (mq.matches) close();
  });
}
