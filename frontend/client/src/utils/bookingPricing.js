const DEFAULT_BASE_FARE = 20000;
const DISTANCE_MULTIPLIER = 10000;

export const BOOKING_PLANS = {
  one_time: "one-time",
  monthly: "monthly",
  yearly: "yearly",
};

export const PLAN_DISCOUNT = {
  "one-time": 0,
  monthly: 0.05,
  yearly: 0.1,
};

export const planLabels = {
  "one-time": "Một lần",
  monthly: "Gói tháng",
  yearly: "Gói năm",
};

export const getBaseTripPrice = (routeInfo) => {
  const distancePrice = (Number(routeInfo?.distance) || 0) * DISTANCE_MULTIPLIER;
  return Math.max(distancePrice, DEFAULT_BASE_FARE);
};

export const countRecurringTrips = (startDate, endDate, recurringDays, dayMap) => {
  if (
    !startDate ||
    !endDate ||
    !Array.isArray(recurringDays) ||
    recurringDays.length === 0
  ) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return 0;
  }

  const selectedDays = new Set(
    recurringDays
      .map((day) => dayMap?.[day])
      .filter((value) => value !== undefined),
  );

  let trips = 0;
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    if (selectedDays.has(cursor.getDay())) trips += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return trips;
};

export const calculateTripPricing = ({
  tripType,
  routeInfo,
  recurringTripCount = 0,
}) => {
  const baseTripPrice = getBaseTripPrice(routeInfo);
  const discountRate = PLAN_DISCOUNT[tripType] || 0;
  const trips = tripType === "one-time" ? 1 : recurringTripCount;
  const subtotal = baseTripPrice * trips;
  const discountAmount = Math.round(subtotal * discountRate);

  return {
    baseTripPrice,
    trips,
    discountRate,
    discountAmount,
    totalPrice: Math.max(subtotal - discountAmount, 0),
  };
};
