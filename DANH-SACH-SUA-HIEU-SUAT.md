# Danh sách chỉnh sửa hiệu suất & SEO – trangthietbi.vn

Dựa trên bản theme đang chạy (xuất ngày 02/11/2026) và kết quả PageSpeed (di động) anh gửi.
Số dòng tính theo bản đang chạy. Mỗi mục: **Vị trí → Lỗi → Cách sửa → Giải pháp thay thế** (nếu không muốn sửa code).

Quy ước mức độ: 🔴 ảnh hưởng lớn · 🟠 vừa · 🟢 nhỏ / dọn dẹp.
Luôn sửa trên **bản sao giao diện**, xem trước rồi mới xuất bản.

---

## A. JavaScript nặng

### A1 🔴 `assets/ttb-brands.js` – dải logo thương hiệu (1,8 giây CPU)
- **Lỗi:** dịch logo bằng JavaScript 60 lần/giây; dựng lại cả dải khi khung đổi kích thước.
- **Sửa:** thay toàn bộ `ttb-brands.js` + thêm khối CSS cuối `ttb-brands.css` (đã gửi trong chat / file trên nhánh `ban-dang-chay-2026-11-02`).
- **Thay thế:** bỏ chạy tự động – xóa dòng `<script src="{{ 'ttb-brands.js' | asset_url }}" defer></script>` cuối `snippets/section_brands.bwt`; dải logo thành danh sách vuốt tay (CSS hiện có đã hỗ trợ cuộn ngang). CPU gần như 0.

### A2 🔴 `layouts/theme.bwt` dòng 50 – jQuery 130 KB in thẳng vào HTML
- **Lỗi:** HTML trang chủ nặng 145 KB, tải 1,95 giây; không cache được giữa các trang. Lỗi "Buộc chỉnh lại luồng" ở `trangthietbi.vn:57/58` nằm trong đoạn này (Owl Carousel).
- **Sửa:**
  1. Assets → Thêm mới asset `ttb-vendor.js` → dán nội dung **snippets/jquery.bwt, bỏ dòng đầu `<script>` và dòng cuối `</script>`** (hoặc lấy file `assets/ttb-vendor.js` trên nhánh `toi-uu-dot-2`).
  2. Dòng 50 `{% include 'jquery' %}` →
     ```liquid
     <script src="{{ 'ttb-vendor.js' | asset_url }}"></script>
     ```
- **Quay lại nếu lỗi:** đổi dòng trên về `{% include 'jquery' %}`.

### A3 🟠 `snippets/loyalty.bwt` dòng 21 – script tích điểm chặn trang
- **Sửa:** thêm `defer`:
  ```html
  <script src="https://loyalty.sapocorp.net/api/loyalty.js?alias={{ store.domain }}" defer></script>
  ```
- **Thay thế:** nếu D&T không dùng chương trình tích điểm → xóa dòng 169 `{% include 'loyalty' %}` trong `theme.bwt` và gỡ app Loyalty trong Sapo.

### A4 🟠 `snippets/footer.bwt` dòng 184–188 – Facebook SDK (~200 KB) gần như tải ngay
- **Lỗi:** tải khi có `mousemove` → trên máy tính là tải ngay lập tức.
- **Sửa:** thay đoạn `['scroll', 'mousemove', 'touchstart'].forEach(...)` (dòng 184–188) bằng:
  ```javascript
  var box = document.querySelector('.fb-page');
  if (box && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { io.disconnect(); loadFB(); }
    }, { rootMargin: '400px' });
    io.observe(box);
  } else { window.addEventListener('load', loadFB); }
  ```
  → chỉ tải khi khách cuộn gần chân trang.
- **Thay thế:** bỏ khung Fanpage, thay bằng 1 nút ảnh "Theo dõi Facebook" (0 KB JavaScript).

### A5 🟠 `layouts/theme.bwt` dòng 127–132 – Xem nhanh (quickview) 26 KB trên mọi trang
- **Thay thế không cần code:** Tùy chỉnh giao diện → Thiết lập chung → bỏ tick **"Dùng quickview"**. Khách B2B thường bấm thẳng vào sản phẩm.

### A6 🟢 `layouts/theme.bwt` dòng 109 – `rx.all.min.js` (38 KB, gợi ý tìm kiếm)
- **Thay thế không cần code:** nếu không cần gợi ý khi gõ ô tìm kiếm → Tùy chỉnh giao diện → **Đầu trang** → bỏ tick **"Dùng gợi ý tìm kiếm"**.

### A7 🟢 `layouts/theme.bwt` dòng 57–67 – đoạn chặn Zotabox
- **Lỗi:** sửa hàm hệ thống `insertBefore` của trình duyệt, chặn không triệt để.
- **Thay thế (nên làm):** Sapo Admin → Ứng dụng → **gỡ app Zotabox** → xóa dòng 57–67.

