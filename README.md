# Visitor Pass Management System

A full-stack MERN application that digitizes office visitor management — supporting pre-registration, QR-code digital passes, and check-in/check-out logging across 4 distinct user roles.

## Project Structure

```
visitor-pass-system/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # React (Vite) SPA
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017

## Setup & Installation

### 1. Start MongoDB
```bash
# Windows (if installed as a service, it may already be running)
net start MongoDB

# Or start manually
mongod --dbpath="C:\data\db"
```

### 2. Install Dependencies
**Backend:**
```bash
cd backend
npm install
```
**Frontend:**
```bash
cd frontend
npm install
```

### 3. Seed the Database
```bash
cd backend
npm run seed
```
This clears the database and inserts sample data (users, visitors, appointments, passes, check logs). A formatted credentials table is printed to the console when done.

### 4. Run Both Servers
**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

## Key Features Implemented

- **Dynamic Role-Based Login:** A unified login interface that securely authenticates staff roles while intelligently redirecting public visitors to the tracking portal.
- **Visitor Pre-registration:** Public endpoint for visitors to request access, complete with profile photo upload via `multer`.
- **QR Pass Issuance:** The front desk clicks "Issue Pass" to generate a secure, unique Base64 QR code and a streamed PDF badge.
- **Smart QR Check-In/Check-Out:** The front desk UI features an integrated `html5-qrcode` webcam scanner alongside a manual entry toggle.
- **Admin Stats & CSV Export:** Real-time metrics and the ability to download all access logs as a CSV file.
- **Email & SMS Notifications (Mocked):** 
  - **Emails** are handled via `nodemailer` using an [Ethereal](https://ethereal.email/) test account. The preview URLs are printed directly in the backend terminal.
  - **SMS** messages are mocked in the backend terminal using formatted console logs.

## API Endpoints Reference

| Method | Endpoint                              | Access               | Purpose                                      |
|--------|---------------------------------------|----------------------|----------------------------------------------|
| POST   | `/api/auth/login`                     | Public               | Authenticate staff members                   |
| POST   | `/api/auth/create-staff`              | Admin                | Provision new hosts/frontdesk accounts       |
| GET    | `/api/auth/hosts`                     | Public               | Populate dropdowns with available hosts      |
| POST   | `/api/visitors`                       | Public               | Pre-register a new visitor                   |
| GET    | `/api/visitors/status`                | Public               | Look up a visitor's pass by email            |
| PATCH  | `/api/appointments/:id/approve`       | Host, Admin          | Approve a pending visitor request            |
| POST   | `/api/passes/:appointmentId/issue`    | Frontdesk, Admin     | Generate the QR code and digital pass        |
| POST   | `/api/checklogs/checkin`              | Frontdesk, Admin     | Check a visitor into the facility            |
| POST   | `/api/checklogs/checkout`             | Frontdesk, Admin     | Check a visitor out                          |
| GET    | `/api/dashboard/stats`                | Admin, Frontdesk     | Fetch real-time building statistics          |
| GET    | `/api/dashboard/export`               | Admin                | Download access logs as CSV                  |
