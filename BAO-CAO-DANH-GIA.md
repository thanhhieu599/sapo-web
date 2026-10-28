# Báo cáo đánh giá theme trangthietbi.vn (Sapo – Ant Kitchen)

Ngày đánh giá: 28/10/2026. Phạm vi: 162 file (3 layout, 28 template, 80 snippet, 49 asset, 2 file cấu hình).

## 1. Kết luận nhanh

| Hạng mục | Hiện trạng | Mức ảnh hưởng |
|---|---|---|
| Khả năng mở rộng | 11 khối sản phẩm trang chủ là 11 bản copy. Muốn sửa 1 chi tiết phải sửa 11 file | Cao, **đã sửa** |
| SEO / AI trích dẫn | Schema doanh nghiệp sơ sài (thiếu tên pháp lý, địa chỉ, email; có link "#"). Sản phẩm "Liên hệ" khai báo giá 0đ với Google | Cao, **đã sửa** |
| Tốc độ | ~130 KB jQuery + plugin nhúng thẳng vào **mọi trang** (không cache được). 4 file SCSS chồng nhau (~340 KB) | Cao, cần làm đợt 2 |
| Rác kỹ thuật | 13 snippet + ~19 asset không còn dùng (~650 KB). 2 layout backup | Trung bình |
| Dữ liệu cấu hình | Còn dữ liệu demo: `support@bizweb.vn`, địa chỉ Hà Nội, SĐT `0123.456.7890`… (hiện **không hiển thị** ra web nhưng dễ lỡ tay bật lên) | Thấp |

## 2. Đã sửa trong đợt này

| # | Việc | File | Lợi ích |
|---|---|---|---|
| 1 | Gộp 11 khối "Nhóm sản phẩm" thành **1 khối dùng chung** `ttb-section-group-product`; 11 file cũ còn 3 dòng | `snippets/ttb-section-group-product.bwt` (mới), `snippets/section_group_product_1..11.bwt` | Sửa giao diện 1 lần áp dụng cả 11 nhóm. Thêm nhóm mới (vd: PPE ngành thực phẩm) chỉ mất 3 dòng code. Giảm ~900 dòng code |
| 2 | CSS banner trước nằm trong section 1 (tắt section 1 là vỡ giao diện 10 nhóm còn lại) → chuyển sang file CSS chung | `assets/ttb-home-products.css` | Hết lỗi phụ thuộc ẩn |
| 3 | Ảnh dự phòng banner nhóm 3–11 đang tải bản gốc (`master`, có thể vài MB) → dùng bản `large` như nhóm 1–2 | (trong khối dùng chung) | Trang chủ nhẹ hơn trên mobile |
| 4 | Schema Organization: dùng tên pháp lý **CÔNG TY TNHH TMDV PHÁT TRIỂN KỸ THUẬT D&T**, SĐT chuẩn quốc tế, email, địa chỉ HCM; bỏ link Twitter "#" | `snippets/evo-schema.bwt` | Google/ChatGPT/Gemini nhận diện đúng doanh nghiệp, là nền tảng để được AI trích dẫn |
| 5 | Sản phẩm giá "Liên hệ": thôi khai báo `price = 0` với Google | `templates/product.bwt`, `snippets/detail-inventory.bwt` | Tránh cảnh báo "giá sai" trong Search Console/Merchant Center, tránh hiển thị "0 ₫" trên kết quả tìm kiếm |
| 6 | Thương hiệu "Đang cập nhật" không còn khai báo là brand; brand thật khai báo đúng chuẩn `Brand + name`; MPN dùng SKU thay vì ID nội bộ | `templates/product.bwt` | Rich result sản phẩm chuẩn hơn (TOWA, 3M, Honeywell… được Google hiểu là brand) |
| 7 | Ảnh chia sẻ Facebook/Zalo dùng `https` thay vì `http`; escape tiêu đề có dấu ngoặc kép | `snippets/fb-open-graph-tags.bwt` | Ảnh preview hiển thị ổn định khi gửi link sản phẩm cho khách qua Zalo/Messenger |
| 8 | Gỡ Facebook Customer Chat (Meta đã khai tử 05/2024, web vẫn tải script chết sau 7 giây) | `layouts/theme.bwt` | Bớt 1 script thừa, bớt lỗi console |
| 9 | Bỏ khóa zoom trên mobile (`maximum-scale=1`); đưa khối `<style>` lạc ra ngoài `<head>` vào đúng chỗ | `layouts/theme.bwt` | Điểm Accessibility/Lighthouse, HTML hợp lệ |
| 10 | Bỏ thẻ `amphtml` vì robots.txt đang chặn `?view=` → Google báo lỗi AMP | `layouts/theme.bwt` | Tránh lỗi "AMP bị chặn bởi robots.txt" trong Search Console |
| 11 | robots.txt: bỏ dòng chặn `?page=` | `templates/robots.txt.bwt` | Google đi được trang 2, 3… của danh mục → sản phẩm sâu được index tốt hơn |
| 12 | Form báo giá: câu chú thích kỹ thuật ("Cloudinary unsigned preset…") hiển thị cho khách → thay bằng câu hướng dẫn khách gửi BOQ/bản vẽ | `snippets/footer.bwt` | Form RFQ chuyên nghiệp hơn với Purchasing FDI |