### A8 🟢 `snippets/popup-dang-ky.bwt` dòng 120 – popup lặp mỗi 5 phút
- **Sửa:** `repeatDelay: 300` → `repeatDelay: 86400` (1 lần/ngày).

---

## B. CSS chặn hiển thị

### B1 🟠 `layouts/theme.bwt` dòng 41, 44, 47 – khai báo CSS 2 lần
- **Sửa:** xóa 3 dòng `<link rel="preload" as="style" ...>` (giữ dòng `stylesheet_tag` ngay dưới).

### B2 🟠 `layouts/theme.bwt` dòng 74–75 – CSS app chặn 0,8–0,9 giây/file
- **Sửa:** thay 2 dòng bằng:
  ```html
  <link rel="stylesheet" href="{{ 'appbulk-selling-products.css' | asset_url }}" media="print" onload="this.media='all'">
  <link rel="stylesheet" href="{{ 'appbulk-product-statistics.css' | asset_url }}" media="print" onload="this.media='all'">
  ```

### B3 🟠 `layouts/theme.bwt` dòng 79 – Google Fonts chặn 750 ms, chuỗi tải dài 4,1 giây
- **Sửa:**
  ```html
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
  ```
- **Thay thế:** bỏ hẳn Google Fonts (xóa dòng 77–79), để `ttb-typography.css` dùng font hệ thống (Windows: Segoe UI, Android: Roboto có sẵn). Nhanh nhất, chữ hơi khác nhau giữa máy.

### B4 🟠 `layouts/theme.bwt` dòng 173–220 – CSS thẻ sản phẩm do JavaScript chèn
- **Lỗi:** CSS `.pcx-*` được JavaScript chèn sau khi trang tải → thẻ sản phẩm "nhảy" (CLS).
- **Sửa:**
  1. Tạo asset `ttb-pcx.css` (lấy trên nhánh `toi-uu-dot-2`).
  2. Thêm sau dòng 76: `{{ 'ttb-pcx.css' | asset_url | stylesheet_tag }}`
  3. Trong `<script>` dòng 177–198: xóa từ `var css = ...` đến hết dòng `var st = document.createElement('style'); ...`.

### B5 🟢 CSS không dùng (PageSpeed: 74 KB) – `base.scss`, `ant-kitchen.scss`, Bootstrap 3, `bpr.min.css`
- **Không nên tự sửa tay** (rủi ro vỡ giao diện). Giải pháp dài hạn: gộp & lọc CSS bằng công cụ (PurgeCSS) trong 1 đợt riêng, kiểm tra từng trang.

---

## C. Ảnh

| # | Vị trí | Lỗi | Sửa |
|---|---|---|---|
| C1 🔴 | `snippets/product-grid-item.bwt` dòng 107 | `src` là `loaders.svg`, ảnh thật chờ JavaScript | `src="{{ product.featured_image.src \| img_url: 'medium' }}"` |
| C2 🔴 | `layouts/theme.bwt` sau dòng 14 | Ảnh slider đầu (LCP) phát hiện trễ 1,5 giây | Thêm: `{% if template == 'index' and settings.slider_1_enable %}<link rel="preload" as="image" href="{{ 'slider_1_new.jpg' \| asset_url \| img_url: '1024x1024' }}" fetchpriority="high">{% endif %}` |
| C3 🔴 | `snippets/section_group_product_1..11.bwt` dòng 61 (file 1) / 51 (file 2–11) | Banner tải ảnh gốc 24–94 KB | `{{ 'group_product_banner_N.jpg' \| asset_url \| img_url: 'grande' }}`; dòng kế: `'master'` → `'large'` |
| C4 🟠 | `snippets/section_brands.bwt` dòng 43 | Logo tải 240px, hiển thị 132px | `img_url: 'medium'` → `img_url: 'compact'` |
| C5 🟠 | `snippets/section_blogs.bwt` dòng 21; `templates/blog.bwt` dòng 33, 55; `templates/article.bwt` dòng 104; `snippets/sidebar-blog.bwt` dòng 29 | Ảnh bài viết chờ JavaScript (`loaders.svg`) | `src` = ảnh thật + `loading="lazy" decoding="async"` |
| C6 🟢 | `snippets/chatzalo.bwt` dòng 3 | Thiếu kích thước | Thêm `width="50" height="50" loading="lazy"` |
| C7 🟢 | `snippets/footer.bwt` dòng 167 | Logo Bộ Công Thương tải ngay | Thêm `loading="lazy" decoding="async"` |
| C8 🟢 | `snippets/section_category.bwt` dòng 18, 45 | Icon thiếu kích thước | Thêm `width="24" height="24" loading="lazy"` |
| C9 🔴 | **Không phải code** – file ảnh | `slider_1..5_new.jpg` 82–142 KB; `group_product_banner_1/4` 94/83 KB; ảnh sản phẩm đến 70 KB | Nén bằng squoosh.app (MozJPEG 70–75, rộng ≤ 1024px), tải lại đúng tên. Mục tiêu slider ≤ 60 KB, banner ≤ 40 KB |
| C10 🟢 | `templates/page.guide.bwt` | Trang hướng dẫn demo của theme, 26 ảnh ngoài | Xóa template nếu không trang nào dùng |

