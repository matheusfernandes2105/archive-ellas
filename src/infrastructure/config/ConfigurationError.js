/** Configuração da loja inválida (link fora da lista permitida, número errado etc.). */
export class ConfigurationError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message, code = "INVALID_CONFIG") {
    super(message);
    this.name = "ConfigurationError";
    this.code = code;
  }
}