## 3. Đề xuất đợt 2 (cần anh duyệt, có rủi ro nên chưa làm)

**Ưu tiên A – Tốc độ (ảnh hưởng trực tiếp SEO & tỉ lệ chuyển đổi):**
1. `snippets/jquery.bwt` (130 KB: jQuery 2.2.3 + Owl Carousel) đang in thẳng vào HTML của mọi trang. Chuyển thành file asset để trình duyệt cache → mỗi trang nhẹ đi ~130 KB. jQuery 2.2.3 (2016) cũng có lỗ hổng bảo mật đã công bố.
2. Gộp 4 file CSS chồng nhau (`base`, `ant-kitchen`, `edit`, các file `pcx`/`appbulk`) và bỏ CSS không dùng.
3. Đoạn CSS/JS `pcx` (đánh giá, đã bán, đếm ngược) đang viết trong `theme.bwt` → tách ra `assets/pcx-sold.js`.
4. Bootstrap 3.3.7 & Font Awesome 4.7 tải từ `maxcdn.bootstrapcdn.com` (CDN cũ) → tự host trong assets.

**Ưu tiên B – Dọn dẹp (anh xóa trong Sapo sau khi đã có bản lưu trên GitHub):**
- Layout không dùng: `theme-abds-bak.bwt`, `theme-absp-bak.bwt`.
- Snippet không dùng: `aside-blog-recent`, `bootstrap.min.css` (124 KB), `css-amp`, `js-amp`, `iwish`, `modal-ajax-cart`, `products-list-item`, `search-bar`, `section_banner`, `section_bestsell`, `section_feature_category`, `section_tab_product`, `social-link`.
- Asset không được gọi: `important_plugin.js` (154 KB), `jquery-2.2.3.min.js`, `owl.carousel.min.js/css`, `main.scss`, `style.scss`, `responsive.scss`, `module.scss`, `update.scss`, `mains.js`, `tilt.jquery.min.js`, `iwish.css`, `print.css`, `recentview.js`, `ajaxify.min.js`, `jquery.sticky.js`, `jquery.fancybox.scss`, `bpr-products-module.scss`, `font.css`.
- Kiểm tra trước khi xóa: anh chụp màn hình trang chủ, trang sản phẩm, danh mục; xóa; so lại.

**Ưu tiên C – Cấu hình (anh tự sửa trong "Tùy chỉnh giao diện", không cần code):**
- Link Facebook đang là `...facebook.com/trangthietbi.vn/?modal=admin_todo_tour` → bỏ phần `?modal=...`.
- Kênh YouTube đang nhập nhầm vào ô **Pinterest** → chuyển sang ô **YouTube** (schema sẽ tự nhận).
- Ô Twitter, Google+, Instagram đang là `#` → để trống.
- Xóa dữ liệu demo: `support@bizweb.vn`, `(04) 7308 6880`, `0123.456.7890`, `01225 510 043`, địa chỉ "Hanoi Group 442 Đội Cấn".
- Search Console: có 3 mã `google-site-verification` → giữ mã đang dùng, bỏ 2 mã thừa.

**Ưu tiên D – Tăng lead B2B (mở rộng trên nền khối dùng chung):**
- Trang ngành: "PPE cho nhà máy điện tử (ESD)", "PPE nhà máy thực phẩm (HACCP)", "PPE nhà máy thép / dầu khí": 1 template `page.nganh.bwt` dùng lại khối nhóm sản phẩm + form RFQ + FAQ schema.
- Trang sản phẩm: bảng **tiêu chuẩn** (EN 388, EN ISO 374, EN ISO 20345, ANSI Z87.1, EN 149 / NIOSH N95…) lấy từ thẻ (tag) sản phẩm → đúng thứ QA/EHS cần, và là nội dung AI hay trích dẫn.
- H1 trang chủ đang ẩn (`class="hidden"`) → H1 hiển thị, chứa từ khóa chính "Nhà cung cấp bảo hộ lao động & vật tư MRO cho nhà máy FDI".
- `templates/product.color.bwt` là bản copy 26 KB của `product.bwt` → nếu không sản phẩm nào dùng, xóa để tránh sửa 2 nơi.
