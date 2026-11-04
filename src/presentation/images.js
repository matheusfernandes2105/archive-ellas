/**
 * Imagens responsivas dos produtos.
 *
 * Convenção: cada foto "nome.webp" (1200px) tem uma versão leve "nome-640.webp".
 * O navegador escolhe a menor que atende à tela — o celular baixa ~50 KB por
 * foto em vez de ~150 KB. Outros formatos são usados como estão.
 */

const WEBP = /\.webp$/;

/** Larguras em que a foto aparece, para o navegador escolher o arquivo certo. */
export const SIZES = Object.freeze({
  card: "(max-width: 699px) 46vw, (max-width: 999px) 45vw, 380px",
  dialog: "(max-width: 699px) 100vw, (max-width: 799px) 94vw, 480px",
});

/**
 * @param {string} path caminho já validado pelo domínio (ProductImage)
 * @returns {{ src: string, srcset: string | null }}
 */
export function productImageSources(path) {
  if (!WEBP.test(path)) return { src: path, srcset: null };
  const small = path.replace(WEBP, "-640.webp");
  return { src: path, srcset: `${small} 640w, ${path} 1200w` };
}
