/**
 * Configurações da loja ELLAS — edite aqui.
 *
 * Tudo é validado ao carregar o site (ver loadStoreConfig.js). Um valor
 * inválido não chega à página: o site registra o erro no console e não gera links.
 */
export const storeConfig = Object.freeze({
  // Número no formato internacional: 55 + DDD + número (com ou sem formatação).
  // ATENÇÃO: número fictício — troque pelo WhatsApp real da loja.
  whatsapp: "5592900000000",

  // Só são aceitos links https destes domínios (ver loadStoreConfig.js).
  instagram: "https://www.instagram.com/",
  spotify: "https://open.spotify.com/playlist/3ny5pydRiXEcV7mpmJIcg1",

  // Parcelamento sem juros exibido nos produtos (1 = não exibir).
  parcelas: 3,
});