---

## D. SEO kỹ thuật

| # | Vị trí | Lỗi | Sửa |
|---|---|---|---|
| D1 🔴 | `templates/robots.txt.bwt` dòng 14 | `Disallow: /*?page=` chặn Google đọc trang 2, 3… của danh mục | Xóa dòng 14 |
| D2 🟠 | `layouts/theme.bwt` dòng 27–29 | `amphtml` trỏ tới `?view=amp` – trang bị robots.txt (dòng 13) chặn → lỗi AMP | Xóa 3 dòng 27–29 |
| D3 🟠 | `templates/product.bwt` dòng 177 | Sản phẩm "Liên hệ" khai báo giá 0 với Google | Xóa dòng `<meta itemprop="price" content="0">` và dòng `priceCurrency` ngay dưới (bản sửa đầy đủ có trên nhánh `main`) |
| D4 🟢 | `templates/product.bwt` dòng 15, 138, 141 | `mpn` = ID nội bộ; brand sai kiểu (`schema.org/brand`), "Đang cập nhật" khai báo là brand | Theo bản trên nhánh `main` (commit tối ưu đợt 1) |
| D5 🟢 | `snippets/fb-open-graph-tags.bwt` dòng 5, 15, 22, 30 | Ảnh chia sẻ dùng `http:` | Đổi `content="http:` → `content="https:` |
| D6 🟢 | `snippets/footer.bwt` dòng 190 | Link Fanpage có `?modal=admin_todo_tour` | Sửa link trong Tùy chỉnh giao diện, hoặc `{{ settings.social_facebook_link \| split: '?' \| first }}` |
| D7 🟢 | `layouts/theme.bwt` dòng 10–12 | 3 mã xác minh Google | Giữ mã đang dùng trong Search Console, xóa mã thừa |
| D8 🟢 | `layouts/theme.bwt` dòng 15 | Tiêu đề trang lọc thẻ có chữ "tagged" | `tagged "{{ current_tags \| join: ', ' }}"` → `- {{ current_tags \| join: ', ' }}` |
| D9 🟢 | `snippets/footer.bwt` dòng 284 | Form báo giá hiện chữ kỹ thuật "Cloudinary unsigned preset…" cho khách | Thay bằng: "Đính kèm danh sách vật tư (BOQ), bản vẽ hoặc ảnh mẫu để nhận báo giá chính xác." |

---

## E. Không sửa được trong theme – giải pháp thay thế

| Mục PageSpeed | Nguồn | Giải pháp |
|---|---|---|
| `productreviews.min.js` 93 KB, `bpr.min.css` 19 KB, font FontAwesome 76 KB (tải lần 2) | App Đánh giá sản phẩm | Cài đặt app: chỉ hiện ở trang sản phẩm (nếu có); hoặc thay app bằng đánh giá lưu trong metafield |
| `ab_productstatistics_scripttag` 423 ms CPU | App Thống kê sản phẩm | Tắt widget hiển thị của app (giữ app để `pcx-sold.js` lấy số "Đã bán"); kiểm tra lại số "Đã bán" sau khi tắt |
| `ab_sellingproducts_scripttag` | App Sản phẩm bán chạy | Nếu không dùng khối "bán chạy" của app → gỡ app, xóa `{% include 'appbulk-selling-products' %}` |
| `stats.min.js`, `fp.v3.3.0.min.js` | Hệ thống Sapo | Không chỉnh được |
| Thời gian cache ngắn (None / 4 giờ / 1 ngày) | Máy chủ Sapo & app | Không chỉnh được trong theme |
| `gtag G-GP7GSEHX88` 178 KB | Google Analytics | Giữ (cần đo lường) |

---

## Thứ tự làm đề xuất

1. **A1** (dải logo) – lớn nhất, chỉ thay 2 file
2. **C9** (nén ảnh) – không đụng code
3. **C1, C2, C3** (ảnh sản phẩm, slider, banner)
4. **A2** (jQuery ra file riêng)
5. **B1, B2, B3** (CSS/font chặn hiển thị)
6. **D1, D2, D3** (SEO)
7. Các mục 🟢 còn lại

Sau bước 3 và bước 5: chạy lại https://pagespeed.web.dev (Di động) để so sánh.
