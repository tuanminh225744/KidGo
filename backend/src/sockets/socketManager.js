import { Server } from 'socket.io';
import setupDriverSockets from './driver.socket.js';
import setupParentSockets from './parent.socket.js';

let io = null;

/**
 * Hàm khởi tạo chính gắn HTTP server với thư viện Socket 
 */
export const initSocketConfig = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Kích hoạt lắng nghe trên các Namespaces
    setupDriverSockets(io);
    setupParentSockets(io);

    return io;
};

/**
 * Trình xuất biến IO ra ngoài cho các file Service (như BookingService) tái sử dụng để emit message
 */
export const getIo = () => {
    if (!io) {
        console.warn('Cảnh báo: Socket.io chưa được khởi tạo bởi Server!');
    }
    return io;
};
