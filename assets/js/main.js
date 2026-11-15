/* Dermaflow Rental — scripts do site (sem dependências) */
(function () {
  'use strict';

  // Menu mobile
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Faixa de promoção: some sozinha depois da data de fim
  var promo = document.querySelector('.promo[data-ate]');
  if (promo) {
    var fim = new Date(promo.getAttribute('data-ate') + 'T23:59:59-03:00');
    if (new Date() > fim) promo.hidden = true;
  }

  // Vídeos: carregam só quando a pessoa clica (site leve)
  document.addEventListener('click', function (e) {
    var play = e.target.closest('.play[data-embed], .play[data-mp4]');
    if (!play) return;
    var player = play.parentNode;
    var titulo = play.getAttribute('aria-label') || 'Vídeo';
    if (play.dataset.mp4) {
      var v = document.createElement('video');
      v.src = play.dataset.mp4; v.controls = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('title', titulo);
      player.innerHTML = ''; player.appendChild(v);
    } else {
      var f = document.createElement('iframe');
      f.src = play.dataset.embed; f.title = titulo; f.loading = 'lazy';
      f.allow = 'autoplay; encrypted-media; picture-in-picture'; f.setAttribute('allowfullscreen', '');
      player.innerHTML = ''; player.appendChild(f);
    }
    track('video_play', { video: titulo });
  });

  // Filtros da galeria de clientes
  var filtros = document.querySelector('.filters');
  if (filtros) {
    filtros.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var f = b.dataset.filter;
      filtros.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      document.querySelectorAll('#galeria .video').forEach(function (v) {
        v.hidden = !(f === 'todos' || (v.dataset.equip || '').split(' ').indexOf(f) > -1);
      });
    });
  }

  // Calculadora de retorno
  document.querySelectorAll('.calc').forEach(function (c) {
    var brl = function (n) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); };
    var num = function (n) { var v = parseFloat(String(c.querySelector('[name=' + n + ']').value).replace(',', '.')); return isNaN(v) ? 0 : v; };
    function calc() {
      var preco = num('preco'), sessoes = num('sessoes'), custo = num('custo');
      var bruto = preco * sessoes, saldo = bruto - custo;
      c.querySelector('[data-out=bruto]').textContent = brl(bruto);
      c.querySelector('[data-out=saldo]').textContent = brl(saldo);
      c.querySelector('[data-out=empate]').textContent = (preco > 0 && custo > 0) ? Math.ceil(custo / preco) + ' sessões' : '–';
      c.querySelector('[data-out=saldo]').textContent = custo > 0 ? brl(saldo) : 'informe o custo';
    }
    c.addEventListener('input', calc); calc();
  });

  // Formulário de reserva: monta a mensagem e abre o WhatsApp
  var form = document.getElementById('form-reserva');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var data = d.get('data') ? new Date(d.get('data') + 'T12:00:00').toLocaleDateString('pt-BR') : 'a combinar';
      var msg = 'Olá, Dermaflow! Quero reservar um equipamento.\n' +
        '• Nome: ' + (d.get('nome') || '') + '\n' +
        '• Clínica: ' + (d.get('clinica') || '') + '\n' +
        '• Cidade: ' + (d.get('cidade') || '') + '\n' +
        '• Equipamento: ' + (d.get('equipamento') || '') + '\n' +
        '• Data desejada: ' + data +
        (d.get('obs') ? '\n• Observações: ' + d.get('obs') : '');
      track('whatsapp_click', { origem: 'formulario' });
      window.open('https://wa.me/' + form.dataset.wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  // Evento de clique no WhatsApp (GA4, quando instalado)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="https://wa.me/"]');
    if (a) track('whatsapp_click', { origem: a.dataset.origem || 'link' });
    var t = e.target.closest('a[href^="tel:"]');
    if (t) track('phone_click', {});
  });

  function track(nome, params) {
    params = params || {};
    params.page_path = location.pathname;
    if (typeof window.gtag === 'function') window.gtag('event', nome, params);
    if (window.dataLayer && typeof window.gtag !== 'function') window.dataLayer.push(Object.assign({ event: nome }, params));
  }
})();
