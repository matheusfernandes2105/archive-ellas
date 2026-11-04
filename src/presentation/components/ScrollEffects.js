/** Animação de entrada ao rolar e destaque do link do menu da seção visível. */
export function initScrollEffects() {
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    for (const node of reveals) node.classList.add("is-visible");
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );
  for (const node of reveals) revealObserver.observe(node);

  const links = /** @type {HTMLAnchorElement[]} */ ([...document.querySelectorAll("[data-nav-link]")]);
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) {
          link.classList.toggle("is-current", link.hash === `#${entry.target.id}`);
        }
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  for (const link of links) {
    const target = link.hash ? document.getElementById(link.hash.slice(1)) : null;
    if (target) sectionObserver.observe(target);
  }
}
