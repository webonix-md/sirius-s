(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---- меню на телефоне ---- */
  var hdr = $('.hdr'), burger = $('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = hdr.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { hdr.classList.remove('is-open'); }); });
  }

  /* ---- вывоз мусора: календарь из data-атрибутов ---- */
  /* тексты календаря на языке страницы: <html lang="ru"> или <html lang="ro"> */
  var L = {
    ru: {
      months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
      monthsGen: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
      days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
      week: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
      kind: { s: 'Бытовые отходы', b: 'Органические отходы' },
      short: { s: 'бытовые', b: 'органика' },
      today: 'сегодня', tomorrow: 'завтра', next: 'Следующий: ',
      last: function (y) { return 'Это последний вывоз в графике ' + y + ' года'; },
      over: function (y) { return 'График ' + y + ' закончился'; },
      soon: 'Новый график появится здесь',
      wait: function (y) { return 'Ждём график на ' + y + ' год'; },
      copied: 'Скопировано'
    },
    ro: {
      months: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
      monthsGen: ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'],
      days: ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'],
      week: ['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'],
      kind: { s: 'Deșeuri menajere', b: 'Deșeuri biodegradabile' },
      short: { s: 'menajere', b: 'biodegradabile' },
      today: 'astăzi', tomorrow: 'mâine', next: 'Următoarea: ',
      last: function (y) { return 'Este ultima colectare din graficul pe ' + y; },
      over: function (y) { return 'Graficul pe ' + y + ' s-a încheiat'; },
      soon: 'Noul grafic va apărea aici',
      wait: function (y) { return 'Așteptăm graficul pe ' + y; },
      copied: 'Copiat'
    }
  }[document.documentElement.lang === 'ro' ? 'ro' : 'ru'];
  var COLOR = { s: '#3C6FB0', b: '#7A4A2A' };
  var cal = $('#cal');
  if (cal) {
    var year = +cal.getAttribute('data-year');
    var now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var list = function (v) { return (v || '').split(',').map(function (x) { return +x; }).filter(Boolean); };
    var pickups = [];

    $$('.month', cal).forEach(function (el) {
      var m = +el.getAttribute('data-m') - 1;
      var s = list(el.getAttribute('data-s')), b = list(el.getAttribute('data-b'));
      s.forEach(function (d) { pickups.push({ date: new Date(year, m, d), k: 's' }); });
      b.forEach(function (d) { pickups.push({ date: new Date(year, m, d), k: 'b' }); });

      var first = (new Date(year, m, 1).getDay() + 6) % 7; // 0 = пн
      var days = new Date(year, m + 1, 0).getDate();
      var html = '<h4>' + L.months[m].charAt(0).toUpperCase() + L.months[m].slice(1) + '</h4><table><thead><tr>' +
        L.week.map(function (d) { return '<th>' + d + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
      for (var i = 0; i < first; i++) html += '<td></td>';
      for (var d = 1; d <= days; d++) {
        var cls = s.indexOf(d) > -1 ? 's' : (b.indexOf(d) > -1 ? 'b' : '');
        if (year === today.getFullYear() && m === today.getMonth() && d === today.getDate()) cls += ' today';
        html += '<td class="' + cls + '"><span>' + d + '</span></td>';
        if ((first + d) % 7 === 0 && d < days) html += '</tr><tr>';
      }
      el.innerHTML = html + '</tr></tbody></table>';
      if (year === today.getFullYear() && m === today.getMonth()) el.classList.add('is-now');
      else if (new Date(year, m + 1, 0) < today) el.classList.add('is-past');
    });

    pickups.sort(function (a, b) { return a.date - b.date; });
    var next = pickups.filter(function (p) { return p.date >= today; });
    var fmt = function (p) { return p.date.getDate() + ' ' + L.monthsGen[p.date.getMonth()]; };
    var when = function (p) {
      var diff = Math.round((p.date - today) / 864e5);
      return diff === 0 ? L.today : diff === 1 ? L.tomorrow : L.days[p.date.getDay()];
    };
    var np = $('#next-pickup'), st = $('#st-waste');
    if (next.length) {
      var n = next[0];
      if (np) {
        $('.next__date', np).textContent = fmt(n);
        $('.next__kind', np).innerHTML = '<i style="background:' + COLOR[n.k] + '"></i>' + L.kind[n.k] + ' · ' + when(n);
        $('.next__after', np).textContent = next[1] ? L.next + fmt(next[1]) + ' — ' + L.kind[next[1].k].toLowerCase() : L.last(year);
      }
      if (st) $('.status__val', st).textContent = when(n).charAt(0).toUpperCase() + when(n).slice(1) + ', ' + fmt(n) + ' — ' + L.short[n.k];
    } else {
      if (np) { $('.next__date', np).textContent = L.over(year); $('.next__kind', np).textContent = L.soon; }
      if (st) $('.status__val', st).textContent = L.wait(year + 1);
    }
  }

  /* ---- телефон: карточка памятки открывается и закрывается нажатием ---- */
  var phone = window.matchMedia('(max-width:600px)');
  $$('.bin').forEach(function (b) {
    var head = $('.bin__head', b);
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    var sync = function () { head.setAttribute('aria-expanded', phone.matches ? b.classList.contains('is-open') : 'true'); };
    var toggle = function () { if (!phone.matches) return; b.classList.toggle('is-open'); sync(); };
    b.addEventListener('click', toggle);
    head.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    sync();
    if (phone.addEventListener) phone.addEventListener('change', sync);
  });

  /* ---- кнопка «Наверх»: появляется, когда пролистали первый экран ---- */
  var totop = $('.totop');
  if (totop) {
    var onScroll = function () { totop.classList.toggle('is-on', window.scrollY > 600); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    totop.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---- копирование реквизитов ---- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy');
      var done = function () {
        var old = b.lastChild.textContent;
        b.classList.add('is-done'); b.lastChild.textContent = L.copied;
        setTimeout(function () { b.classList.remove('is-done'); b.lastChild.textContent = old; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, done);
      else {
        var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done();
      }
    });
  });

  /* ---- страница документов: фильтр и поиск ---- */
  var dlist = $$('.drow');
  if (dlist.length && $('#doc-search')) {
    var dType = 'all', dq = '';
    $$('.chip[data-t]').forEach(function (c) {
      var t = c.getAttribute('data-t');
      var n = t === 'all' ? dlist.length : dlist.filter(function (d) { return d.getAttribute('data-t') === t; }).length;
      c.insertAdjacentHTML('beforeend', '<span>' + n + '</span>');
    });
    var dApply = function () {
      dlist.forEach(function (d) {
        var okT = dType === 'all' || d.getAttribute('data-t') === dType;
        var okQ = !dq || d.textContent.toLowerCase().indexOf(dq) > -1;
        d.hidden = !(okT && okQ);
      });
      $$('.year').forEach(function (y) { y.hidden = !$$('.drow', y).some(function (d) { return !d.hidden; }); });
      $('#doc-empty').hidden = dlist.some(function (d) { return !d.hidden; });
    };
    $$('.chip[data-t]').forEach(function (c) {
      c.addEventListener('click', function () {
        dType = c.getAttribute('data-t');
        $$('.chip[data-t]').forEach(function (x) { x.classList.toggle('is-on', x === c); });
        dApply();
      });
    });
    $('#doc-search').addEventListener('input', function (e) { dq = e.target.value.trim().toLowerCase(); dApply(); });
  }
})();
