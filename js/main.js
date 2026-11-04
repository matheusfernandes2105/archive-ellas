(function () {
  "use strict";

  var config = window.ELLAS_CONFIG || {};
  var products = window.ELLAS_PRODUCTS || [];

  document.documentElement.classList.add("js");

  var CATEGORIAS = {
    aneis: "Anéis",
    brincos: "Brincos",
    colares: "Colares",
    pulseiras: "Pulseiras",
  };

  var moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  function formatarPreco(valor) {
    // Troca o espaço não separável por espaço comum (fica melhor no WhatsApp).
    return moeda.format(valor).replace(/ /g, " ");
  }

  function parcelamento(valor) {
    var n = config.parcelas || 0;
    if (n < 2) return "";
    return "ou " + n + "x de " + formatarPreco(valor / n) + " sem juros";
  }

  /* ---------------- WhatsApp ---------------- */

  function linkWhatsApp(mensagem) {
    var numero = String(config.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensagem);
  }

  function mensagemProduto(produto, escolha) {
    var acabamento = escolha.acabamento || produto.acabamentos[0];
    var valor = produto.preco + (acabamento.acrescimo || 0);
    var linhas = [
      "Olá, ELLAS! Vi no site e quero comprar esta peça:",
      "",
      "*" + produto.nome + "* (" + produto.sku + ")",
      "Acabamento: " + acabamento.nome,
    ];
    if (produto.tamanhos) {
      var rotulo = produto.rotuloTamanho || "Tamanho";
      linhas.push(rotulo + ": " + (escolha.tamanho || "preciso de ajuda para escolher"));
    }
    linhas.push("Valor: " + formatarPreco(valor));
    linhas.push("");
    linhas.push("Ainda está disponível? Pode me passar as formas de pagamento e entrega?");
    return linhas.join("\n");
  }

  var MENSAGEM_GERAL =
    "Olá, ELLAS! Vim pelo site e gostaria de saber mais sobre as peças da primeira coleção.";

  document.querySelectorAll("[data-wa-generic]").forEach(function (a) {
    a.href = linkWhatsApp(MENSAGEM_GERAL);
  });
  document.querySelectorAll("[data-spotify]").forEach(function (a) {
    a.href = config.spotify || "#";
  });
  document.querySelectorAll("[data-instagram]").forEach(function (a) {
    a.href = config.instagram || "#";
  });
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------- Catálogo ---------------- */

  var grid = document.querySelector("[data-product-grid]");

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function cardProduto(p, i) {
    var media = el("button", {
      type: "button",
      class: "product-media",
      "aria-label": "Ver detalhes de " + p.nome,
    }, [
      p.selo ? el("span", { class: "product-tag", text: p.selo }) : null,
      el("img", {
        src: p.imagem,
        alt: p.nome + " — " + p.resumo,
        width: "800",
        height: "1000",
        loading: i < 3 ? "eager" : "lazy",
        decoding: "async",
      }),
    ]);
    media.addEventListener("click", function () { abrirProduto(p); });

    var detalhes = el("button", { type: "button", class: "btn btn-details", text: "Detalhes" });
    detalhes.addEventListener("click", function () { abrirProduto(p); });

    var comprar = el("a", {
      class: "btn btn-wa",
      href: linkWhatsApp(mensagemProduto(p, {})),
      target: "_blank",
      rel: "noopener",
      "aria-label": "Comprar " + p.nome + " pelo WhatsApp",
      html: '<svg class="icon" aria-hidden="true"><use href="#i-wa"/></svg> Comprar',
    });

    var li = el("li", {
      class: "product-card",
      "data-categoria": p.categoria,
      style: "animation-delay:" + (i % 3) * 80 + "ms",
    }, [
      media,
      el("div", { class: "product-body" }, [
        el("div", { class: "product-top" }, [
          el("h3", { class: "product-name", text: p.nome }),
          el("span", { class: "product-price", text: formatarPreco(p.preco) }),
        ]),
        el("p", { class: "product-summary", text: p.resumo }),
        el("p", { class: "product-install", text: parcelamento(p.preco) }),
        el("div", { class: "product-actions" }, [comprar, detalhes]),
      ]),
    ]);
    return li;
  }

  function renderizar(filtro) {
    if (!grid) return;
    grid.innerHTML = "";
    var lista = products.filter(function (p) {
      return filtro === "todas" || p.categoria === filtro;
    });
    if (!lista.length) {
      grid.appendChild(el("li", { class: "empty-state", text: "Em breve, novas peças nesta categoria." }));
      return;
    }
    lista.forEach(function (p, i) { grid.appendChild(cardProduto(p, i)); });
  }

  renderizar("todas");

  document.querySelectorAll("[data-filter]").forEach(function (chip, _i, chips) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) {
        var ativo = c === chip;
        c.classList.toggle("is-active", ativo);
        c.setAttribute("aria-pressed", String(ativo));
      });
      renderizar(chip.getAttribute("data-filter"));
    });
  });

  /* ---------------- Modal do produto ---------------- */

  var dialog = document.querySelector("[data-dialog]");
  var $ = function (sel) { return dialog.querySelector(sel); };
  var atual = null;
  var escolha = {};

  function opcoes(container, nome, valores, rotulo, aoMudar) {
    container.innerHTML = "";
    valores.forEach(function (v, i) {
      var id = "opt-" + nome + "-" + i;
      var input = el("input", { type: "radio", name: nome, id: id, value: String(i) });
      var label = el("label", { for: id, text: rotulo(v) });
      input.addEventListener("change", function () { aoMudar(v); });
      container.appendChild(input);
      container.appendChild(label);
    });
  }

  function atualizarModal() {
    var acab = escolha.acabamento || atual.acabamentos[0];
    var valor = atual.preco + (acab.acrescimo || 0);
    $("[data-d-price]").textContent = formatarPreco(valor);
    $("[data-d-install]").textContent = parcelamento(valor);
    $("[data-d-buy]").href = linkWhatsApp(mensagemProduto(atual, escolha));
  }

  function abrirProduto(p) {
    if (!dialog) return;
    atual = p;
    escolha = { acabamento: p.acabamentos[0], tamanho: null };

    var img = $("[data-d-img]");
    img.src = p.imagem;
    img.alt = p.nome + " — " + p.resumo;
    $("[data-d-cat]").textContent = CATEGORIAS[p.categoria] || "";
    $("[data-d-name]").textContent = p.nome;
    $("[data-d-desc]").textContent = p.descricao;
    $("[data-d-sku]").textContent = "Código " + p.sku;

    opcoes($("[data-d-finishes]"), "acabamento", p.acabamentos, function (a) { return a.nome; }, function (a) {
      escolha.acabamento = a;
      atualizarModal();
    });
    $("[data-d-finishes] input").checked = true;
    $("[data-d-finish-group]").hidden = p.acabamentos.length < 2;

    var grupoTam = $("[data-d-size-group]");
    if (p.tamanhos) {
      grupoTam.hidden = false;
      $("[data-d-size-label]").textContent = p.rotuloTamanho || "Tamanho";
      opcoes($("[data-d-sizes]"), "tamanho", p.tamanhos, function (t) { return t; }, function (t) {
        escolha.tamanho = t;
        atualizarModal();
      });
    } else {
      grupoTam.hidden = true;
    }

    atualizarModal();
    dialog.showModal();
    document.body.classList.add("no-scroll");
  }

  if (dialog) {
    dialog.addEventListener("close", function () { document.body.classList.remove("no-scroll"); });
    $("[data-dialog-close]").addEventListener("click", function () { dialog.close(); });
    // Fecha ao clicar fora do conteúdo
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------------- Cabeçalho e menu ---------------- */

  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-menu-toggle]");

  function aoRolar() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  aoRolar();
  window.addEventListener("scroll", aoRolar, { passive: true });

  function fecharMenu() {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".sr-only").textContent = "Abrir menu";
    document.body.classList.remove("no-scroll");
  }

  toggle.addEventListener("click", function () {
    var abrir = !header.classList.contains("nav-open");
    if (!abrir) return fecharMenu();
    header.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.querySelector(".sr-only").textContent = "Fechar menu";
    document.body.classList.add("no-scroll");
  });

  document.querySelectorAll(".main-nav a").forEach(function (a) {
    a.addEventListener("click", fecharMenu);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("nav-open")) fecharMenu();
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", function (mq) {
    if (mq.matches) fecharMenu();
  });

  /* ---------------- Link ativo no menu ---------------- */

  var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
  if ("IntersectionObserver" in window) {
    var secoes = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle("is-current", l.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) {
      var alvo = document.querySelector(l.getAttribute("href"));
      if (alvo) secoes.observe(alvo);
    });

    /* ---------------- Revelar ao rolar ---------------- */
    var revelar = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revelar.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (n) { revelar.observe(n); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
  }
})();
