# ReportRoutes

Base path: /api/v1/reports

Report object fields (from `models/support/report.model.js`):

- \_id
- tripId
- title
- content
- parentId
- status (PENDING|RESOLVED)
- createdAt

Endpoints:

- POST / : create report (parent) -> returns Report
- GET /trip/:tripId : list Report
- DELETE /:reportId : delete -> returns null
