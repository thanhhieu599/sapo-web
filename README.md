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
