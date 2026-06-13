# Tài liệu đặc tả màn hình

## 1. Thông tin chung

### Tên màn hình

<!-- Ví dụ: Quản lý nhân viên -->

### Route

```text
/path
```

### Mục đích

Mô tả ngắn gọn mục đích của màn hình.

Ví dụ:

> Màn hình cho phép người dùng quản lý danh sách dữ liệu, tìm kiếm, thêm mới, chỉnh sửa và xóa dữ liệu.

---

## 2. Yêu cầu nghiệp vụ

### User Story

**Với vai trò là:** [Vai trò người dùng]

**Tôi muốn:** [Thao tác]

**Để:** [Mục đích]

### Tiêu chí hoàn thành (Acceptance Criteria)

- [ ] Hiển thị danh sách dữ liệu
- [ ] Hỗ trợ tìm kiếm
- [ ] Hỗ trợ phân trang
- [ ] Hỗ trợ thêm mới
- [ ] Hỗ trợ chỉnh sửa
- [ ] Hỗ trợ xóa
- [ ] Hiển thị trạng thái loading
- [ ] Hiển thị lỗi khi API thất bại

---

## 3. Thiết kế giao diện

### Ảnh thiết kế

Đính kèm:

- Link Figma:
- Screenshot:
- Link Prototype:

### Bố cục tổng thể

```text
------------------------------------------------
| Header                                        |
------------------------------------------------
| Bộ lọc / Tìm kiếm                             |
------------------------------------------------
| Danh sách dữ liệu                             |
|                                                |
|                                                |
------------------------------------------------
| Phân trang                                    |
------------------------------------------------
```

### Responsive

#### Desktop

Mô tả cách hiển thị trên Desktop.

#### Tablet

Mô tả cách hiển thị trên Tablet.

#### Mobile

Mô tả cách hiển thị trên Mobile.

---

## 4. Thành phần giao diện

### Header

#### Tiêu đề

```text
Tiêu đề màn hình
```

#### Mô tả

```text
Mô tả ngắn gọn chức năng màn hình
```

---

### Bộ lọc / Tìm kiếm

#### Danh sách trường

| Trường  | Loại   | Bắt buộc |
| ------- | ------ | -------- |
| Keyword | Input  | Không    |
| Status  | Select | Không    |

#### Hành vi

- Chỉ tìm kiếm khi nhấn nút Tìm kiếm
- Nhấn Đặt lại sẽ xóa toàn bộ điều kiện lọc

---

### Danh sách dữ liệu

#### Các cột

| Tên cột    | Mô tả        |
| ---------- | ------------ |
| ID         | Mã dữ liệu   |
| Name       | Tên dữ liệu  |
| Status     | Trạng thái   |
| Created At | Ngày tạo     |
| Action     | Các thao tác |

#### Sắp xếp

- Name
- Created At

#### Phân trang

- Mặc định: 20 bản ghi
- Các lựa chọn:
  - 20
  - 50
  - 100

---

### Nút chức năng

| Nút      | Hành động               |
| -------- | ----------------------- |
| Thêm mới | Mở form tạo mới         |
| Sửa      | Mở form chỉnh sửa       |
| Xóa      | Hiển thị popup xác nhận |

---

## 5. API

### API lấy danh sách

#### Endpoint

```http
GET /api/resource
```

#### Query Parameters

| Tên      | Kiểu   |
| -------- | ------ |
| keyword  | string |
| page     | number |
| pageSize | number |

#### Response

```json
{
  "items": [],
  "total": 0
}
```

---

### API tạo mới

#### Endpoint

```http
POST /api/resource
```

#### Request

```json
{}
```

---

### API cập nhật

#### Endpoint

```http
PUT /api/resource/{id}
```

---

### API xóa

#### Endpoint

```http
DELETE /api/resource/{id}
```

---

## 6. Validation

### Trường 1

- Bắt buộc nhập
- Tối đa 255 ký tự

### Trường 2

- Đúng định dạng

---

## 7. Trạng thái hiển thị

### Loading

#### Tải dữ liệu lần đầu

- Hiển thị Skeleton

#### Tìm kiếm

- Disable nút tìm kiếm
- Hiển thị loading

#### Lưu dữ liệu

- Disable form
- Hiển thị loading

---

### Empty State

```text
Không có dữ liệu
```

---

## 8. Xử lý lỗi

### Lỗi API

```text
Có lỗi xảy ra. Vui lòng thử lại.
```

### Lỗi Validation

Hiển thị bên dưới trường tương ứng.

---

## 9. Phân quyền

### Quyền truy cập

```text
resource.read
```

### Quyền thao tác

| Hành động | Quyền           |
| --------- | --------------- |
| Xem       | resource.read   |
| Thêm      | resource.create |
| Sửa       | resource.update |
| Xóa       | resource.delete |

---

## 10. Tái sử dụng từ hệ thống hiện tại

### Màn hình tham khảo

- src/pages/example-list
- src/pages/example-detail

### Component cần tái sử dụng

- PageHeader
- SearchForm
- DataTable
- ConfirmDialog
- EmptyState

### Pattern cần tuân thủ

- Tuân theo cấu trúc thư mục hiện tại
- Tuân theo coding convention của dự án
- Không tạo component mới nếu đã có component tương đương

---

## 11. Yêu cầu kỹ thuật

### Công nghệ

- React
- TypeScript
- TailwindCSS
- shadcn/ui

### State Management

- TanStack Query

### Form

- React Hook Form
- Zod

### Coding Convention

- Functional Component
- Strict TypeScript
- Không sử dụng any
- Không inline style

---

## 12. Các trường hợp đặc biệt

- Không có dữ liệu
- API timeout
- Mất kết nối mạng
- Người dùng mất quyền trong lúc thao tác
- Dữ liệu đã bị chỉnh sửa hoặc xóa bởi người dùng khác

---

## 13. Kết quả mong muốn

AI Agent cần tạo đầy đủ:

- [ ] Giao diện người dùng
- [ ] Responsive
- [ ] API integration
- [ ] Validation
- [ ] Loading state
- [ ] Error handling
- [ ] Empty state
- [ ] Permission check
- [ ] Unit test cơ bản
- [ ] Tuân thủ coding convention dự án

---

## 14. Hướng dẫn cho AI Agent

### Yêu cầu bắt buộc

- Ưu tiên tái sử dụng component hiện có.
- Không tự tạo design mới nếu đã có màn hình tương tự.
- Tuân thủ cấu trúc thư mục hiện tại của dự án.
- Tuân thủ coding convention hiện tại.
- Tuân thủ pattern React Query, Form và Error Handling đang được sử dụng trong dự án.

### Quy trình thực hiện

1. Phân tích màn hình tham khảo.
2. Tái sử dụng component có sẵn.
3. Tạo UI theo thiết kế.
4. Tích hợp API.
5. Thêm validation.
6. Thêm loading và error state.
7. Kiểm tra responsive.
8. Đảm bảo lint và type-check không có lỗi.
