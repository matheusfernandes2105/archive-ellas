import assert from "node:assert/strict";
import { test } from "node:test";
import { WhatsAppNumber } from "../../src/domain/contact/WhatsAppNumber.js";
import { PurchaseIntent } from "../../src/domain/purchase/PurchaseIntent.js";
import { PurchaseMessage } from "../../src/domain/purchase/PurchaseMessage.js";
import { toDomain } from "../../src/infrastructure/catalog/ProductMapper.js";
import { rawProduct } from "../helpers.js";

test("monta a mensagem com peça, acabamento, tamanho e valor", () => {
  const product = toDomain(rawProduct());
  const intent = PurchaseIntent.create({ product, finishName: "Banho de ouro 18k", size: "16" });
  const { text } = PurchaseMessage.forPurchase(intent);

  assert.match(text, /^Olá, ELLAS!/);
  assert.ok(text.includes("*Anel Teste* (EL-99)"));
  assert.ok(text.includes("Acabamento: Banho de ouro 18k"));
  assert.ok(text.includes("Tamanho: 16"));
  assert.ok(text.includes("Valor: R$ 309,00"));
});

test("sem tamanho escolhido, pede ajuda; sem tamanhos na peça, omite a linha", () => {
  const withSizes = PurchaseIntent.create({ product: toDomain(rawProduct()) });
  assert.ok(PurchaseMessage.forPurchase(withSizes).text.includes("Tamanho: preciso de ajuda para escolher"));

  const withoutSizes = PurchaseIntent.create({ product: toDomain(rawProduct({ tamanhos: undefined })) });
  assert.equal(PurchaseMessage.forPurchase(withoutSizes).text.includes("Tamanho"), false);
});

test("usa o rótulo de tamanho da peça", () => {
  const product = toDomain(rawProduct({ tamanhos: ["45 cm"], rotuloTamanho: "Comprimento" }));
  const intent = PurchaseIntent.create({ product, size: "45 cm" });
  assert.ok(PurchaseMessage.forPurchase(intent).text.includes("Comprimento: 45 cm"));
});

test("recusa acabamento ou tamanho que a peça não oferece", () => {
  const product = toDomain(rawProduct());
  assert.throws(() => PurchaseIntent.create({ product, finishName: "Ouro maciço" }), { code: "INVALID_FINISH" });
  assert.throws(() => PurchaseIntent.create({ product, size: "99" }), { code: "INVALID_SIZE" });
  assert.throws(() => PurchaseIntent.create({ product, size: "16\nValor: R$ 1,00" }), { code: "INVALID_SIZE" });
});

test("valida o número de WhatsApp", () => {
  assert.equal(WhatsAppNumber.parse("+55 (92) 99999-0000").digits, "5592999990000");
  for (const raw of ["", "123", "0055929999900", "55929999abc", "5592999990000?text=oi", 5592999990000]) {
    assert.throws(() => WhatsAppNumber.parse(/** @type {any} */ (raw)), { code: "INVALID_WHATSAPP" }, String(raw));
  }
});
