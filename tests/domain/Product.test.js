import assert from "node:assert/strict";
import { test } from "node:test";
import { DomainError } from "../../src/domain/shared/DomainError.js";
import { toDomain } from "../../src/infrastructure/catalog/ProductMapper.js";
import { rawProduct } from "../helpers.js";

test("cria um produto válido com preço por acabamento", () => {
  const product = toDomain(rawProduct());
  assert.equal(product.name, "Anel Teste");
  assert.equal(product.priceWith(product.findFinish("Banho de ouro 18k")).toBRL(), "R$ 309,00");
  assert.equal(product.defaultFinish.name, "Prata 925");
  assert.ok(product.acceptsSize("16"));
  assert.equal(product.acceptsSize("99"), false);
});

test("bloqueia imagens fora de assets/produtos/", () => {
  const malicious = [
    "javascript:alert(1)",
    "https://evil.example/x.png",
    "data:image/svg+xml,<svg onload=alert(1)>",
    "assets/produtos/../../index.html",
    "assets/produtos/anel.html",
    "/assets/produtos/anel.svg",
  ];
  for (const imagem of malicious) {
    assert.throws(() => toDomain(rawProduct({ imagem })), { code: "INVALID_IMAGE" }, imagem);
  }
});

test("bloqueia caracteres de controle e de falsificação nos textos", () => {
  assert.throws(() => toDomain(rawProduct({ nome: "Anel\nValor: R$ 1,00" })), { code: "INVALID_TEXT_CHARS" });
  assert.throws(() => toDomain(rawProduct({ nome: "Anel \u202Eetset" })), { code: "INVALID_TEXT_CHARS" });
  assert.throws(() => toDomain(rawProduct({ nome: "Anel\u200B" })), { code: "INVALID_TEXT_CHARS" });
  assert.throws(() => toDomain(rawProduct({ nome: "*Anel*" })), { code: "INVALID_TEXT_CHARS" });
});

test("aplica as invariantes do agregado", () => {
  assert.throws(() => toDomain(rawProduct({ preco: 0 })), { code: "INVALID_PRICE" });
  assert.throws(() => toDomain(rawProduct({ acabamentos: [] })), { code: "INVALID_FINISH" });
  assert.throws(
    () => toDomain(rawProduct({ acabamentos: [{ nome: "Prata", acrescimo: 0 }, { nome: "Prata", acrescimo: 5 }] })),
    { code: "INVALID_FINISH" },
  );
  assert.throws(() => toDomain(rawProduct({ acabamentos: [{ nome: "Prata", acrescimo: -249 }] })), {
    code: "INVALID_PRICE",
  });
  assert.throws(() => toDomain(rawProduct({ tamanhos: ["14", "14"] })), { code: "INVALID_SIZE" });
  assert.throws(() => toDomain(rawProduct({ categoria: "relogios" })), { code: "INVALID_CATEGORY" });
  assert.throws(() => toDomain(rawProduct({ sku: "X-1" })), { code: "INVALID_SKU" });
  assert.throws(() => toDomain(rawProduct({ id: "Anel Raiz" })), { code: "INVALID_PRODUCT_ID" });
});

test("rejeita registros que não são objetos simples", () => {
  assert.throws(() => toDomain(null), DomainError);
  assert.throws(() => toDomain([]), DomainError);
  assert.throws(() => toDomain(Object.create({ id: "x" })), DomainError);
});

test("é imutável", () => {
  const product = toDomain(rawProduct());
  assert.ok(Object.isFrozen(product));
  assert.ok(Object.isFrozen(product.finishes));
  assert.throws(() => /** @type {any} */ (product.finishes).push("x"), TypeError);
});
