import { required } from "../dom.js";

/** Abaixo desta largura o cabeçalho some ao rolar para baixo (ganha espaço no celular). */
const AUTO_HIDE = window.matchMedia("(max-width: 899.98px)");
const SCROLL_DELTA = 8;

/**
 * Cabeçalho: estado ao rolar, auto-esconder no celular e menu mobile.
 * @param {HTMLElement} header
 */
export function initSiteHeader(header) {
  const toggle = /** @type {HTMLButtonElement} */ (required(header, "[data-menu-toggle]"));
  const toggleLabel = required(toggle, ".sr-only");
  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);

    const delta = y - lastY;
    if (!AUTO_HIDE.matches || header.classList.contains("nav-open") || y < 120) {
      header.classList.remove("is-hidden");
    } else if (delta > SCROLL_DELTA) {
      header.classList.add("is-hidden"); // rolando para baixo
    } else if (delta < -SCROLL_DELTA) {
      header.classList.remove("is-hidden"); // rolando para cima
    }
    if (Math.abs(delta) > SCROLL_DELTA) lastY = y;
  };
  update();
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  // Navegação por teclado sempre encontra o cabeçalho visível.
  header.addEventListener("focusin", () => header.classList.remove("is-hidden"));

  const close = () => {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Abrir menu";
    document.body.classList.remove("no-scroll");
  };
  const open = () => {
    header.classList.remove("is-hidden");
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
