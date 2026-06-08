# API Documentation

Tài liệu được tạo tự động từ mã nguồn (`backend/src/routes`, `backend/src/validators`, `backend/src/controllers`) và tuân theo định dạng response chuẩn của dự án.

Response chuẩn:

- Success:

```
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

- Error:

```
{
  "success": false,
  "message": "Error message"
}
```

Base path: `/api/v1`

## Ghi chú

- Để biết chi tiết về các api hãy truy cập vào file tương ứng ở thư mục /routes
- Mọi response tuân theo định dạng json đã nêu ở đầu tài liệu.
