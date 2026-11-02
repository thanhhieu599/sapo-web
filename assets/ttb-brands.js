/* Nguồn đầy đủ từ store.vendors; chỉ dựng một cửa sổ thẻ nhỏ khi danh sách dài. */
(function () {
  'use strict';
  function mount(root) {
    if (root.dataset.ttbBrandsReady) return;
    var viewport = root.querySelector('[data-ttb-brands-viewport]');
    var track = root.querySelector('[data-ttb-brands-track]');
    var source = root.querySelector('[data-ttb-brands-data]');
    var button = root.querySelector('[data-ttb-brands-toggle]');
    var label = root.querySelector('[data-ttb-brands-toggle-label]');
    var prev = root.querySelector('[data-ttb-brands-prev]');
    var next = root.querySelector('[data-ttb-brands-next]');
    if (!viewport || !track || !source || !button || !label || !prev || !next) return;
    if (!source.content) return;
    var brands = Array.prototype.map.call(source.content.querySelectorAll('a'), function (link) {
      return { name: link.getAttribute('data-name'), url: link.getAttribute('href'), image: link.getAttribute('data-image') || '' };
    });
    brands = brands.filter(function (brand) {
  	return brand && typeof brand.name === 'string' && brand.name.trim() &&
    typeof brand.url === 'string' && /^\/(?!\/)/.test(brand.url) &&
    typeof brand.image === 'string' && brand.image.trim();
	});
    if (!brands.length) return;
    root.dataset.ttbBrandsReady = 'true';
    var speed = Math.max(8, Math.min(160, parseFloat(root.dataset.speed) || 28));
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
    var manualPause = false, hovering = false, holding = false, interacting = false;
    var focused = false, visible = !('IntersectionObserver' in window);
    var frame = 0, previousTime = 0, resumeTimer = 0, resizeFrame = 0;
    var position = 0, stride = 170, bandWidth = 0, bandSize = 0, anchor = 0;
    var looping = false, normalized = false;
    function index(value) { return ((value % brands.length) + brands.length) % brands.length; }
    function makeGroup(start, count) {
      var list = document.createElement('ul');
      list.className = 'ttb-brands__group';
      for (var i = 0; i < count; i++) {
        var at = index(start + i), brand = brands[at];
        var item = document.createElement('li');
        item.className = 'ttb-brands__item';
        item.setAttribute('aria-setsize', String(brands.length));
        item.setAttribute('aria-posinset', String(at + 1));
        var link = document.createElement('a');
        link.className = 'ttb-brands__card';
        link.href = brand.url;
        link.setAttribute('aria-label', 'Xem sản phẩm thương hiệu ' + brand.name);
        if (typeof brand.image === 'string' && /^(https?:\/\/|\/\/|\/|\.\.?\/)/.test(brand.image) && brand.image) {
          var img = document.createElement('img');
          img.className = 'ttb-brands__logo';
          img.src = brand.image;
          img.alt = brand.name;
          img.width = 132; img.height = 46;
          img.loading = 'lazy'; img.decoding = 'async'; img.draggable = false;
          link.appendChild(img);
        } else link.classList.add('ttb-brands__card--text');
        var name = document.createElement('span');
        name.className = 'ttb-brands__name';
        name.textContent = brand.name;
        link.appendChild(name); item.appendChild(link); list.appendChild(item);
      }
      return list;
    }
    function markBuffers() {
      Array.prototype.forEach.call(track.children, function (group, at) {
        var buffer = looping && at !== 1;
        if (buffer) group.setAttribute('aria-hidden', 'true');
        else group.removeAttribute('aria-hidden');
        Array.prototype.forEach.call(group.querySelectorAll('a'), function (link) {
          if (buffer) link.setAttribute('tabindex', '-1');
          else link.removeAttribute('tabindex');
        });
      });
    }
    function normalize() {
      if (!looping || !bandWidth || normalized || focused) return;
      normalized = true;
      var value = viewport.scrollLeft, rebased = false;
      if (value >= bandWidth * 2) {
        anchor = index(anchor + bandSize);
        track.removeChild(track.firstElementChild);
        track.appendChild(makeGroup(anchor + bandSize, bandSize));
        value -= bandWidth; rebased = true; markBuffers();
      } else if (value < bandWidth * 0.5) {
        anchor = index(anchor - bandSize);
        track.removeChild(track.lastElementChild);
        track.insertBefore(makeGroup(anchor - bandSize, bandSize), track.firstElementChild);
        value += bandWidth; rebased = true; markBuffers();
      }
      if (rebased) { viewport.scrollLeft = value; position = value; }
      normalized = false;
    }
    function shouldRun() {
      return looping && visible && !document.hidden && !reducedMotion.matches &&
        !manualPause && !hovering && !holding && !interacting && !focused;
    }
    function stop() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0; previousTime = 0;
    }
    function tick(time) {
      frame = 0;
      if (!shouldRun()) { previousTime = 0; return; }
      if (previousTime) {
        position += speed * Math.min(time - previousTime, 64) / 1000;
        viewport.scrollLeft = position;
        if (position >= bandWidth * 2) normalize();
      }
      previousTime = time;
      frame = window.requestAnimationFrame(tick);
    }
    function update() {
      button.hidden = !looping || reducedMotion.matches;
      prev.hidden = next.hidden = !looping;
      button.setAttribute('aria-pressed', manualPause ? 'true' : 'false');
      label.textContent = manualPause ? 'Tiếp tục' : 'Tạm dừng';
      if (shouldRun()) {
        if (!frame) {
          position = viewport.scrollLeft; previousTime = 0;
          frame = window.requestAnimationFrame(tick);
        }
      } else stop();
    }
    function measure() {
      stop();
      if (looping && bandWidth) anchor = index(anchor + Math.floor((viewport.scrollLeft - bandWidth) / stride));
      var css = window.getComputedStyle(root);
      var cardWidth = parseFloat(css.getPropertyValue('--ttb-brand-width')) || 156;
      var gap = parseFloat(css.getPropertyValue('--ttb-brand-gap')) || 14;
      stride = cardWidth + gap;
      looping = brands.length * stride - gap > viewport.clientWidth + 1;
      bandSize = Math.min(brands.length, Math.ceil(viewport.clientWidth / stride) + 2);
      track.textContent = '';
      if (looping) {
        track.appendChild(makeGroup(anchor - bandSize, bandSize));
        track.appendChild(makeGroup(anchor, bandSize));
        track.appendChild(makeGroup(anchor + bandSize, bandSize));
        bandWidth = track.children[1].getBoundingClientRect().width || bandSize * stride;
        viewport.scrollLeft = bandWidth;
      } else {
        anchor = 0; bandWidth = 0;
        track.appendChild(makeGroup(0, brands.length)); viewport.scrollLeft = 0;
      }
      root.classList.toggle('is-looping', looping);
      markBuffers();
      focused = viewport.contains(document.activeElement);
      position = viewport.scrollLeft; update();
    }
    function interact() {
      window.clearTimeout(resumeTimer); interacting = true; update();
      resumeTimer = window.setTimeout(function () { interacting = false; update(); }, 1800);
    }
    button.addEventListener('click', function () { manualPause = !manualPause; update(); });
    function step(direction) {
      interact();
      if (typeof viewport.scrollBy === 'function') {
        viewport.scrollBy({ left: direction * stride, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
      } else { viewport.scrollLeft += direction * stride; normalize(); }
    }
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    viewport.addEventListener('mouseenter', function () { hovering = hoverCapable.matches; update(); });
    viewport.addEventListener('mouseleave', function () { hovering = false; update(); });
    viewport.addEventListener('focusin', function () { focused = true; update(); });
    viewport.addEventListener('focusout', function () {
      window.setTimeout(function () { focused = viewport.contains(document.activeElement); normalize(); update(); }, 0);
    });
    viewport.addEventListener('pointerdown', function () { holding = true; update(); }, { passive: true });
    function release() { if (!holding) return; holding = false; interact(); }
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('pointercancel', release, { passive: true });
    viewport.addEventListener('wheel', interact, { passive: true });
    viewport.addEventListener('scroll', function () {
      normalize();
      if (holding || interacting || focused || manualPause || reducedMotion.matches) {
        position = viewport.scrollLeft;
        if (interacting && !holding) interact();
      }
    }, { passive: true });
    viewport.addEventListener('error', function (event) {
      if (event.target.tagName !== 'IMG') return;
      var card = event.target.closest('.ttb-brands__card');
      if (card) card.classList.add('ttb-brands__card--fallback');
    }, true);
    document.addEventListener('visibilitychange', update);
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', update);
    else if (reducedMotion.addListener) reducedMotion.addListener(update);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; update(); }, { threshold: 0 }).observe(root);
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
        resizeFrame = window.requestAnimationFrame(function () { resizeFrame = 0; measure(); });
      }).observe(viewport);
    } else window.addEventListener('resize', measure);
    measure();
  }
  function init() { Array.prototype.forEach.call(document.querySelectorAll('[data-ttb-brands]'), mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
