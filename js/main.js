/* Mens Space Barbearia — prévia Patron */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var WHATS = '5511958467699';
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // CONFIRMAR: serviços, preços e durações do app de agendamento (Booksy), consultados em 13/11/2026.
  // "mais: true" = preço "a partir de" (aparece com + no app).
  var GRUPOS = [
    { nome: 'Combos', itens: [
      { id: 'corte-barba', nome: 'Corte + barba', preco: 110, min: 60 },
      { id: 'corte-sobrancelha', nome: 'Corte + sobrancelha', preco: 75, min: 30 },
      { id: 'completo', nome: 'Cabelo + barba + sobrancelha', preco: 125, min: 60 }
    ] },
    { nome: 'Corte e barba', itens: [
      { id: 'corte', nome: 'Corte', preco: 60, min: 30 },
      { id: 'pente', nome: 'Corte de um pente', preco: 45, min: 20 },
      { id: 'barba', nome: 'Barba', preco: 60, min: 30 },
      { id: 'sobrancelha', nome: 'Sobrancelha', preco: 15, min: 15 },
      { id: 'acabamento', nome: 'Acabamento', preco: 20, min: 15 }
    ] },
    { nome: 'Química e tratamento', itens: [
      { id: 'luzes', nome: 'Luzes', preco: 120, min: 30, mais: true },
      { id: 'progressiva', nome: 'Progressiva', preco: 100, min: 60, mais: true },
      { id: 'botox', nome: 'Botox', preco: 100, min: 60, mais: true },
      { id: 'tintura', nome: 'Tintura', preco: 45, min: 30 },
      { id: 'relaxamento', nome: 'Relaxamento', preco: 40, min: 30 },
      { id: 'hidratacao', nome: 'Hidratação', preco: 30, min: 30 }
    ] }
  ];
  // Quando o cliente marca as partes soltas, sugerimos o combo que sai mais barato.
  var COMBOS = [
    { partes: ['corte', 'barba', 'sobrancelha'], combo: 'completo' },
    { partes: ['corte', 'barba'], combo: 'corte-barba' }
  ];

  var porId = {};
  GRUPOS.forEach(function (g) { g.itens.forEach(function (s) { porId[s.id] = s; }); });

  var estado = { servicos: [], dia: null, periodo: null };
  var $ = function (id) { return document.getElementById(id); };
  var reais = function (n) { return 'R$ ' + n.toFixed(0); };
  var tempo = function (m) {
    var h = Math.floor(m / 60), r = m % 60;
    return h ? h + 'h' + (r ? ' ' + r + 'min' : '') : r + 'min';
  };

  /* ---------- serviços ---------- */
  var caixa = $('servicos');
  GRUPOS.forEach(function (g) {
    var grupo = document.createElement('div');
    grupo.className = 'services__group';
    var h = document.createElement('h4');
    h.textContent = g.nome;
    var grade = document.createElement('div');
    grade.className = 'services__grid';
    g.itens.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'svc';
      b.dataset.id = s.id;
      b.setAttribute('aria-pressed', 'false');
      b.innerHTML = '<span class="svc__name">' + s.nome + '<span class="svc__time">' + tempo(s.min) + '</span></span>' +
        '<span class="svc__price">' + reais(s.preco) + (s.mais ? '+' : '') + '</span><span class="svc__check" aria-hidden="true"></span>';
      b.addEventListener('click', function () { alternar(s.id); });
      grade.appendChild(b);
    });
    grupo.appendChild(h);
    grupo.appendChild(grade);
    caixa.appendChild(grupo);
  });

  function alternar(id) {
    var i = estado.servicos.indexOf(id);
    if (i >= 0) estado.servicos.splice(i, 1); else estado.servicos.push(id);
    atualizar();
  }

  /* ---------- dias e períodos ---------- */
  var DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  var DIAS_LONGOS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  var caixaDias = $('dias');
  var d = new Date();
  var feitos = 0;
  while (feitos < 7) {
    if (d.getDay() !== 0) { // domingo fechado
      (function (data, primeiro) {
        var dd = String(data.getDate()).padStart(2, '0') + '/' + String(data.getMonth() + 1).padStart(2, '0');
        var rotulo = DIAS_LONGOS[data.getDay()] + ', ' + dd;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip chip--day';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', 'false');
        b.setAttribute('aria-label', rotulo);
        b.innerHTML = '<small>' + (primeiro ? 'hoje' : DIAS[data.getDay()]) + '</small><b>' + data.getDate() + '</b>';
        b.addEventListener('click', function () { estado.dia = rotulo; marcar(caixaDias, b); atualizar(); });
        caixaDias.appendChild(b);
      })(new Date(d), feitos === 0 && d.toDateString() === new Date().toDateString());
      feitos++;
    }
    d.setDate(d.getDate() + 1);
  }
  var caixaPer = $('periodos');
  ['Manhã', 'Tarde', 'Fim do dia', 'Tanto faz'].forEach(function (p) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.textContent = p;
    b.addEventListener('click', function () { estado.periodo = p; marcar(caixaPer, b); atualizar(); });
    caixaPer.appendChild(b);
  });
  function marcar(grupo, alvo) {
    grupo.querySelectorAll('[role="radio"]').forEach(function (x) { x.setAttribute('aria-checked', String(x === alvo)); });
  }
  $('nome').addEventListener('input', atualizar);

  /* ---------- pedido ---------- */
  function quando() {
    if (!estado.dia && !estado.periodo) return '';
    var p = estado.periodo && estado.periodo !== 'Tanto faz' ? estado.periodo.toLowerCase() : (estado.periodo ? 'qualquer período' : '');
    return [estado.dia, p].filter(Boolean).join(' · ');
  }

  function atualizar() {
    var sel = estado.servicos.map(function (id) { return porId[id]; });
    document.querySelectorAll('.svc').forEach(function (b) {
      b.setAttribute('aria-pressed', String(estado.servicos.indexOf(b.dataset.id) >= 0));
    });

    var lista = $('ticketLista');
    lista.innerHTML = '';
    if (!sel.length) {
      lista.innerHTML = '<li class="ticket__empty">Toque em um serviço para começar.</li>';
    } else {
      sel.forEach(function (s) {
        var li = document.createElement('li');
        li.innerHTML = '<span>' + s.nome + '</span><span>' + reais(s.preco) + (s.mais ? '+' : '') + '</span>';
        lista.appendChild(li);
      });
    }

    var total = sel.reduce(function (a, s) { return a + s.preco; }, 0);
    var min = sel.reduce(function (a, s) { return a + s.min; }, 0);
    var aPartir = sel.some(function (s) { return s.mais; });
    var totalTxt = sel.length ? (aPartir ? 'a partir de ' : '') + reais(total) : '—';
    $('ticketTotal').textContent = totalTxt;
    $('ticketTempo').textContent = sel.length ? 'cerca de ' + tempo(min) : '—';
    $('ticketQuando').textContent = quando() || '—';

    // dica de combo
    var dica = $('dica');
    dica.hidden = true;
    dica.innerHTML = '';
    for (var i = 0; i < COMBOS.length; i++) {
      var c = COMBOS[i];
      var tem = c.partes.every(function (p) { return estado.servicos.indexOf(p) >= 0; });
      if (!tem) continue;
      var combo = porId[c.combo];
      var solto = c.partes.reduce(function (a, p) { return a + porId[p].preco; }, 0);
      if (combo.preco >= solto) continue;
      var t = document.createElement('span');
      t.textContent = 'No combo “' + combo.nome + '” sai por ' + reais(combo.preco) + ' em vez de ' + reais(solto) + '. ';
      var bt = document.createElement('button');
      bt.type = 'button';
      bt.textContent = 'Trocar pelo combo';
      (function (c) {
        bt.addEventListener('click', function () {
          estado.servicos = estado.servicos.filter(function (id) { return c.partes.indexOf(id) < 0; });
          estado.servicos.unshift(c.combo);
          atualizar();
        });
      })(c);
      dica.appendChild(t);
      dica.appendChild(bt);
      dica.hidden = false;
      break;
    }

    // mensagem do WhatsApp
    var enviar = $('enviar');
    if (sel.length) {
      var nome = $('nome').value.trim();
      var linhas = ['Olá! Vim pelo site e quero agendar na Mens Space' + (nome ? '. Aqui é ' + nome + '.' : ':')];
      sel.forEach(function (s) { linhas.push('• ' + s.nome + ' (' + reais(s.preco) + (s.mais ? '+' : '') + ')'); });
      linhas.push('Total: ' + totalTxt);
      linhas.push(quando() ? 'Preferência: ' + quando() : 'Qual o próximo horário livre?');
      enviar.href = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(linhas.join('\n'));
      enviar.classList.remove('is-disabled');
      enviar.removeAttribute('aria-disabled');
      $('enviarTxt').textContent = 'Enviar pedido no WhatsApp';
    } else {
      enviar.href = 'https://wa.me/' + WHATS;
      enviar.classList.add('is-disabled');
      enviar.setAttribute('aria-disabled', 'true');
      $('enviarTxt').textContent = 'Escolha um serviço';
    }

    $('barraQtd').textContent = sel.length + (sel.length === 1 ? ' serviço' : ' serviços');
    $('barraTotal').textContent = totalTxt;
    barra();
  }

  /* ---------- barra do celular e botão flutuante ---------- */
  var ticketVisivel = false;
  function barra() {
    var mostrar = estado.servicos.length > 0 && !ticketVisivel;
    $('barra').hidden = !mostrar;
    $('fab').classList.toggle('is-hidden', mostrar);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      ticketVisivel = es[0].isIntersecting;
      barra();
    }, { threshold: 0.25 }).observe($('ticket'));
  }

  /* ---------- hoje na tabela de horários ---------- */
  var hoje = document.querySelector('#horarios tr[data-dia="' + new Date().getDay() + '"]');
  if (hoje) hoje.classList.add('is-today');

  /* ---------- entrada das seções e contagem ---------- */
  function contar(el) {
    var alvo = parseFloat(el.dataset.count);
    var decimal = el.dataset.count.indexOf('.') >= 0;
    var fmt = function (v) { return decimal ? v.toFixed(1).replace('.', ',') : String(Math.round(v)); };
    if (reduzido) { el.textContent = fmt(alvo); return; }
    var inicio = null;
    function passo(t) {
      if (!inicio) inicio = t;
      var p = Math.min((t - inicio) / 1300, 1);
      el.textContent = fmt(alvo * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
    setTimeout(function () { el.textContent = fmt(alvo); }, 1600); // garante o valor final mesmo com a aba em segundo plano
  }
  var revelar = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduzido) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll('[data-count]').forEach(contar);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revelar.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add('is-in'); });
  }
  var nota = document.querySelector('.seal__score');
  if (nota) contar(nota);

  atualizar();
})();
