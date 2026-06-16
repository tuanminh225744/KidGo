# DashboardRoutes

Base path: /api/v1/admin

Endpoints (admin only):

- GET /dashboard : returns admin stats object (summary: tripsToday, driversOnline, openAlerts)
- GET /reports : returns analytics/report data (timeseries/trends)

Exact fields depend on `DashboardController` service implementation; include typical keys: { tripsToday: number, driversOnline: number, openAlerts: number, reports: [...] }
