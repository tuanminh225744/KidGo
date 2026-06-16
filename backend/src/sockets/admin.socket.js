export default function setupAdminSockets(io) {
  const adminNamespace = io.of("/admin");

  adminNamespace.on("connection", (socket) => {
    console.log(`[Socket] Admin connected: ${socket.id}`);
    let currentAdminId = null;

    socket.on("authenticate", (data) => {
      if (data && data.adminId) {
        currentAdminId = data.adminId;
        console.log(`[Socket] Authenticated admin: ${currentAdminId}`);
        // Join a room named by adminId so server can send admin-specific messages
        socket.join(currentAdminId.toString());
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Admin disconnected: ${socket.id}`);
    });
  });
}
