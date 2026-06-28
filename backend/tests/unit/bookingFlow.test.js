import { jest } from '@jest/globals';

// --- MOCK DEPENDENCIES ---
const mockSave = jest.fn().mockResolvedValue(true);
jest.unstable_mockModule('../../src/models/operational/booking.model.js', () => {
  return {
    default: class BookingMock {
      constructor(data) {
        Object.assign(this, data);
        this._id = 'booking123';
        this.save = mockSave;
      }
      static findById = jest.fn();
      static findOne = jest.fn();
    }
  };
});

jest.unstable_mockModule('../../src/models/operational/route.model.js', () => ({
  default: {
    findById: jest.fn(),
  }
}));

jest.unstable_mockModule('../../src/sockets/socketManager.js', () => {
  const emitMock = jest.fn();
  const toMock = jest.fn(() => ({ emit: emitMock }));
  const ofMock = jest.fn(() => ({ to: toMock }));
  return {
    getIo: jest.fn(() => ({ of: ofMock }))
  };
});

jest.unstable_mockModule('../../src/config/redisClient.js', () => ({
  default: {
    sadd: jest.fn(),
    expire: jest.fn(),
    del: jest.fn(),
    smembers: jest.fn().mockResolvedValue([]),
  }
}));

// Mock timer functions
jest.useFakeTimers();

describe('Booking Flow', () => {
  let RouteMock;
  let bookingService;

  beforeAll(async () => {
    RouteMock = (await import('../../src/models/operational/route.model.js')).default;
    bookingService = await import('../../src/services/booking.service.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Create Booking (Chuyến đơn/định kỳ - Tài xế ưu tiên)', () => {
    it('should assign directly if preferredDriverId is provided', async () => {
      const payload = {
        parentId: 'parent123',
        routeId: 'route123',
        preferredDriverId: 'driverVIP',
        isRecurring: false,
      };

      const result = await bookingService.createBooking(payload);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('matched');
      expect(result.data.assignedDriverId).toBe('driverVIP');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('2. Create Booking (Tìm tài xế hệ thống)', () => {
    it('should start generic matching cycle if no preferredDriverId is set', async () => {
      const payload = {
        parentId: 'parent123',
        routeId: 'route123',
      };

      RouteMock.findById.mockResolvedValueOnce({
        _id: 'route123',
        estimatedPickupCoords: { coordinates: [105.8, 21.0] } // [lng, lat]
      });

      const result = await bookingService.createBooking(payload);

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('pending');
      expect(result.data.preferredDriverId).toBeUndefined();
      expect(mockSave).toHaveBeenCalled();
      expect(RouteMock.findById).toHaveBeenCalledWith('route123');
    });

    it('should throw error if route is not found or missing coordinates', async () => {
      RouteMock.findById.mockResolvedValueOnce(null);
      await expect(bookingService.createBooking({ routeId: 'invalid' })).rejects.toThrow('Không đủ tọa độ để khởi động Rada');
    });
  });
});
