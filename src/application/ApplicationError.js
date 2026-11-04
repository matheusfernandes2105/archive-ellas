/** Erro de caso de uso (ex.: produto não encontrado, filtro inválido). */
export class ApplicationError extends Error {
  /**
   * @param {string} message
   * @param {string} code
   */
  constructor(message, code) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
  }
}
