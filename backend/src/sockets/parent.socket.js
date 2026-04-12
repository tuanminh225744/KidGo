export default function setupParentSockets(io) {
    // Phân tách nhánh kết nối riêng của ứng dụng phụ huynh
    const parentNamespace = io.of('/parent');

    parentNamespace.on('connection', (socket) => {
        console.log(`[Socket] Parent connected: ${socket.id}`);
        let currentParentId = null;

        // Phụ huynh đăng nhập App là gọi auth ngay
        socket.on('authenticate', (data) => {
            if (data && data.parentId) {
                currentParentId = data.parentId;
                console.log(`[Socket] Authenticated parent: ${currentParentId}`);
                
                // Nhốt socket này vào trong một room có tên trùng đúng bằng ID Phụ huynh (parentId).
                // Do đó, lúc service bắn: namespace.to(parentId).emit(...) thì auto người này nhận được.
                socket.join(currentParentId.toString());
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Parent disconnected: ${socket.id}`);
        });
    });
}
