Yêu cầu đọc trước 3 file sau trước khi thực hiện refactor:

- .agent/refactor/api-contract.skill.mdc
- .agent/refactor/model-refactor.skill.mdc
- .agent/refactor/refactor-impact.rule.mdc

Sau khi đọc xong 3 file trên, hãy thực hiện các bước refactor sau:

- Xóa model alert, model location log và thực hiện xóa các api liên quan đến 2 model này.
- Chỉnh sửa model notification hiện tại, giờ đây notification sẽ xóa đi các thuộc tính là channel, status, refId và thêm thuộc tính mới là tripId, đồng thời chỉnh sửa các api liên quan đến model notification để phù hợp với model mới.
- Chỉnh sửa model route hiện tại, giờ đây route sẽ lưu thông tin quãng đường dự tính và cả quãng đường thực tế của tài xế. Xóa thuộc tính name và isDefault, pickupAddress, pickupCoords, dropoffAddress, dropoffCoords. đồng thời thêm các thuộc tính là actualPickupAddress, actualDropoffAddress, actualPickupCoords, actualDropoffCoords, actualDistance, actualDuration, estimatedPickupAddress, estimatedDropoffAddress, estimatedPickupCoords, estimatedDropoffCoords, estimatedDistance, estimatedDuration, estimatedWaypoints, actualWaypoints,scheduledPickupTime,actualPickupTime, . Chỉnh sửa các api liên quan đến model route để phù hợp với model mới.
- Chỉnh sửa model route hiện tại, giờ đây route sẽ lưu thông tin quãng đường, thời gian dự tính và cả quãng đường, thời gian thực tế của tài xế. Xóa thuộc tính name và isDefault, pickupAddress, pickupCoords, dropoffAddress, dropoffCoords. đồng thời thêm các thuộc tính là actualPickupAddress, actualDropoffAddress, actualPickupCoords, actualDropoffCoords, actualDistance, actualDuration, estimatedPickupAddress, estimatedDropoffAddress, estimatedPickupCoords, estimatedDropoffCoords, estimatedDistance, estimatedDuration, estimatedWaypoints, actualWaypoints,scheduledPickupTime,actualPickupTime, scheduledDropoffTime, actualDropoffTime. Chỉnh sửa các api liên quan đến model route để phù hợp với model mới.
- Chinh sửa model trip hiện tại, xóa các thuộc tính: actualRoute, scheduledPickupTime, scheduledDropoffTime, actualPickupTime, actualDropoffTime, distance. Chỉnh sửa các api liên quan đến model trip để phù hợp với model mới.
- Thêm một model mới là report model, model này sẽ có các thuộc tính sau: id, tripId, title, content, parentId, createdAt, status("PENDING" | "RESOLVED"). Đồng thời thêm các api liên quan đến model report để có thể tạo mới report, lấy danh sách report theo tripId và xóa report theo id.
