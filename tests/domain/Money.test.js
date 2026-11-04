import assert from "node:assert/strict";
import { test } from "node:test";
import { DomainError } from "../../src/domain/shared/DomainError.js";
import { Money } from "../../src/domain/shared/Money.js";

test("formata em reais no padrão brasileiro", () => {
  assert.equal(Money.fromReais(249).toBRL(), "R$ 249,00");
  assert.equal(Money.fromReais(1249.9).toBRL(), "R$ 1.249,90");
  assert.equal(Money.fromReais(-20).toBRL(), "-R$ 20,00");
});

test("guarda centavos inteiros, sem erro de ponto flutuante", () => {
  assert.equal(Money.fromReais(0.1).add(Money.fromReais(0.2)).cents, 30);
});

test("parcela arredondando para cima no centavo", () => {
  assert.equal(Money.fromReais(389).installment(3).toBRL(), "R$ 129,67");
  assert.equal(Money.fromReais(249).installment(3).toBRL(), "R$ 83,00");
});

test("rejeita valores inválidos", () => {
  for (const value of [Number.NaN, Infinity, "10", 10.123]) {
    assert.throws(() => Money.fromReais(/** @type {any} */ (value)), DomainError);
  }
  assert.throws(() => Money.fromCents(1.5), DomainError);
  assert.throws(() => Money.fromCents(100_000_001), DomainError);
  assert.throws(() => Money.fromReais(10).installment(0), DomainError);
  assert.throws(() => Money.zero().installment(3), DomainError);
});

test("é imutável", () => {
  const money = Money.fromReais(10);
  assert.ok(Object.isFrozen(money));
});
