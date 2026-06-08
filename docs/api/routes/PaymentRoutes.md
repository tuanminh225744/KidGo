# PaymentRoutes

Base path: /api/v1/payments

Payment object fields (from `models/operational/payment.model.js`):

- \_id
- userId
- tripScheduleId
- amount (Number)
- driverEarning (Number)
- method (cash|QRPayment)
- status (pending|completed|failed|refunded)
- paidAt: Date | null
- createdAt, updatedAt

Endpoints:

- POST /preview : body { tripScheduleId } -> returns { tripCount, pricePerTrip, discount, amount, driverEarning }
- POST / : body { tripScheduleId, method } -> Success (201) returns { payment, tripCount, pricePerTrip, discount }
- GET /:paymentId : returns Payment object
- PATCH /:paymentId/status : body { status } -> returns updated Payment
- POST /:paymentId/confirm-cash : driver only -> returns updated Payment
