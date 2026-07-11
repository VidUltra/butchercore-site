/* ============================================================
   Butcher Core — marketing site interactions
   Vanilla JS, no dependencies. Progressive enhancement only.
   ============================================================ */
(function () {
  'use strict';

  /* ---- current year in footer ---- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---- sticky header shadow on scroll ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- mobile menu ---- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    var closeMenu = function () {
      document.body.classList.remove('menu-open');
      mobileNav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ---- reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---- animated counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        cio.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var prefix = el.getAttribute('data-count-prefix') || '';
        var suffix = el.getAttribute('data-count-suffix') || '';
        var fmt = function (v) {
          return prefix + (Number.isInteger(target) ? Math.round(v).toLocaleString() : v.toFixed(1)) + suffix;
        };
        var steps = 34, i = 0;
        var step = function () {
          i++;
          var p = i / steps;
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(i >= steps ? target : target * eased);
          if (i < steps) setTimeout(step, 40);
        };
        step();
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });

  /* ---- animated SMS demo (looping text exchange) ---- */
  (function initSmsDemos() {
    var threads = document.querySelectorAll('[data-sms-demo]');
    if (!threads.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    threads.forEach(function (thread) {
      var msgs = Array.prototype.slice.call(thread.querySelectorAll('.sms-msg'));
      var status = thread.querySelector('.sms-status');

      // reduced motion / no support: just show everything, no loop
      if (reduce) {
        msgs.forEach(function (m) { m.classList.add('show'); });
        if (status) status.classList.add('show');
        return;
      }

      thread.classList.add('anim');
      var timers = [];
      var typingEl = null;
      var playing = false;

      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function scrollDown() { thread.scrollTop = thread.scrollHeight; }
      function removeTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }
      function reset() {
        removeTyping();
        msgs.forEach(function (m) { m.classList.remove('show'); });
        if (status) status.classList.remove('show');
        thread.scrollTop = 0;
      }
      function showTyping(side) {
        removeTyping();
        typingEl = document.createElement('div');
        typingEl.className = 'sms-msg ' + side + ' sms-typing';
        typingEl.innerHTML = '<div class="sms-bubble"><span class="td"></span><span class="td"></span><span class="td"></span></div>';
        if (status) thread.insertBefore(typingEl, status);
        else thread.appendChild(typingEl);
        scrollDown();
      }

      function play() {
        clearTimers();
        reset();
        playing = true;
        var t = 550;
        msgs.forEach(function (m) {
          var incoming = m.classList.contains('in');
          if (incoming) {
            timers.push(setTimeout(function () { showTyping('in'); }, t));
            t += 1050;
            timers.push(setTimeout(function () { removeTyping(); m.classList.add('show'); scrollDown(); }, t));
            t += 950;
          } else {
            timers.push(setTimeout(function () { m.classList.add('show'); scrollDown(); }, t));
            t += m.classList.contains('img') ? 1350 : 1050;
          }
        });
        if (status) {
          timers.push(setTimeout(function () { status.classList.add('show'); scrollDown(); }, t));
          t += 300;
        }
        // hold, then loop
        timers.push(setTimeout(play, t + 3000));
      }

      // start when scrolled into view; pause when out of view
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { if (!playing) play(); }
            else { playing = false; clearTimers(); removeTyping(); }
          });
        }, { threshold: 0.3 });
        io.observe(thread);
      } else {
        play();
      }

      // replay button (in the same section)
      var section = thread.closest('section') || document;
      var btn = section.querySelector('.demo-replay');
      if (btn) btn.addEventListener('click', function () { play(); });
    });
  })();

  /* ---- animated billing / invoice demo (looping) ---- */
  (function initBillDemos() {
    var demos = document.querySelectorAll('[data-bill-demo]');
    if (!demos.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var money = function (cents) {
      return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    demos.forEach(function (demo) {
      var lines = Array.prototype.slice.call(demo.querySelectorAll('.bill-line'));
      var sum = demo.querySelector('.bill-sum');
      var totalEl = demo.querySelector('[data-bill-total]');
      var totalCents = parseInt(demo.getAttribute('data-total-cents'), 10) || 0;
      var pill = demo.querySelector('[data-bill-status]');
      var steps = Array.prototype.slice.call(demo.querySelectorAll('[data-step]'));

      var PILL = {
        draft:     { cls: '', html: '<i class="ti ti-pencil"></i> Draft' },
        finalized: { cls: 'finalized', html: '<i class="ti ti-lock"></i> Finalized' },
        paid:      { cls: 'paid', html: '<i class="ti ti-cash"></i> Paid' }
      };
      function setStatus(key) {
        if (pill) { pill.className = 'bill-status-pill ' + PILL[key].cls; pill.innerHTML = PILL[key].html; }
        var order = ['draft', 'finalized', 'paid'], idx = order.indexOf(key);
        steps.forEach(function (s) {
          var i = order.indexOf(s.getAttribute('data-step'));
          s.classList.toggle('active', i === idx);
          s.classList.toggle('done', i < idx);
        });
      }

      if (reduce) {
        lines.forEach(function (l) { l.classList.add('show'); });
        if (sum) sum.classList.add('show');
        if (totalEl) totalEl.textContent = money(totalCents);
        setStatus('paid');
        return;
      }

      demo.classList.add('anim');
      var timers = [], playing = false;
      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function reset() {
        lines.forEach(function (l) { l.classList.remove('show'); });
        if (sum) sum.classList.remove('show');
        if (totalEl) totalEl.textContent = money(0);
        setStatus('draft');
      }
      function countTotal() {
        // setTimeout-based stepper (not requestAnimationFrame, which throttles in
        // background tabs and could leave the total stuck mid-count)
        var steps = 24, i = 0;
        function tick() {
          i++;
          var p = i / steps;
          var eased = 1 - Math.pow(1 - p, 3);
          if (totalEl) totalEl.textContent = money(Math.round(totalCents * (i >= steps ? 1 : eased)));
          if (i < steps) timers.push(setTimeout(tick, 38));
        }
        tick();
      }
      function play() {
        clearTimers();
        reset();
        playing = true;
        var t = 500;
        lines.forEach(function (l) {
          timers.push(setTimeout(function () { l.classList.add('show'); }, t));
          t += l.classList.contains('auto') ? 1150 : 850;
        });
        timers.push(setTimeout(function () { if (sum) sum.classList.add('show'); countTotal(); }, t));
        t += 1250;
        timers.push(setTimeout(function () { setStatus('finalized'); }, t)); t += 1400;
        timers.push(setTimeout(function () { setStatus('paid'); }, t)); t += 3200;
        timers.push(setTimeout(play, t));
      }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { if (!playing) play(); }
            else { playing = false; clearTimers(); }
          });
        }, { threshold: 0.35 });
        io.observe(demo);
      } else { play(); }
    });
  })();

  /* ---- report chart bars grow on scroll ---- */
  (function initReportCharts() {
    var charts = document.querySelectorAll('[data-report]');
    if (!charts.length) return;
    if (!('IntersectionObserver' in window)) {
      charts.forEach(function (c) {
        c.querySelectorAll('[data-w]').forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; });
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var bars = Array.prototype.slice.call(e.target.querySelectorAll('[data-w]'));
        bars.forEach(function (b, i) {
          b.style.transitionDelay = (0.12 + i * 0.09) + 's';
          setTimeout(function () { b.style.width = b.getAttribute('data-w') + '%'; }, 40);
        });
      });
    }, { threshold: 0.3 });
    charts.forEach(function (c) { io.observe(c); });
  })();

  /* ---- ⌘K global-search demo (types a query, reveals results, loops) ---- */
  (function initOmniSearch() {
    var boxes = document.querySelectorAll('[data-omni]');
    if (!boxes.length) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    boxes.forEach(function (box) {
      var qEl = box.querySelector('[data-omni-q]');
      var query = box.getAttribute('data-query') || 'Dale';
      var results = Array.prototype.slice.call(box.querySelectorAll('.omni-res'));

      if (reduce) {
        if (qEl) qEl.textContent = query;
        results.forEach(function (r) { r.classList.add('show'); });
        return;
      }

      var timers = [], playing = false;
      function clearTimers() { timers.forEach(clearTimeout); timers = []; }
      function reset() {
        if (qEl) qEl.innerHTML = '<span class="caret"></span>';
        results.forEach(function (r) { r.classList.remove('show'); });
      }
      function play() {
        clearTimers();
        reset();
        playing = true;
        var t = 600, typed = '';
        for (var i = 0; i < query.length; i++) {
          (function (ch) {
            timers.push(setTimeout(function () {
              typed += ch;
              if (qEl) qEl.innerHTML = typed + '<span class="caret"></span>';
            }, t));
          })(query[i]);
          t += 105;
        }
        t += 350;
        results.forEach(function (r) {
          timers.push(setTimeout(function () { r.classList.add('show'); }, t));
          t += 340;
        });
        t += 3400;
        timers.push(setTimeout(play, t));
      }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { if (!playing) play(); }
            else { playing = false; clearTimers(); }
          });
        }, { threshold: 0.4 });
        io.observe(box);
      } else { play(); }
    });
  })();

  /* ---- contact form (Web3Forms → emails justin@vidultra.com) ---- */
  var form = document.getElementById('demoForm');
  if (form) {
    var WEB3FORMS_KEY = '30c3343b-8fa0-40c2-895a-8881de164d91';
    var submitBtn = form.querySelector('button[type="submit"]');
    var errEl = document.getElementById('formErr');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = document.getElementById('formOk');
      var originalHTML = submitBtn ? submitBtn.innerHTML : '';

      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="ti ti-loader-2"></i> Sending…';
        submitBtn.disabled = true;
      }

      var formData = new FormData(form);
      formData.append('access_key', WEB3FORMS_KEY);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })
        .then(function (response) {
          return response.json().then(function (data) {
            return { okStatus: response.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.okStatus && result.data.success) {
            form.style.display = 'none';
            if (ok) {
              ok.classList.add('show');
              ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } else {
            showError(result.data && result.data.message);
          }
        })
        .catch(function () {
          showError();
        });

      function showError(msg) {
        if (errEl) {
          errEl.textContent = msg
            ? 'Sorry — ' + msg + ' You can also email justin@vidultra.com directly.'
            : 'Something went wrong sending your request. Please try again, or email justin@vidultra.com directly.';
          errEl.style.display = 'block';
        }
        if (submitBtn) {
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
        }
      }
    });
  }
})();
