KidRoutes
Base path: /api/v1/kids

Quy định Response chuẩn của hệ thống:
Success: { "success": true, "message": "Operation successful", "data": { ... } }

Error: { "success": false, "message": "Error message" }

Danh sách các Endpoints:

1. GET /
   Mô tả: Lấy danh sách trẻ nhỏ thuộc tài khoản của phụ huynh.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Success Response - data: Mảng các đối tượng Kid (array of Kid objects), trường securityAnswer đã bị ẩn đi vì lý do bảo mật.

2. POST /
   Mô tả: Thêm mới hồ sơ một trẻ nhỏ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Request Body:

fullName: string (required)

dateOfBirth: ISO8601 date (optional)

avatar: string (optional, URL)

phone: string (optional)

school: string (optional)

notes: string (optional)

securitySettings: object (required - phải chứa ít nhất một trường mang giá trị true)

otp: boolean (optional)

pickupPhoto: boolean (optional)

dropoffPhoto: boolean (optional)

securityQuestion: boolean (optional)

securityQuestion: string (required nếu securitySettings.securityQuestion là true)

securityAnswer: string (required nếu securitySettings.securityQuestion là true)

Success Response (201) - data: Đối tượng Kid object vừa tạo (không bao gồm securityAnswer).

3. POST /:kidId/upload-avatar
   Mô tả: Tải lên ảnh đại diện cho trẻ nhỏ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: kidId (ObjectId, required)

Body (Form-data): File đính kèm với key là avatar

Success Response - data: { "avatarUrl": "string", "kid": Kid object }

4. PUT /:kidId/security-question
   Mô tả: Cập nhật câu hỏi và câu trả lời bảo mật khi đưa đón trẻ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: kidId (ObjectId, required)

Request Body:

securityQuestion: string (required)

securityAnswer: string (required)

Success Response - data: Đối tượng Kid object đã cập nhật (không bao gồm securityAnswer).

5. GET /:kidId/security-question
   Mô tả: Lấy nội dung câu hỏi bảo mật của trẻ phục vụ quá trình đối chiếu lúc nhận/trả trẻ.

Yêu cầu xác thực: Bearer Token (Tài xế hoặc Phụ huynh)

Path Params: kidId (ObjectId, required)

Success Response - data: { "kidId": ObjectId, "fullName": "string", "securityQuestion": "string" }

6. POST /:kidId/security-answer/verify
   Mô tả: Tài xế gửi câu trả lời của trẻ để hệ thống kiểm tra tính chính xác.

Yêu cầu xác thực: Bearer Token (Tài xế)

Path Params: kidId (ObjectId, required)

Request Body:

securityAnswer: string (required)

Success Response - data: { "isValid": boolean }

7. GET /:kidId
   Mô tả: Chi tiết thông tin của một trẻ nhỏ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: kidId (ObjectId, required)

Success Response - data: Đối tượng Kid object tương ứng.

8. PUT /:kidId
   Mô tả: Cập nhật thông tin bất kỳ của trẻ nhỏ.

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: kidId (ObjectId, required)

Request Body: Các trường thông tin có thể chỉnh sửa của Kid (xem chi tiết tại validator).

Success Response - data: Đối tượng Kid object đã chỉnh sửa.

9. DELETE /:kidId
   Mô tả: Xóa hồ sơ trẻ nhỏ khỏi hệ thống (Xóa mềm - Soft delete).

Yêu cầu xác thực: Bearer Token (Phụ huynh)

Path Params: kidId (ObjectId, required)

Success Response - data: Đối tượng Kid object đã được đánh dấu xóa mềm.

Thông tin các trường dữ liệu (Kid object fields):
Nguồn gốc từ models/core/kid.model.js:

\_id: ObjectId

parentId: ObjectId

fullName: string

dateOfBirth: ISO8601 date | null

avatar: string | null (URL)

phone: string | null

school: string | null

notes: string | null

isActive: boolean

securitySettings:

otp: boolean

pickupPhoto: boolean

dropoffPhoto: boolean

securityQuestion: boolean

securityQuestion: string | null

createdAt: ISO8601 date
