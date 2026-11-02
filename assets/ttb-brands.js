/* Dải thương hiệu chạy ngang - viết lại 02/11/2026 để giảm tải CPU.
   Bản cũ dịch chuyển bằng JavaScript 60 lần/giây (gán scrollLeft mỗi khung hình) và dựng lại dải logo mỗi khi
   ảnh tải xong -> PageSpeed đo 1,8 giây CPU trên điện thoại.
   Bản này: dựng HTML MỘT lần, chuyển động bằng CSS animation (card đồ họa xử lý, gần như 0 CPU),
   chỉ bắt đầu chạy sau khi trang tải xong, tự dừng khi khuất màn hình / rê chuột / khách bấm.
   Giữ nguyên HTML trong snippets/section_brands.bwt. */
(function () {
  'use strict';
  function mount(root) {
    if (root.dataset.ttbBrandsReady) return;
    var viewport = root.querySelector('[data-ttb-brands-viewport]');
    var track = root.querySelector('[data-ttb-brands-track]');
    var source = root.querySelector('[data-ttb-brands-data]');
    var prev = root.querySelector('[data-ttb-brands-prev]');
    var next = root.querySelector('[data-ttb-brands-next]');
    if (!viewport || !track || !source || !source.content) return;

    var brands = Array.prototype.map.call(source.content.querySelectorAll('a'), function (a) {
      return { name: (a.getAttribute('data-name') || '').trim(), url: a.getAttribute('href') || '', image: (a.getAttribute('data-image') || '').trim() };
    }).filter(function (b) { return b.name && /^\/(?!\/)/.test(b.url) && b.image; });
    if (!brands.length) return;
    root.dataset.ttbBrandsReady = 'true';

    var speed = Math.max(8, Math.min(160, parseFloat(root.dataset.speed) || 28)); // px/giây
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stride = 170, shift = 0, duration = 0, looping = false, lastWidth = 0, pauseTimer = 0;

    function makeGroup(hidden) {
      var list = document.createElement('ul');
      list.className = 'ttb-brands__group';
      if (hidden) list.setAttribute('aria-hidden', 'true');
      brands.forEach(function (b, i) {
        var li = document.createElement('li');
        li.className = 'ttb-brands__item';
        var a = document.createElement('a');
        a.className = 'ttb-brands__card';
        a.href = b.url;
        a.setAttribute('aria-label', 'Xem sản phẩm thương hiệu ' + b.name);
        if (hidden) a.tabIndex = -1;
        if (/^(https?:\/\/|\/\/|\/)/.test(b.image)) {
          var img = document.createElement('img');
          img.className = 'ttb-brands__logo';
          img.src = b.image; img.alt = hidden ? '' : b.name;
          img.width = 132; img.height = 46;
          img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
          a.appendChild(img);
        } else a.classList.add('ttb-brands__card--text');
        var span = document.createElement('span');
        span.className = 'ttb-brands__name';
        span.textContent = b.name;
        a.appendChild(span); li.appendChild(a); list.appendChild(li);
      });
      return list;
    }

    /* Dựng HTML đúng 1 lần: nhóm chính + (nếu cần chạy vòng) 1 bản sao để nối liền mạch */
    track.appendChild(makeGroup(false));
    var copy = null;

    function setup() {
      var width = viewport.clientWidth;
      if (!width || width === lastWidth) return;          // chỉ tính lại khi bề ngang thật sự đổi
      lastWidth = width;
      var css = window.getComputedStyle(root);
      var card = parseFloat(css.getPropertyValue('--ttb-brand-width')) || 156;
      var gap = parseFloat(css.getPropertyValue('--ttb-brand-gap')) || 14;
      stride = card + gap;
      shift = brands.length * stride;                     // bề rộng 1 nhóm (thẻ cố định -> không cần đo ảnh)
      looping = !reduced && shift - gap > width + 1;
      if (looping && !copy) { copy = makeGroup(true); track.appendChild(copy); }
      if (!looping && copy) { track.removeChild(copy); copy = null; }
      root.classList.toggle('is-looping', looping);
      if (prev) prev.hidden = !looping;
      if (next) next.hidden = !looping;
      duration = shift / speed;
      track.style.setProperty('--ttb-shift', (-shift) + 'px');
      track.style.setProperty('--ttb-dur', duration + 's');
    }

    function start() {
      if (!looping) return;
      track.classList.add('is-marquee');
    }

    /* Mũi tên: nhảy 1 thẻ bằng cách dời mốc thời gian của animation (không chạy vòng lặp JS) */
    function step(dir) {
      if (!looping) return;
      var x = 0;
      try { x = new DOMMatrixReadOnly(window.getComputedStyle(track).transform).m41; } catch (e) {}
      var nx = x - dir * stride;
      nx = ((nx % shift) - shift) % shift;               // giữ trong khoảng (-shift, 0]
      track.classList.remove('is-marquee');
      track.style.animationDelay = (nx / shift * duration) + 's';
      void track.offsetWidth;                             // khởi động lại animation (chỉ khi bấm)
      track.classList.add('is-marquee');
      pause(2500);
    }
    function pause(ms) {
      root.classList.add('is-paused');
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(function () { root.classList.remove('is-paused'); }, ms);
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    /* Vuốt trên điện thoại = bấm mũi tên */
    var sx = null;
    viewport.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; pause(3000); }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 30) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    /* Khuất màn hình -> dừng hẳn animation */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { root.classList.toggle('is-offscreen', !es[0].isIntersecting); }).observe(root);
    }

    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setup, 200); }, { passive: true });

    setup();
    /* Chỉ bắt đầu chạy khi trang đã tải xong + 1,5 giây, để không tranh tài nguyên với nội dung chính */
    function later() { setTimeout(start, 1500); }
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
  }
  function init() { Array.prototype.forEach.call(document.querySelectorAll('[data-ttb-brands]'), mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
