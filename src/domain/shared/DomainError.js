/**
 * Erro de regra de negócio. Toda violação de invariante do domínio lança
 * este erro, com um código estável que pode ser tratado pelas camadas de fora.
 */
export class DomainError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message, code = "DOMAIN_ERROR") {
    super(message);
    this.name = "DomainError";
    this.code = code;
  }
}

/**
 * Garante uma invariante do domínio.
 * @param {unknown} condition
 * @param {string} message
 * @param {string} [code]
 * @returns {asserts condition}
 */
export function ensure(condition, message, code) {
  if (!condition) throw new DomainError(message, code);
}
