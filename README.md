# Silent SOS Emergency Web App

Frontend-only Phase 1 implementation for the Silent SOS Emergency Web App assessment.

## Included essential features

- Home page and emergency workflow
- User registration and demo login
- Trusted emergency contact management
- One-click Silent SOS trigger
- Browser Geolocation API with demo fallback
- Alert creation and status tracking
- Sent / Acknowledged / Resolved states
- Time-stamped alert activity logs
- Basic emergency monitoring/admin dashboard
- Responsive UI
- localStorage persistence for demo use

## Not included

- Backend / Node.js API
- MongoDB/PostgreSQL
- Real SMS/email delivery
- Police/emergency-service integration
- Native mobile application
- AI threat detection
- Payments or other unrelated features

## Run

1. Open this folder in VS Code.
2. Open a terminal in the project folder.
3. Run `npm install`
4. Run `npm run dev`
5. Open the localhost URL shown by Vite.

## Demo flow

1. Register or use Login with:
   Email: demo@sos.com
   Password: 123456
2. Add or review trusted contacts.
3. Open SOS.
4. Press SILENT SOS.
5. Allow browser location permission if prompted.
6. Open My Alerts to see the alert and activity log.
7. Use Acknowledge and Mark Resolved.
8. Open Monitoring to see the basic admin dashboard.

## Demo note

The application simulates notification delivery in the frontend. It does not send real SMS or email because no backend/notification service is included in this Phase-1 frontend assessment.

If browser geolocation is unavailable or permission is denied, a demo fallback coordinate is used so the workflow remains testable.

## Reset demo data

Clear these localStorage keys in browser developer tools:

- silent_sos_user
- silent_sos_contacts
- silent_sos_alerts
