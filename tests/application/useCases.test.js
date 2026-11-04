import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../src/application/ApplicationError.js";
import { GetProductDetails } from "../../src/application/GetProductDetails.js";
import { ListCatalog } from "../../src/application/ListCatalog.js";
import { MessagingGateway } from "../../src/application/ports/MessagingGateway.js";
import { StartConversation } from "../../src/application/StartConversation.js";
import { StartPurchase } from "../../src/application/StartPurchase.js";
import { StaticProductRepository } from "../../src/infrastructure/catalog/StaticProductRepository.js";
import { rawProduct } from "../helpers.js";

/** Gateway falso: devolve a mensagem para inspeção. */
class FakeGateway extends MessagingGateway {
  /** @param {import("../../src/domain/purchase/PurchaseMessage.js").PurchaseMessage} message */
  conversationLinkFor(message) {
    return `https://fake.test/?m=${encodeURIComponent(message.text)}`;
  }
}

const repository = () =>
  new StaticProductRepository([
    rawProduct(),
    rawProduct({ id: "brinco-teste", sku: "EL-98", nome: "Brinco Teste", categoria: "brincos", tamanhos: undefined }),
  ]);

test("ListCatalog lista e filtra por categoria, entregando DTOs congelados", async () => {
  const listCatalog = new ListCatalog({ productRepository: repository(), installments: 3 });

  const all = await listCatalog.execute();
  assert.equal(all.length, 2);
  assert.ok(Object.isFrozen(all[0]));
  assert.equal(all[0].price.label, "R$ 249,00");
  assert.deepEqual(all[0].price.installment, { count: 3, label: "R$ 83,00" });

  const brincos = await listCatalog.execute({ category: "brincos" });
  assert.deepEqual(brincos.map((view) => view.id), ["brinco-teste"]);

  await assert.rejects(listCatalog.execute({ category: "<script>" }), ApplicationError);
});

test("GetProductDetails valida o id e informa produto inexistente", async () => {
  const getDetails = new GetProductDetails({ productRepository: repository(), installments: 1 });
  const view = await getDetails.execute({ productId: "anel-teste" });
  assert.equal(view.finishes[1].price.label, "R$ 309,00");
  assert.equal(view.price.installment, null);

  await assert.rejects(getDetails.execute({ productId: "nao-existe" }), { code: "PRODUCT_NOT_FOUND" });
  await assert.rejects(getDetails.execute({ productId: "../../etc" }), { code: "INVALID_PRODUCT_ID" });
});

test("StartPurchase gera link com a escolha validada", async () => {
  const startPurchase = new StartPurchase({ productRepository: repository(), messagingGateway: new FakeGateway() });
  const result = await startPurchase.execute({ productId: "anel-teste", finishName: "Banho de ouro 18k", size: "14" });

  assert.equal(result.total, "R$ 309,00");
  const text = decodeURIComponent(new URL(result.url).searchParams.get("m") ?? "");
  assert.ok(text.includes("Tamanho: 14"));

  await assert.rejects(startPurchase.execute({ productId: "anel-teste", size: "99" }), { code: "INVALID_SIZE" });
});

test("StartConversation gera a mensagem geral", () => {
  const url = new StartConversation({ messagingGateway: new FakeGateway() }).execute();
  assert.ok(decodeURIComponent(url).includes("Olá, ELLAS! Vim pelo site"));
});
