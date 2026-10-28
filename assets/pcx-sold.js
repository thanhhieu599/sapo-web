(function(){
  if (window.__pcxSold) return; window.__pcxSold = true;

  var API = 'https://productstatistics.sapoapps.vn/Storefront/GetStats?storeAlias=trangthietbivn&productId=';
  var W_SOLD = 10;       // 1 lượt mua = 10 lượt xem
  var W_VIEW = 1;
  var HIDE_ZERO = false; // true: sản phẩm 0 lượt mua thì ẩn chữ "Đã bán"
  var MAX = 4;           // số yêu cầu chạy cùng lúc
  var WAIT = 3000;       // chờ tối đa 3 giây rồi sắp xếp với dữ liệu đang có

  /* ---------- Lấy & lưu tạm số liệu ---------- */
  function cGet(id){ try { var v = sessionStorage.getItem('pcxStat_' + id); return v ? JSON.parse(v) : null; } catch(e){ return null; } }
  function cSet(id, st){ try { sessionStorage.setItem('pcxStat_' + id, JSON.stringify(st)); } catch(e){} }

  function pick(o, isView){
    var r = null;
    (function walk(x){
      if (r !== null || !x || typeof x !== 'object') return;
      for (var k in x) {
        var v = x[k], ok = isView ? /view|xem/i.test(k) : (!/view|xem/i.test(k) && /order|purchas|sold|buy|sale|mua|bought/i.test(k));
        if (ok && (typeof v === 'number' || /^\d+$/.test(v))) { r = +v; return; }
        if (typeof v === 'object') walk(v);
      }
    })(o);
    return r;
  }
  function parse(t){
    var s = null, v = null;
    try { var o = JSON.parse(t); s = pick(o, false); v = pick(o, true); } catch(e){}
    var txt = String(t).replace(/<[^>]+>/g, ' ');
    if (s === null) { var m = txt.match(/(\d[\d.,]*)\s*lượt mua/i); if (m) s = parseInt(m[1].replace(/[.,]/g, ''), 10); }
    if (v === null) { var n = txt.match(/(\d[\d.,]*)\s*lượt xem/i); if (n) v = parseInt(n[1].replace(/[.,]/g, ''), 10); }
    return s === null && v === null ? null : { s: s || 0, v: v || 0 };
  }

  var stats = {}, waiting = {}, q = [], run = 0;
  function next(){
    while (run < MAX && q.length) (function(id){
      run++;
      fetch(API + encodeURIComponent(id))
        .then(function(r){ return r.ok ? r.text() : Promise.reject(r.status); })
        .then(function(t){ var st = parse(t); if (st) { stats[id] = st; cSet(id, st); } })
        ['catch'](function(){})
        .then(function(){ run--; done(id); next(); });
    })(q.shift());
  }
  function done(id){
    var cbs = waiting[id] || []; delete waiting[id];
    cbs.forEach(function(cb){ cb(stats[id] || null); });
  }
  function getStat(id, cb){
    if (stats[id] !== undefined) return cb(stats[id]);
    var c = cGet(id); if (c) { stats[id] = c; return cb(c); }
    if (waiting[id]) { waiting[id].push(cb); return; }
    waiting[id] = [cb]; q.push(id); next();
  }

  /* ---------- Điền "Đã bán" ---------- */
  function paint(el, st){
    if (!st) return;
    var b = el.querySelector('b') || el;
    if (st.s > 0 || !HIDE_ZERO) { b.textContent = st.s; el.style.display = ''; }
    else el.style.display = 'none';
  }

  /* ---------- Nạp ảnh thật (data-lazyload) cho khối sản phẩm ---------- */
  function loadImgs(root){
    root.querySelectorAll('img[data-lazyload]').forEach(function(img){
      var real = img.getAttribute('data-lazyload');
      if (real && img.getAttribute('src') !== real) img.setAttribute('src', real);
    });
  }

  /* ---------- Sắp xếp ---------- */
  function tier(box){
    if (box.querySelector('.pcx-btn--contact')) return 2;   // Liên hệ
    if (box.querySelector('.pcx-btn--out')) return 1;       // Hết hàng
    return 0;                                               // Còn hàng
  }
  function score(box){
    var el = box.querySelector('.pcx-sold[data-pid]'), st = el && stats[el.getAttribute('data-pid')];
    return st ? st.s * W_SOLD + st.v * W_VIEW : 0;
  }
  function sortItems(items){
    return items.map(function(it, i){ var box = it.querySelector('.product-box'); return { it: it, t: tier(box), sc: score(box), i: i }; })
      .sort(function(a, b){ return a.t - b.t || b.sc - a.sc || a.i - b.i; })
      .map(function(x){ return x.it; });
  }
  function rank(block){
    if (block.__pcxRanked) return; block.__pcxRanked = true;
    var $ = window.jQuery;
    if (block.classList.contains('owl-carousel')) {
      var loaded = block.querySelector('.owl-stage');
      var items = loaded
        ? [].slice.call(block.querySelectorAll('.owl-item:not(.cloned) > *'))
        : [].slice.call(block.children).filter(function(c){ return c.querySelector('.product-box'); });
      var sorted = sortItems(items);
      if (sorted.every(function(x, i){ return x === items[i]; })) return;   // đã đúng thứ tự
      if (loaded && $ && $.fn.owlCarousel) {
        $(block).trigger('replace.owl.carousel', [$(sorted)]).trigger('refresh.owl.carousel');
      } else if (!loaded) {
        sorted.forEach(function(x){ block.appendChild(x); });
      }
      loadImgs(block);
    } else {
      // Lưới (trang danh mục, tìm kiếm): đổi thứ tự hiển thị bằng CSS order, không di chuyển HTML
      var cols = [].slice.call(block.children).filter(function(c){ return c.querySelector('.product-box'); });
      sortItems(cols).forEach(function(c, i){ c.style.order = i; });
      loadImgs(block);
    }
  }

  /* ---------- Tìm các khối sản phẩm ---------- */
  function blockOf(box){
    var owl = box.closest('.owl-carousel'); if (owl) return owl;
    var p = box.parentElement;
    while (p && p !== document.body) {
      if (p.parentElement && [].filter.call(p.parentElement.children, function(c){ return c.querySelector && c.querySelector('.product-box'); }).length > 1) return p.parentElement;
      p = p.parentElement;
    }
    return null;
  }
  function prepare(block){
    if (block.__pcxSeen) return; block.__pcxSeen = true;
    loadImgs(block);
    var spans = [].slice.call(block.querySelectorAll('.pcx-sold[data-pid]'));
    var seen = {}, ids = [];
    spans.forEach(function(s){ var id = s.getAttribute('data-pid'); if (id && !seen[id]) { seen[id] = 1; ids.push(id); } });
    var left = ids.length, timer = setTimeout(function(){ rank(block); }, WAIT);
    if (!left) { clearTimeout(timer); rank(block); return; }
    ids.forEach(function(id){
      getStat(id, function(st){
        block.querySelectorAll('.pcx-sold[data-pid="' + id + '"]').forEach(function(el){ paint(el, st); });
        if (--left === 0) { clearTimeout(timer); rank(block); }
      });
    });
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting) { io.unobserve(e.target); prepare(e.target); } });
  }, {rootMargin: '300px'}) : null;

  function scan(){
    document.querySelectorAll('.product-box').forEach(function(box){
      if (box.__pcxScan) return; box.__pcxScan = true;
      var b = blockOf(box);
      if (b && !b.__pcxObs) { b.__pcxObs = true; io ? io.observe(b) : prepare(b); }
      else if (!b) {   // ô đứng riêng lẻ: chỉ điền số
        var el = box.querySelector('.pcx-sold[data-pid]');
        if (el) getStat(el.getAttribute('data-pid'), function(st){ paint(el, st); });
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  var n = 0, t = setInterval(function(){ scan(); if (++n >= 10) clearInterval(t); }, 1000);
})();

/* ===== Nút +/- số lượng và đồng hồ khuyến mãi trên ô sản phẩm
   (chuyển từ đoạn <script> cuối product-grid-item.bwt để không bị in lặp trong mọi ô) ===== */
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
