import { jest } from '@jest/globals';

// Mock dependencies
jest.unstable_mockModule('../../src/config/redisClient.js', () => ({
  default: {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  }
}));

jest.unstable_mockModule('../../src/cronjobs/trip-monitor/notificationHelper.js', () => ({
  sendAlert: jest.fn(),
  sendDanger: jest.fn(),
}));

// Setup process.env
process.env.SPEED_LIMIT_KMH = '50';
process.env.SPEED_DANGER_MINUTES = '3';
process.env.STOP_ALERT_MINUTES = '5';
process.env.STOP_DANGER_MINUTES = '10';
process.env.GPS_LOSS_ALERT_MINUTES = '2';
process.env.GPS_LOSS_DANGER_MINUTES = '5';
process.env.OFF_ROUTE_ALERT_METERS = '200';
process.env.OFF_ROUTE_DANGER_METERS = '500';

const tripMock = { _id: 'trip123', driverId: 'driver123', parentId: 'parent123' };

describe('Trip Monitor Alerts', () => {
  let redisClientMock;
  let notificationHelperMock;
  let checkSpeeding, checkAbnormalStop, checkGpsLoss, checkOffRoute;

  beforeAll(async () => {
    redisClientMock = (await import('../../src/config/redisClient.js')).default;
    notificationHelperMock = await import('../../src/cronjobs/trip-monitor/notificationHelper.js');

    checkSpeeding = (await import('../../src/cronjobs/trip-monitor/speedingAlert.js')).checkSpeeding;
    checkAbnormalStop = (await import('../../src/cronjobs/trip-monitor/abnormalStopAlert.js')).checkAbnormalStop;
    checkGpsLoss = (await import('../../src/cronjobs/trip-monitor/gpsLossAlert.js')).checkGpsLoss;
    checkOffRoute = (await import('../../src/cronjobs/trip-monitor/offRouteAlert.js')).checkOffRoute;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Speeding Alert', () => {
    it('should not warn if speed is under limit', async () => {
      await checkSpeeding(tripMock, 40);
      expect(redisClientMock.del).toHaveBeenCalledWith('speeding_warning:trip123');
      expect(redisClientMock.del).toHaveBeenCalledWith('speeding_danger_sent:trip123');
      expect(notificationHelperMock.sendAlert).not.toHaveBeenCalled();
      expect(notificationHelperMock.sendDanger).not.toHaveBeenCalled();
    });

    it('should send alert on first violation', async () => {
      redisClientMock.get.mockResolvedValueOnce(null); // No previous warning
      await checkSpeeding(tripMock, 60);

      expect(redisClientMock.setex).toHaveBeenCalledWith('speeding_warning:trip123', 180, expect.any(Number));
      expect(notificationHelperMock.sendAlert).toHaveBeenCalledWith(tripMock, 'Cảnh báo vượt quá tốc độ', expect.any(String));
    });

    it('should send danger if speeding continues for more than dangerMinutes', async () => {
      const pastTime = Date.now() - (4 * 60 * 1000); // 4 minutes ago
      redisClientMock.get.mockImplementation(async (key) => {
        if (key === 'speeding_warning:trip123') return pastTime.toString();
        if (key === 'speeding_danger_sent:trip123') return null; // Not sent yet
        return null;
      });

      await checkSpeeding(tripMock, 65);

      expect(notificationHelperMock.sendDanger).toHaveBeenCalledWith(tripMock, 'Cảnh báo tốc độ nguy hiểm', expect.any(String));
      expect(redisClientMock.setex).toHaveBeenCalledWith('speeding_danger_sent:trip123', 600, 'sent');
    });
  });

  describe('2. Abnormal Stop Alert', () => {
    it('should clear tracking if moving normally', async () => {
      await checkAbnormalStop(tripMock, 20, 0.1); // moving at 20km/h
      expect(redisClientMock.del).toHaveBeenCalledWith('unplanned_stop:trip123');
    });

    it('should start tracking if speed < 5km/h', async () => {
      redisClientMock.get.mockResolvedValueOnce(null);
      await checkAbnormalStop(tripMock, 0, 0.1);

      expect(redisClientMock.setex).toHaveBeenCalledWith('unplanned_stop:trip123', 600, expect.any(Number));
      expect(notificationHelperMock.sendAlert).not.toHaveBeenCalled();
    });

    it('should send alert if stopped for 5+ minutes', async () => {
      const pastTime = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      redisClientMock.get.mockImplementation(async (key) => {
        if (key === 'unplanned_stop:trip123') return pastTime.toString();
        if (key === 'unplanned_stop_alert_sent:trip123') return null;
        return null;
      });

      await checkAbnormalStop(tripMock, 0, 0.1);

      expect(notificationHelperMock.sendAlert).toHaveBeenCalled();
      expect(notificationHelperMock.sendDanger).not.toHaveBeenCalled();
    });

    it('should send danger if stopped for 10+ minutes', async () => {
      const pastTime = Date.now() - (11 * 60 * 1000); // 11 minutes ago
      redisClientMock.get.mockImplementation(async (key) => {
        if (key === 'unplanned_stop:trip123') return pastTime.toString();
        if (key === 'unplanned_stop_danger_sent:trip123') return null;
        return null;
      });

      await checkAbnormalStop(tripMock, 0, 0.1);

      expect(notificationHelperMock.sendDanger).toHaveBeenCalled();
    });
  });

  describe('3. GPS Loss Alert', () => {
    it('should not warn if GPS is recent', async () => {
      await checkGpsLoss(tripMock, Date.now() - 30000); // 30s ago
      expect(redisClientMock.del).toHaveBeenCalledWith('gps_lost_alert_sent:trip123');
    });

    it('should send alert if GPS lost for 2+ minutes', async () => {
      redisClientMock.get.mockResolvedValueOnce(null); // not sent yet
      await checkGpsLoss(tripMock, Date.now() - (3 * 60 * 1000)); // 3 mins ago

      expect(notificationHelperMock.sendAlert).toHaveBeenCalled();
    });

    it('should send danger if GPS lost for 5+ minutes', async () => {
      redisClientMock.get.mockResolvedValueOnce(null); // not sent yet
      await checkGpsLoss(tripMock, Date.now() - (6 * 60 * 1000)); // 6 mins ago

      expect(notificationHelperMock.sendDanger).toHaveBeenCalled();
    });
  });

  describe('4. Off Route Alert', () => {
    const validWaypoints = [
      { type: 'Point', coordinates: [105.80, 21.02] },
      { type: 'Point', coordinates: [105.81, 21.02] }
    ];

    it('should not calculate if waypoints < 2', async () => {
      await checkOffRoute({ ...tripMock, routeId: { estimatedWaypoints: [] } }, [105.80, 21.02]);
      expect(notificationHelperMock.sendAlert).not.toHaveBeenCalled();
    });

    it('should not warn if close to route', async () => {
      // 105.805, 21.02 is right on the line
      await checkOffRoute({ ...tripMock, routeId: { estimatedWaypoints: validWaypoints } }, [105.805, 21.02]);
      expect(redisClientMock.del).toHaveBeenCalledWith('off_route_alert_sent:trip123');
    });

    it('should send alert if deviation > 200m', async () => {
      redisClientMock.get.mockResolvedValueOnce(null);
      // 105.805, 21.025 is ~550m away from 21.02, wait 200m is ~0.0018 degrees. So 21.022 is ~220m
      await checkOffRoute({ ...tripMock, routeId: { estimatedWaypoints: validWaypoints } }, [105.805, 21.0225]);
      expect(notificationHelperMock.sendAlert).toHaveBeenCalled();
    });

    it('should send danger if deviation > 500m', async () => {
      redisClientMock.get.mockResolvedValueOnce(null);
      // 21.025 is > 500m away
      await checkOffRoute({ ...tripMock, routeId: { estimatedWaypoints: validWaypoints } }, [105.805, 21.03]);
      expect(notificationHelperMock.sendDanger).toHaveBeenCalled();
    });
  });
});
