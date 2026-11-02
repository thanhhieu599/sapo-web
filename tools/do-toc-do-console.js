(async () => {
  const ok = (v, good, poor) => v <= good ? '🟢 Tốt' : v <= poor ? '🟠 Cần cải thiện' : '🔴 Kém';
  const KB = b => (b / 1024).toFixed(1) + ' KB';
  const ms = v => Math.round(v) + ' ms';
  const get = type => new Promise(res => {
    const list = [];
    try {
      const po = new PerformanceObserver(l => list.push(...l.getEntries()));
      po.observe({ type, buffered: true });
      setTimeout(() => { po.disconnect(); res(list); }, 300);
    } catch (e) { res(list); }
  });

  const nav = performance.getEntriesByType('navigation')[0] || {};
  const paints = performance.getEntriesByType('paint');
  const fcp = (paints.find(p => p.name === 'first-contentful-paint') || {}).startTime || 0;
  const lcpList = await get('largest-contentful-paint');
  const lcpE = lcpList[lcpList.length - 1];
  const lcp = lcpE ? lcpE.startTime : 0;
  let cls = 0; (await get('layout-shift')).forEach(e => { if (!e.hadRecentInput) cls += e.value; });
  const longs = await get('longtask');
  const tbt = longs.reduce((s, t) => s + Math.max(0, t.duration - 50), 0);

  console.log('%c⏱ ĐO TỐC ĐỘ – ' + location.pathname, 'font-size:16px;font-weight:bold;color:#114773');
  console.table({
    'TTFB (máy chủ phản hồi)': { 'Giá trị': ms(nav.responseStart || 0), 'Đánh giá': ok(nav.responseStart || 0, 800, 1800) },
    'FCP (thấy nội dung đầu tiên)': { 'Giá trị': ms(fcp), 'Đánh giá': ok(fcp, 1800, 3000) },
    'LCP (thấy nội dung chính)': { 'Giá trị': ms(lcp), 'Đánh giá': ok(lcp, 2500, 4000) },
    'CLS (giật bố cục)': { 'Giá trị': cls.toFixed(3), 'Đánh giá': ok(cls, 0.1, 0.25) },
    'TBT ước tính (trang bị đơ)': { 'Giá trị': longs.length ? ms(tbt) : 'n/a', 'Đánh giá': longs.length ? ok(tbt, 200, 600) : 'Chạy lại sau khi tải lại trang' },
    'Tải xong (onload)': { 'Giá trị': ms(nav.loadEventEnd || 0), 'Đánh giá': '' }
  });
  if (lcpE) console.log('Phần tử LCP:', lcpE.element || lcpE.url, '| Ảnh:', lcpE.url || '(chữ)');

  const res = performance.getEntriesByType('resource');
  const groups = {};
  res.forEach(r => {
    const t = /\.css(\?|$)/.test(r.name) || r.initiatorType === 'link' ? 'CSS'
      : /\.js(\?|$)/.test(r.name) || r.initiatorType === 'script' ? 'JavaScript'
      : /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(r.name) || r.initiatorType === 'img' ? 'Ảnh'
      : /\.(woff2?|ttf|otf)(\?|$)/.test(r.name) ? 'Font' : 'Khác';
    const g = groups[t] || (groups[t] = { 'Số file': 0, bytes: 0 });
    g['Số file']++; g.bytes += r.transferSize || r.encodedBodySize || 0;
  });
  const html = nav.transferSize || nav.encodedBodySize || 0;
  let total = html;
  const rows = { 'HTML trang': { 'Số file': 1, 'Dung lượng': KB(html) } };
  Object.keys(groups).forEach(k => { total += groups[k].bytes; rows[k] = { 'Số file': groups[k]['Số file'], 'Dung lượng': KB(groups[k].bytes) }; });
  rows['TỔNG'] = { 'Số file': res.length + 1, 'Dung lượng': KB(total) };
  console.log('%c📦 Dung lượng tải về', 'font-weight:bold');
  console.table(rows);

  const host = u => { try { return new URL(u).host; } catch (e) { return ''; } };
  console.log('%c🐢 10 file tải lâu nhất', 'font-weight:bold');
  console.table(res.slice().sort((a, b) => b.duration - a.duration).slice(0, 10).map(r => ({
    'File': r.name.split('/').pop().split('?')[0].slice(0, 45), 'Máy chủ': host(r.name),
    'Thời gian': ms(r.duration), 'Dung lượng': KB(r.transferSize || r.encodedBodySize || 0),
    'Chặn hiển thị': r.renderBlockingStatus === 'blocking' ? '⚠️ CÓ' : ''
  })));
  console.log('%c🏋️ 10 file nặng nhất', 'font-weight:bold');
  console.table(res.slice().sort((a, b) => (b.transferSize || b.encodedBodySize || 0) - (a.transferSize || a.encodedBodySize || 0)).slice(0, 10).map(r => ({
    'File': r.name.split('/').pop().split('?')[0].slice(0, 45), 'Máy chủ': host(r.name),
    'Dung lượng': KB(r.transferSize || r.encodedBodySize || 0), 'Thời gian': ms(r.duration)
  })));
  const blocking = res.filter(r => r.renderBlockingStatus === 'blocking');
  console.log('⚠️ Số file chặn hiển thị:', blocking.length, blocking.map(r => r.name.split('/').pop().split('?')[0]));
  console.log('Ghi chú: số liệu đo trên máy & mạng của anh. Để so sánh trước/sau, luôn đo bằng cùng máy, Ctrl+Shift+R tải lại rồi chạy lại đoạn này.');
})();
