/**
 * Botão flutuante do WhatsApp: só aparece quando nenhum outro botão de
 * WhatsApp está na tela, para não cobrir preços, cards e chamadas.
 *
 * @param {HTMLElement} button
 * @param {{ hideWhenVisible: readonly string[] }} options
 */
export function initFloatingContact(button, { hideWhenVisible }) {
  if (!("IntersectionObserver" in window)) return;

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      button.classList.toggle("is-hidden", visible.size > 0);
    },
    { threshold: 0.1 },
  );

  for (const selector of hideWhenVisible) {
    for (const node of document.querySelectorAll(selector)) observer.observe(node);
  }
}
