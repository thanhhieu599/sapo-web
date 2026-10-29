/* pcx-sold.js (viet lai D&T 29/10/2026): hien so "Da ban" that tren the san pham (lay tu app thong ke san pham Sapo).
   Chi dien so, KHONG sap xep lai san pham.
   The can co trong product-grid-item.bwt: <span class="pcx-sold" data-pid="{{ product.id }}">Đã bán: <b>0</b></span> */
(function(){
  if (window.__ttbDaBan) return; window.__ttbDaBan = true;

  var API = 'https://productstatistics.sapoapps.vn/Storefront/GetStats?storeAlias=trangthietbivn&productId=';
  var HIDE_ZERO = false;   // true: san pham chua ban duoc cai nao thi an chu "Da ban"
  var CACHE_HOURS = 6;     // luu so lieu tren may khach 6 gio, chuyen trang khong phai goi lai
  var MAX = 4;             // so yeu cau chay cung luc

  function cGet(id){
    try { var v = JSON.parse(localStorage.getItem('ttbSold_' + id) || 'null');
      return v && (Date.now() - v.t) < CACHE_HOURS * 36e5 ? v.s : null; } catch(e){ return null; }
  }
  function cSet(id, s){ try { localStorage.setItem('ttbSold_' + id, JSON.stringify({ t: Date.now(), s: s })); } catch(e){} }

  /* Doc so luot mua tu ket qua API (JSON hoac HTML) */
  function parseSold(t){
    var r = null;
    try {
      (function walk(x){
        if (r !== null || !x || typeof x !== 'object') return;
        for (var k in x) {
          var v = x[k];
          if (!/view|xem/i.test(k) && /order|purchas|sold|buy|sale|mua|bought/i.test(k) && (typeof v === 'number' || /^\d+$/.test(v))) { r = +v; return; }
          if (typeof v === 'object') walk(v);
        }
      })(JSON.parse(t));
    } catch(e){}
    if (r === null) { var m = String(t).replace(/<[^>]+>/g, ' ').match(/(\d[\d.,]*)\s*lượt mua/i); if (m) r = parseInt(m[1].replace(/[.,]/g, ''), 10); }
    return r;
  }

  function paint(id, s){
    document.querySelectorAll('.pcx-sold[data-pid="' + id + '"]').forEach(function(el){
      if (s === null) return;
      if (s > 0 || !HIDE_ZERO) { (el.querySelector('b') || el).textContent = s; el.style.display = ''; }
      else el.style.display = 'none';
    });
  }

  var q = [], run = 0, asked = {};
  function next(){
    while (run < MAX && q.length) (function(id){
      run++;
      fetch(API + encodeURIComponent(id))
        .then(function(r){ return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function(t){ var s = parseSold(t); if (s !== null) { cSet(id, s); paint(id, s); } })
        ['catch'](function(){})
        .then(function(){ run--; next(); });
    })(q.shift());
  }
  function want(id){
    if (!id || asked[id]) return; asked[id] = 1;
    var c = cGet(id);
    if (c !== null) { paint(id, c); return; }   // co san trong bo nho -> hien ngay
    q.push(id); next();
  }

  /* Chi goi API khi the san pham sap hien tren man hinh */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { io.unobserve(e.target); want(e.target.getAttribute('data-pid')); } });
  }, { rootMargin: '300px' }) : null;

  /* Nap anh that cho the san pham (truoc day pcx-sold.js lam viec nay) - trinh duyet tu tai khi anh sap hien */
  function loadImgs(){
    document.querySelectorAll('.product-box img[data-lazyload]').forEach(function(img){
      var real = img.getAttribute('data-lazyload');
      if (real && img.getAttribute('src') !== real) { img.setAttribute('loading', 'lazy'); img.setAttribute('src', real); }
    });
  }

  function scan(){
    loadImgs();
    document.querySelectorAll('.pcx-sold[data-pid]').forEach(function(el){
      if (el.__ttbSeen) return; el.__ttbSeen = true;
      var id = el.getAttribute('data-pid'), c = cGet(id);
      if (c !== null) { paint(id, c); asked[id] = 1; return; }
      io ? io.observe(el) : want(id);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  /* Quet lai vai lan cho san pham nap sau (carousel, loc san pham, xem them) */
  var n = 0, t = setInterval(function(){ scan(); if (++n >= 10) clearInterval(t); }, 1000);
})();

/* ===== Nut +/- so luong va dong ho dem nguoc tren the san pham (du phong, giu nhu ban cu) =====
   Chi chay khi theme.bwt KHONG co doan <script> rieng lam viec nay (bien window.__pcxInit). */
(function(){
  if (window.__pcxInit || window.__pcxCard) return; window.__pcxCard = true;
  document.addEventListener('click', function(e){
    var m = e.target.closest('[data-pcx-minus]'), p = e.target.closest('[data-pcx-plus]');
    if (!m && !p) return;
    var input = e.target.closest('.pcx-qty').querySelector('input');
    input.value = Math.max(1, (parseInt(input.value, 10) || 1) + (p ? 1 : -1));
  });
  function endTime(s){ if (s.indexOf('T') === -1) s += 'T23:59:59'; return new Date(s).getTime(); }
  function tick(){
    var now = Date.now();
    document.querySelectorAll('.pcx-countdown').forEach(function(el){
      var diff = Math.max(0, endTime(el.getAttribute('data-end')) - now);
      if (diff === 0) { el.style.display = 'none'; return; }
      el.querySelector('[data-d]').textContent = Math.floor(diff / 864e5);
      el.querySelector('[data-h]').textContent = Math.floor(diff % 864e5 / 36e5);
      el.querySelector('[data-m]').textContent = Math.floor(diff % 36e5 / 6e4);
    });
  }
  if (document.querySelector('.pcx-countdown')) { tick(); setInterval(tick, 30000); }
})();
