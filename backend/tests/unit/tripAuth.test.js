import { jest } from '@jest/globals';

// --- MOCK DEPENDENCIES ---
jest.unstable_mockModule('../../src/models/operational/trip.model.js', () => {
  return {
    default: {
      findById: jest.fn(),
    }
  };
});

jest.unstable_mockModule('../../src/models/core/driver.model.js', () => ({
  default: {
    findByIdAndUpdate: jest.fn(),
  }
}));

jest.unstable_mockModule('../../src/config/redisClient.js', () => ({
  default: {
    get: jest.fn(),
    del: jest.fn(),
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

describe('Trip Security Verification', () => {
  let TripMock;
  let DriverMock;
  let redisClientMock;
  let tripService;

  beforeAll(async () => {
    TripMock = (await import('../../src/models/operational/trip.model.js')).default;
    DriverMock = (await import('../../src/models/core/driver.model.js')).default;
    redisClientMock = (await import('../../src/config/redisClient.js')).default;
    tripService = await import('../../src/services/trip.service.js');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getMockTrip = (overrides = {}) => ({
    _id: 'trip123',
    driverId: 'driver123',
    parentId: 'parent123',
    save: jest.fn().mockResolvedValue(true),
    ...overrides
  });

  describe('1. Verify OTP', () => {
    it('should fail if trip does not exist', async () => {
      TripMock.findById.mockResolvedValueOnce(null);
      await expect(tripService.verifyTripOtp('invalid_id', '123456')).rejects.toThrow('Hành trình không tồn tại');
    });

    it('should fail if OTP is not required', async () => {
      const trip = getMockTrip({ otp: { required: false } });
      TripMock.findById.mockResolvedValueOnce(trip);
      await expect(tripService.verifyTripOtp('trip123', '123456')).rejects.toThrow('Chuyến đi này không yêu cầu OTP');
    });

    it('should fail if entered OTP is wrong or expired', async () => {
      const trip = getMockTrip({ otp: { required: true } });
      TripMock.findById.mockResolvedValueOnce(trip);
      redisClientMock.get.mockResolvedValueOnce(null); // Expired or wrong
      await expect(tripService.verifyTripOtp('trip123', '999999')).rejects.toThrow('Mã OTP không chính xác hoặc đã hết hạn');
    });

    it('should succeed if OTP matches', async () => {
      const trip = getMockTrip({ otp: { required: true, status: 'pending' } });
      TripMock.findById.mockResolvedValueOnce(trip);
      redisClientMock.get.mockResolvedValueOnce('123456');

      const result = await tripService.verifyTripOtp('trip123', '123456');
      
      expect(redisClientMock.del).toHaveBeenCalledWith('trip_otp:trip123');
      expect(trip.otp.status).toBe('passed');
      expect(trip.otp.data.otpVerified).toBe(true);
      expect(trip.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('2. Verify Photos and Security Question', () => {
    it('should successfully verify pickup photo', async () => {
      const trip = getMockTrip({ pickupPhoto: { required: true, status: 'pending' } });
      TripMock.findById.mockResolvedValueOnce(trip);

      const result = await tripService.verifyTripPickupPhoto('trip123', 'https://example.com/photo.jpg');
      
      expect(trip.pickupPhoto.status).toBe('passed');
      expect(trip.pickupPhoto.data.photo).toBe('https://example.com/photo.jpg');
      expect(trip.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should successfully verify dropoff photo', async () => {
      const trip = getMockTrip({ dropoffPhoto: { required: true, status: 'pending' } });
      TripMock.findById.mockResolvedValueOnce(trip);

      const result = await tripService.verifyTripDropoffPhoto('trip123', 'https://example.com/dropoff.jpg');
      
      expect(trip.dropoffPhoto.status).toBe('passed');
      expect(trip.dropoffPhoto.data.photo).toBe('https://example.com/dropoff.jpg');
      expect(trip.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should successfully verify security question', async () => {
      const trip = getMockTrip({ securityQuestion: { required: true, status: 'pending' } });
      TripMock.findById.mockResolvedValueOnce(trip);

      const result = await tripService.verifyTripSecurityQuestion('trip123', 'Câu trả lời bí mật');
      
      expect(trip.securityQuestion.status).toBe('passed');
      expect(trip.securityQuestion.data.answer).toBe('Câu trả lời bí mật');
      expect(trip.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });

  describe('3. Driver Pickup Kid (Final Checks)', () => {
    it('should fail if OTP is required but not passed', async () => {
      const trip = getMockTrip({ 
        otp: { required: true, status: 'pending' } 
      });
      TripMock.findById.mockResolvedValueOnce(trip);
      await expect(tripService.driverPickupKid('trip123')).rejects.toThrow('Chưa xác thực OTP');
    });

    it('should fail if Pickup Photo is required but not passed', async () => {
      const trip = getMockTrip({ 
        otp: { required: false },
        pickupPhoto: { required: true, status: 'pending' }
      });
      TripMock.findById.mockResolvedValueOnce(trip);
      await expect(tripService.driverPickupKid('trip123')).rejects.toThrow('Chưa xác thực chụp ảnh đón');
    });

    it('should fail if Security Question is required but not passed', async () => {
      const trip = getMockTrip({ 
        otp: { required: false },
        pickupPhoto: { required: false },
        securityQuestion: { required: true, status: 'pending' }
      });
      TripMock.findById.mockResolvedValueOnce(trip);
      await expect(tripService.driverPickupKid('trip123')).rejects.toThrow('Chưa xác thực câu hỏi bảo mật');
    });

    it('should succeed and change status to in_progress if all requirements met', async () => {
      const trip = getMockTrip({ 
        otp: { required: true, status: 'passed' },
        pickupPhoto: { required: true, status: 'passed' },
        securityQuestion: { required: false }
      });
      TripMock.findById.mockResolvedValueOnce(trip);

      const result = await tripService.driverPickupKid('trip123');
      
      expect(trip.status).toBe('in_progress');
      expect(trip.save).toHaveBeenCalled();
      expect(DriverMock.findByIdAndUpdate).toHaveBeenCalledWith('driver123', { rideStatus: 'in_trip' });
      expect(result.success).toBe(true);
    });
  });
});
