import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { WhatsAppNumber } from "../../src/domain/contact/WhatsAppNumber.js";
import { PurchaseIntent } from "../../src/domain/purchase/PurchaseIntent.js";
import { PurchaseMessage } from "../../src/domain/purchase/PurchaseMessage.js";
import { StaticProductRepository } from "../../src/infrastructure/catalog/StaticProductRepository.js";
import { productsData } from "../../src/infrastructure/catalog/products.data.js";
import { ConfigurationError } from "../../src/infrastructure/config/ConfigurationError.js";
import { loadStoreConfig } from "../../src/infrastructure/config/loadStoreConfig.js";
import { storeConfig } from "../../src/infrastructure/config/store.config.js";
import { WhatsAppGateway } from "../../src/infrastructure/messaging/WhatsAppGateway.js";
import { rawProduct } from "../helpers.js";

test("o catálogo real e a configuração real são válidos", async () => {
  const repository = new StaticProductRepository(productsData);
  assert.equal((await repository.findAll()).length, productsData.length);
  assert.ok(loadStoreConfig(storeConfig));
});

test("toda foto do catálogo existe, com a versão leve de 640px para o celular", () => {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  for (const product of productsData) {
    assert.ok(existsSync(join(root, product.imagem)), `foto ausente: ${product.imagem}`);
    if (product.imagem.endsWith(".webp")) {
      const small = product.imagem.replace(/\.webp$/, "-640.webp");
      assert.ok(existsSync(join(root, small)), `versão de 640px ausente: ${small}`);
    }
  }
});

test("o repositório recusa ids e SKUs repetidos", () => {
  assert.throws(() => new StaticProductRepository([rawProduct(), rawProduct({ sku: "EL-98" })]), {
    code: "DUPLICATE_PRODUCT",
  });
  assert.throws(() => new StaticProductRepository([rawProduct(), rawProduct({ id: "outro" })]), {
    code: "DUPLICATE_SKU",
  });
});

test("o link do WhatsApp codifica todo o texto e não pode ser desviado", async () => {
  const gateway = new WhatsAppGateway(WhatsAppNumber.parse("5592999990000"));
  const [product] = await new StaticProductRepository([
    rawProduct({ nome: "Anel & Cia #1 ?x=1" }),
  ]).findAll();
  const url = new URL(gateway.conversationLinkFor(PurchaseMessage.forPurchase(PurchaseIntent.create({ product }))));

  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/5592999990000");
  assert.deepEqual([...url.searchParams.keys()], ["text"]);
  assert.equal(url.hash, "");
  assert.ok(url.searchParams.get("text")?.includes("*Anel & Cia #1 ?x=1*"));
});

test("a configuração só aceita links https dos domínios permitidos", () => {
  const base = { ...storeConfig };
  const bad = [
    { instagram: "http://www.instagram.com/" },
    { instagram: "javascript:alert(1)" },
    { instagram: "https://instagram.com.evil.io/" },
    { instagram: "https://user:pass@www.instagram.com/" },
    { instagram: "https://www.instagram.com:8443/" },
    { spotify: "https://evil.example/playlist" },
    { parcelas: 0 },
    { parcelas: 2.5 },
  ];
  for (const override of bad) {
    assert.throws(() => loadStoreConfig({ ...base, ...override }), ConfigurationError, JSON.stringify(override));
  }
  assert.throws(() => loadStoreConfig({ ...base, whatsapp: "abc" }), { code: "INVALID_WHATSAPP" });
});
