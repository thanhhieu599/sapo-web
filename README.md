# Theme trangthietbi.vn (Sapo – Ant Kitchen)

Bản lưu mã nguồn giao diện website trangthietbi.vn, xuất từ trình chỉnh sửa giao diện Sapo.
Cấu trúc thư mục giống hệt cột trái trong Sapo: `layouts/`, `templates/`, `snippets/`, `assets/`, `config/`.

- Báo cáo đánh giá và lộ trình: [BAO-CAO-DANH-GIA.md](BAO-CAO-DANH-GIA.md)
- Bản gốc chưa sửa: commit `02a30fe` ("original snapshot"). Muốn khôi phục file nào, lấy nội dung ở commit đó.

## Cập nhật đợt 1 lên Sapo (khoảng 20 phút)

**Bước 0 – An toàn:** Sapo Admin → Website → Giao diện → **Sao chép** giao diện Ant Kitchen. Sửa trên **bản sao**, xem trước, ổn mới **Xuất bản**. Bản đang chạy giữ nguyên làm phương án quay lại.

**Bước 1 – Dán theo đúng thứ tự** (mở file trong Sapo → Ctrl+A → dán nội dung file tương ứng ở đây → Lưu):

| Thứ tự | File trong Sapo | Ghi chú |
|---|---|---|
| 1 | `assets/ttb-home-products.css` | Làm trước, vì CSS banner được chuyển vào đây |
| 2 | `snippets/ttb-section-group-product.bwt` | **File mới**: Snippets → "Thêm mới snippet" → tên `ttb-section-group-product` |
| 3 | `snippets/section_group_product_1.bwt` … `_11.bwt` | 11 file, mỗi file còn 3 dòng |
| 4 | `snippets/evo-schema.bwt` | Schema doanh nghiệp |
| 5 | `snippets/fb-open-graph-tags.bwt` | Ảnh chia sẻ https |
| 6 | `snippets/detail-inventory.bwt` | |
| 7 | `templates/product.bwt` | Schema sản phẩm |
| 8 | `snippets/footer.bwt` | Câu chú thích form báo giá |
| 9 | `layouts/theme.bwt` | Khung trang |
| 10 | `templates/robots.txt.bwt` | |

**Bước 2 – Kiểm tra trên bản xem trước:**
- [ ] Trang chủ: đủ 11 nhóm (Găng tay TOWA, Tủ – thùng đồ nghề, Giày bảo hộ, …), đúng tiêu đề, banner, nút "Xem tất cả"; xem cả trên điện thoại.
- [ ] 1 sản phẩm có giá và 1 sản phẩm "Liên hệ": hiển thị như cũ, nút "Yêu cầu báo giá" mở form.
- [ ] Menu "Thương hiệu" vẫn không xổ xuống.
- [ ] Dán link 1 sản phẩm vào https://search.google.com/test/rich-results → không có lỗi đỏ.
- [ ] Dán link vào https://developers.facebook.com/tools/debug/ → hiện ảnh sản phẩm.

## Thêm 1 nhóm sản phẩm mới trên trang chủ (sau khi refactor)

1. Tạo snippet `section_group_product_12` với 3 dòng:
   ```liquid
   {% assign ttb_group_index = '12' %}
   {% include 'ttb-section-group-product' %}
   ```
2. Trong `config/settings_schema.json`: copy khối "Trang chủ - Nhóm sản phẩm 11", đổi số 11 → 12, và thêm `section_group_product_12` vào danh sách lựa chọn của các ô `home_section_*`.
3. Tải ảnh banner `group_product_banner_12.jpg` vào Assets (không bắt buộc, không có thì tự lấy ảnh danh mục).

## Quy ước khi sửa tiếp

- Mỗi lần sửa trên Sapo, cập nhật lại file tương ứng ở đây để GitHub luôn là bản mới nhất.
- File mới do D&T thêm dùng tiền tố `ttb-` để phân biệt với file gốc của theme.
- Không viết CSS/JS trực tiếp trong snippet; đưa vào `assets/` để trình duyệt cache được.

---

## Cập nhật đợt 2 – Tốc độ, responsive, dọn code (nhánh `toi-uu-dot-2`)

**Làm sau khi đợt 1 đã chạy ổn.** Vẫn làm trên **bản sao giao diện** trước.

**Bước 1 – Tạo 3 file asset mới** (Assets → "Thêm mới asset"/tải lên, đúng tên):

| Thứ tự | File | Nội dung |
|---|---|---|
| 1 | `assets/ttb-vendor.js` | jQuery + Owl Carousel, trước nằm trong snippet `jquery` |
| 2 | `assets/ttb-pcx.css` | Giao diện đánh giá / đã bán / đếm ngược trên thẻ sản phẩm |
| 3 | `assets/ttb-responsive.css` | Chống vỡ khung trên điện thoại cho mô tả SP, bài viết |

**Bước 2 – Dán đè 6 file:**

| Thứ tự | File |
|---|---|
| 4 | `snippets/product-grid-item.bwt` |
| 5 | `snippets/section_slider.bwt` |
| 6 | `snippets/footer.bwt` |
| 7 | `templates/product.bwt` |
| 8 | `templates/article.bwt` |
| 9 | `layouts/theme.bwt` (**dán cuối cùng**, vì file này gọi 3 asset ở bước 1) |

**Bước 3 – Kiểm tra trên bản xem trước** (máy tính + điện thoại):
- [ ] Slider trang chủ chạy, các khối sản phẩm trượt được (Owl Carousel).
- [ ] Thẻ sản phẩm: ảnh hiện, ô đánh giá/đã bán, nút +/- số lượng, đồng hồ đếm ngược.
- [ ] Trang sản phẩm: bấm ảnh nhỏ đổi ảnh lớn, zoom ảnh, chọn phiên bản, thêm giỏ hàng.
- [ ] Chân trang: cuộn xuống thì khung Facebook Fanpage hiện ra.
- [ ] Form báo giá trên iPhone: bấm vào ô nhập không bị phóng to màn hình.
- [ ] Mở Console (F12) không có lỗi đỏ mới.

**Bước 4 – Xóa file thừa trong Sapo** (sau khi bản sao chạy ổn 1–2 ngày):
- Layouts: `theme-abds-bak`, `theme-absp-bak`
- Templates: `article.amp`
- Snippets: `aside-blog-recent`, `bootstrap.min.css`, `css-amp`, `js-amp`, `iwish`, `modal-ajax-cart`, `products-list-item`, `search-bar`, `section_banner`, `section_bestsell`, `section_feature_category`, `section_tab_product`, `social-link`
- Assets: `ajaxify.min.js`, `bpr-products-module.scss`, `font.css`, `important_plugin.js`, `iwish.css`, `jquery-2.2.3.min.js`, `jquery.fancybox.scss`, `jquery.sticky.js`, `main.scss`, `mains.js`, `module.scss`, `owl.carousel.min.css`, `owl.carousel.min.js`, `print.css`, `recentview.js`, `responsive.scss`, `style.scss`, `tilt.jquery.min.js`, `update.scss`
- Snippet `jquery` **giữ lại 2 tuần** làm phương án quay lại, sau đó xóa.

**Quay lại nếu lỗi:** trong `layouts/theme.bwt`, thay dòng `<script src="{{ 'ttb-vendor.js' | asset_url }}"></script>` bằng `{% include 'jquery' %}`.
