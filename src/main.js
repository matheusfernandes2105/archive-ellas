/**
 * Composition root: o único lugar que conhece todas as camadas e as conecta.
 *
 *   presentation  →  application  →  domain
 *        ↑                ↑
 *        └── infrastructure (implementa as portas do domínio/aplicação)
 */
import { GetProductDetails } from "./application/GetProductDetails.js";
import { ALL_CATEGORIES, ListCatalog } from "./application/ListCatalog.js";
import { StartConversation } from "./application/StartConversation.js";
import { StartPurchase } from "./application/StartPurchase.js";
import { StaticProductRepository } from "./infrastructure/catalog/StaticProductRepository.js";
import { productsData } from "./infrastructure/catalog/products.data.js";
import { loadStoreConfig } from "./infrastructure/config/loadStoreConfig.js";
import { storeConfig } from "./infrastructure/config/store.config.js";
import { WhatsAppGateway } from "./infrastructure/messaging/WhatsAppGateway.js";
import { CatalogSection, renderCatalogUnavailable } from "./presentation/components/CatalogSection.js";
import { ProductDialog } from "./presentation/components/ProductDialog.js";
import { initScrollEffects } from "./presentation/components/ScrollEffects.js";
import { initSiteHeader } from "./presentation/components/SiteHeader.js";
import { applyStaticLinks } from "./presentation/components/StaticLinks.js";
import { required } from "./presentation/dom.js";

/** Defesa contra clickjacking em hospedagens sem cabeçalho de segurança (ex. GitHub Pages). */
function guardAgainstFraming() {
  if (window.top === window.self) return true;
  document.documentElement.classList.add("is-framed");
  return false;
}

/** @param {unknown} error */
function report(error) {
  console.error("[ELLAS]", error instanceof Error ? `${error.name}: ${error.message}` : error);
}

async function bootstrap() {
  document.documentElement.classList.add("js");
  if (!guardAgainstFraming()) return;

  initSiteHeader(required(document, "[data-header]"));
  initScrollEffects();

  const grid = /** @type {HTMLElement} */ (required(document, "[data-product-grid]"));
  const filters = /** @type {HTMLElement} */ (required(document, "[data-filters]"));

  let config;
  try {
    config = loadStoreConfig(storeConfig);
  } catch (error) {
    report(error);
    applyStaticLinks({ whatsappUrl: null, instagramUrl: null, spotifyUrl: null });
    renderCatalogUnavailable(grid);
    return;
  }

  const messagingGateway = new WhatsAppGateway(config.whatsapp);
  const startConversation = new StartConversation({ messagingGateway });
  applyStaticLinks({
    whatsappUrl: startConversation.execute(),
    instagramUrl: config.instagramUrl,
    spotifyUrl: config.spotifyUrl,
  });

  try {
    const productRepository = new StaticProductRepository(productsData);
    const installments = config.installments;
    const startPurchase = new StartPurchase({ productRepository, messagingGateway });

    const dialog = new ProductDialog({
      dialog: /** @type {HTMLDialogElement} */ (required(document, "[data-dialog]")),
      getProductDetails: new GetProductDetails({ productRepository, installments }),
      startPurchase,
    });

    const catalog = new CatalogSection({
      grid,
      filters,
      listCatalog: new ListCatalog({ productRepository, installments }),
      startPurchase,
      onOpenProduct: (productId) => dialog.open(productId).catch(report),
    });
    await catalog.render(ALL_CATEGORIES);
  } catch (error) {
    report(error);
    renderCatalogUnavailable(grid);
  }
}

bootstrap().catch(report);
