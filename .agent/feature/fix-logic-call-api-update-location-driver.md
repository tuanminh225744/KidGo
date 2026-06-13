## 1. Thông tin chung

### Tên chức năng

Chữa lỗi cập nhật địa điểm của driver

### Module

frontend\client\src\services
backend\src\sockets\driver.socket.js
frontend\client\src\socket\driverSocket.js

### Mục tiêu

Thực hiện việc kiểm tra logic tại sao

Ví dụ:

> Cho phép người dùng đăng nhập hệ thống bằng tài khoản Google thay vì sử dụng email và mật khẩu.

---

## 2. Yêu cầu nghiệp vụ

### User Story

**Với vai trò là:** [Người dùng]

**Tôi muốn:** [Hành động]

**Để:** [Mục đích]

### Acceptance Criteria

- [ ] Người dùng thực hiện được chức năng
- [ ] Dữ liệu được cập nhật chính xác
- [ ] Xử lý đầy đủ các trường hợp lỗi
- [ ] Hiển thị loading phù hợp
- [ ] Không làm ảnh hưởng chức năng hiện có

---

## 3. Phạm vi thay đổi

### Chức năng bị ảnh hưởng

- Đăng nhập
- Đăng ký
- Hồ sơ cá nhân

### Chức năng không bị ảnh hưởng

- Quản lý người dùng
- Quản lý phân quyền

### Màn hình liên quan

- Login Page
- Register Page
- Profile Page

---

## 4. Luồng hoạt động

### Luồng chính

```text id="0we8q7"
Người dùng
    ↓
Thực hiện hành động
    ↓
Validate dữ liệu
    ↓
Gọi API
    ↓
API thành công
    ↓
Cập nhật state
    ↓
Hiển thị kết quả
```

### Luồng lỗi

```text id="nfd7zb"
Người dùng
    ↓
Gọi API
    ↓
API lỗi
    ↓
Hiển thị thông báo lỗi
    ↓
Cho phép thử lại
```

---

## 5. Giao diện liên quan

### Thành phần cần thay đổi

| Thành phần | Hành động |
| ---------- | --------- |
| LoginForm  | Chỉnh sửa |
| AuthButton | Thêm mới  |
| UserMenu   | Cập nhật  |

### Thành phần mới cần tạo

| Component         | Mục đích         |
| ----------------- | ---------------- |
| GoogleLoginButton | Đăng nhập Google |

### Thiết kế tham khảo

- Link Figma:
- Screenshot:
- Prototype:

---

## 6. API Integration

### API sử dụng

#### Endpoint

```http id="t48g6e"
POST /api/auth/google
```

#### Request

```json id="kzjlwm"
{
  "token": "google_token"
}
```

#### Response

```json id="wzkqof"
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {}
}
```

---

### Xử lý thành công

- Lưu access token
- Lưu refresh token
- Cập nhật user state
- Điều hướng về Dashboard

### Xử lý thất bại

- Hiển thị toast lỗi
- Không cập nhật state

---

## 7. State Management

### State cần bổ sung

```typescript id="wnmzib"
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}
```

### State cần cập nhật

- authStore
- userStore

### Cache cần invalidate

```text id="2mwn76"
user-profile
permissions
notifications
```

---

## 8. Validation

### Điều kiện hợp lệ

- Token không được rỗng
- Token phải đúng định dạng

### Điều kiện không hợp lệ

- Token hết hạn
- Token không hợp lệ

### Thông báo lỗi

```text id="kgjlwm"
Phiên đăng nhập không hợp lệ.
```

---

## 9. Loading State

### Trong khi xử lý

- Disable button
- Hiển thị spinner

### Trong khi redirect

- Hiển thị loading toàn màn hình

---

## 10. Error Handling

### API Error

```text id="0n8r7p"
Có lỗi xảy ra. Vui lòng thử lại.
```

### Network Error

```text id="ll5jys"
Không thể kết nối đến máy chủ.
```

### Permission Error

```text id="4rdqlk"
Bạn không có quyền thực hiện thao tác này.
```

---

## 11. Edge Cases

### Trường hợp cần xử lý

- Người dùng nhấn nhiều lần
- API timeout
- Mất mạng giữa chừng
- Token hết hạn
- Người dùng mở nhiều tab

---

## 12. Phân quyền

### Điều kiện thực hiện

```text id="sjpsur"
user.auth
```

### Điều kiện hiển thị

- Chỉ hiển thị khi chưa đăng nhập

---

## 13. Tái sử dụng code hiện có

### Màn hình tham khảo

- src/features/auth/pages/LoginPage.tsx

### Component tham khảo

- src/features/auth/components/LoginForm.tsx

### Hook tham khảo

- src/features/auth/hooks/useLogin.ts

### API tham khảo

- src/features/auth/services/auth.api.ts

### Pattern cần tuân thủ

- React Query
- React Hook Form
- Zod
- Error Handler chung

---

## 14. File dự kiến thay đổi

### Tạo mới

```text id="d6yw6l"
src/features/auth/components/GoogleLoginButton.tsx
src/features/auth/hooks/useGoogleLogin.ts
```

### Chỉnh sửa

```text id="7q6g1j"
src/features/auth/pages/LoginPage.tsx
src/features/auth/store/auth.store.ts
```

---

## 15. Yêu cầu kỹ thuật

### Công nghệ

- React
- TypeScript
- TailwindCSS

### Coding Convention

- Không sử dụng any
- Strict TypeScript
- Ưu tiên tái sử dụng code hiện có

### Performance

- Không tạo re-render không cần thiết
- Không gọi API lặp lại

---

## 16. Test Cases

### Thành công

- [ ] Thực hiện chức năng thành công
- [ ] Cập nhật state chính xác
- [ ] Điều hướng đúng

### Thất bại

- [ ] API lỗi
- [ ] Mất mạng
- [ ] Dữ liệu không hợp lệ

### Regression

- [ ] Không ảnh hưởng chức năng cũ
- [ ] Không phát sinh lỗi console

---

## 17. Kết quả mong muốn

AI Agent cần thực hiện:

- [ ] Phân tích code hiện tại
- [ ] Tái sử dụng component sẵn có
- [ ] Triển khai chức năng
- [ ] Tích hợp API
- [ ] Thêm validation
- [ ] Thêm loading state
- [ ] Thêm error handling
- [ ] Cập nhật state management
- [ ] Viết test cơ bản
- [ ] Đảm bảo lint pass
- [ ] Đảm bảo type-check pass

---

## 18. Hướng dẫn cho AI Agent

### Bắt buộc

- Không tự ý thay đổi kiến trúc hiện tại.
- Ưu tiên tái sử dụng code hiện có.
- Chỉ chỉnh sửa các file được liệt kê trong tài liệu.
- Tuân thủ coding convention hiện tại của dự án.
- Không tạo thư viện hoặc dependency mới nếu chưa được yêu cầu.

### Quy trình thực hiện

1. Phân tích code liên quan.
2. Xác định các component và hook có thể tái sử dụng.
3. Triển khai chức năng.
4. Tích hợp API.
5. Kiểm tra loading và error handling.
6. Kiểm tra edge cases.
7. Chạy lint và type-check.
8. Tóm tắt các thay đổi đã thực hiện.
