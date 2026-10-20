
/* INTERVAL: shared behaviour. No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'interval-era';
  var ERAS = ['70', '80', '90'];

  /* ---------- Channels (eras) ---------- */
  var eraButtons = document.querySelectorAll('[data-era-set]');

  function syncButtons() {
    var current = root.getAttribute('data-era');
    for (var i = 0; i < eraButtons.length; i++) {
      eraButtons[i].setAttribute('aria-pressed', String(eraButtons[i].getAttribute('data-era-set') === current));
    }
  }

  function setEra(era) {
    if (ERAS.indexOf(era) === -1 || era === root.getAttribute('data-era')) return;
    root.classList.add('tuning');
    root.setAttribute('data-era', era);
    try { localStorage.setItem(KEY, era); } catch (e) { /* storage can be unavailable */ }
    syncButtons();
    window.setTimeout(function () { root.classList.remove('tuning'); }, 320);
  }

  for (var i = 0; i < eraButtons.length; i++) {
    eraButtons[i].addEventListener('click', function (ev) {
      setEra(ev.currentTarget.getAttribute('data-era-set'));
    });
  }
  syncButtons();

  /* ---------- Clock (teletext style: Tue 20 Oct 16:58/42) ---------- */
  var clock = document.getElementById('clock');
  if (clock) {
    var D = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var d = new Date();
      clock.textContent = D[d.getDay()] + ' ' + d.getDate() + ' ' + M[d.getMonth()] + ' ' +
        pad(d.getHours()) + ':' + pad(d.getMinutes()) + '/' + pad(d.getSeconds());
    };
    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- Go to page (home) ---------- */
  var form = document.getElementById('jump');
  var input = document.getElementById('page-input');
  var status = document.getElementById('status');
  var entries = document.querySelectorAll('[data-page]');
  var titles = {};
  var live = {"204": "/dhurandhar-aditya-dhar-fiction-as-propaganda/", "211": "/angry-man-formula-pan-indian-cinema/", "218": "/indian-filmmakers-who-went-quiet/", "226": "/box-office-failures-cult-classics-part-3/", "402": "/pushpa-teaser-breakdown/"};

  for (var j = 0; j < entries.length; j++) {
    var t = entries[j].querySelector('.t');
    titles[entries[j].getAttribute('data-page')] = t ? t.textContent : '';
  }

  function say(msg) { if (status) status.textContent = msg; }

  function goPage(raw) {
    var p = String(raw || '').replace(/^p/i, '').trim();
    if (!/^\d{3}$/.test(p)) {
      say('Enter a three-digit page number, such as 204.');
      return;
    }
    if (p === '101') {
      window.scrollTo(0, 0);
      say('You are on page 101, the index.');
      return;
    }
    if (live[p]) {
      window.location.href = live[p];
      return;
    }
    if (titles[p]) {
      say('Page ' + p + ', "' + titles[p] + '", is not published yet.');
      return;
    }
    say('There is no page ' + p + '. Try ' + Object.keys(live).join(', ') + '.');
  }

  if (form && input) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      goPage(input.value);
    });
  }
  var soon = document.querySelectorAll('.entry.soon');
  for (var k = 0; k < soon.length; k++) {
    soon[k].addEventListener('click', function (ev) {
      goPage(ev.currentTarget.getAttribute('data-page'));
    });
  }

  /* ---------- Spoilers ---------- */
  document.addEventListener('click', function (ev) {
    var s = ev.target.closest ? ev.target.closest('.spoiler') : null;
    if (!s || s.getAttribute('aria-pressed') === 'true') return;
    s.setAttribute('aria-pressed', 'true');
    s.removeAttribute('aria-label');
  });

  /* ---------- Reading timecode (article) ---------- */
  var prose = document.getElementById('prose');
  var tape = document.getElementById('tape');
  if (prose && tape) {
    var words = prose.textContent.trim().split(/\s+/).length;
    var total = Math.max(60, Math.round(words / 220 * 60));
    var hms = function (s) {
      s = Math.max(0, Math.round(s));
      return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    };
    var timeEl = tape.querySelector('.time');
    var bar = tape.querySelector('i');
    var mins = document.querySelectorAll('.read-time');
    for (var m = 0; m < mins.length; m++) mins[m].textContent = Math.max(1, Math.round(total / 60)) + ' min read';

    var queued = false;
    var update = function () {
      queued = false;
      var rect = prose.getBoundingClientRect();
      var top = rect.top + window.scrollY;
      var vh = window.innerHeight;
      var p = (window.scrollY + vh * 0.35 - top) / rect.height;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) p = 1;
      p = Math.min(1, Math.max(0, p));
      timeEl.textContent = hms(total * p) + ' / ' + hms(total);
      bar.style.setProperty('--p', (p * 100).toFixed(1) + '%');
    };
    var onScroll = function () {
      if (!queued) { queued = true; window.requestAnimationFrame(update); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }
})();
