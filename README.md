# INSAC 2026 + Advanced Computing Conference Website
### Joint Academic Event: Dr. A.P.J. Abdul Kalam WIT (LNMU) & Indian Nuclear Society (INS)

A full-stack, secure, production-grade academic conference management web application built for **INSAC 2026** (Indian Nuclear Society's Annual Conference) and the **National Workshop on "Advanced Computing and Nuclear Science: Emerging Technologies, Interdisciplinary Applications and Research Opportunities."**

---

## 1. Project Overview & Architecture

- **Frontend**: Next.js App Router (v16+), React 19, TypeScript, Vanilla CSS design system with CSS tokens, responsive glassmorphism, accessible semantic HTML.
- **Backend**: Node.js, Express.js (REST API `/api/v1`), robust middleware (Helmet, MongoSanitize, CORS, HttpOnly secure cookies, Express-Validator, Rate-Limiting).
- **Database**: MongoDB with Mongoose (with embedded `mongodb-memory-server` fallback for zero-friction local development/testing without requiring an external mongod daemon).
- **Security & Authorization**: Argon2id/Bcrypt password hashing, HttpOnly secure cookies, CSRF protection, strict role separation (`participant` vs `admin`), rate-limiting on sensitive endpoints, sanitization of user input.

### Verified Event Details & Rules
1. **Dates**: Proposed **7–11 December 2026, subject to approval**. (Unconfirmed dates are marked and editable from admin settings).
2. **Venue**: Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT), a constituent unit of Lalit Narayan Mithila University (LNMU), Darbhanga, Bihar 846004, India.
3. **Collaboration**: Indian Nuclear Society (INS) & Dr. A.P.J. Abdul Kalam WIT, LNMU.
4. **Registration Fees**:
   - Students: **₹500**
   - Research Scholars: **₹750**
   - Faculty Members: **₹1,000**
5. **Fee Payment & Reporting Policy**:
   - In accordance with institutional guidelines, **no online payment gateway or automated QR code is generated**.
   - Official payment instructions/accounts are provided by the college.
   - Participants record and report paid details (UPI UTR / transaction ID, cash receipt number, or bank transfer reference) on their dashboard.
   - Authorized administrators manually verify or reject submissions with an audit trail.
6. **Official Abstract Template**:
   - Retrieved directly from the official reference site: `Template for extended abstract (INSAC-2026).docx` (1.79 MB).
   - Max 2 pages, Times New Roman (Title: 14pt Capital Bold, Subtitles: 12pt Bold, Text: 11pt, 1.5 line spacing).
   - Configurable live word counter (default 250 words) enforced on both client and server.
   - Downloadable directly from the homepage, abstract submission page, and participant dashboard.
   - Admin replaceable through the admin panel without modifying code.

---

## 2. Directory Structure

```
insac2026/
├── backend/
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Active local environment variables
│   ├── package.json              # Backend dependencies
│   ├── uploads/                  # Managed file storage
│   │   ├── abstracts/            # Uploaded participant attachments
│   │   ├── templates/            # Official abstract template files
│   │   └── images/               # Admin-uploaded banner/logo assets
│   └── src/
│       ├── config/               # Database and server configuration
│       ├── controllers/          # Business logic (auth, registration, payment, abstract, settings)
│       ├── middleware/           # Auth, role check, validation, rate-limiting, error handling
│       ├── models/               # Mongoose schemas (User, Registration, Payment, Abstract, EventSettings, AuditLog)
│       ├── routes/               # API route definitions under /api/v1
│       ├── scripts/              # Seed scripts (seedSettings, seedAdmin, testSuite)
│       ├── services/             # Email service abstraction (SMTP/mock)
│       ├── utils/                # Token generation, helpers, initDefaults
│       ├── validators/           # Express-validator schemas
│       └── server.js             # Express application entry point
├── frontend/
│   ├── next.config.ts            # Next.js configuration and /api/v1 rewrites
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript compiler settings
│   ├── public/                   # Static assets & public downloads
│   │   └── downloads/            # Local copy of official template
│   └── src/
│       ├── app/
│       │   ├── globals.css       # Design system (Navy/Teal/Gold palette, glassmorphism)
│       │   ├── layout.tsx        # Root layout with AuthProvider, Navbar, Footer, SEO
│       │   ├── page.tsx          # Unified homepage
│       │   ├── about/page.tsx    # Subsections: Event, INS, LNMU, WIT
│       │   ├── themes/page.tsx   # Interactive themes with category filters
│       │   ├── committees/page.tsx # Committee directory from Details.docx
│       │   ├── information/page.tsx # General info, fees, abstract rules, travel
│       │   ├── register/page.tsx # Participant account creation
│       │   ├── login/page.tsx    # User & admin authentication
│       │   ├── forgot-password/page.tsx # Password recovery
│       │   ├── reset-password/page.tsx  # Secure token password reset
│       │   ├── abstract-submission/page.tsx # Extended abstract submission form
│       │   ├── dashboard/page.tsx # Participant portal (fee tracking, payment reporting, abstract status)
│       │   └── admin/page.tsx    # Protected admin control center
│       ├── components/           # Reusable UI (Navbar, Footer, WordCounter, StatusBadge, TemplateDownloadCard)
│       ├── context/              # AuthContext (user session, login, logout, refresh)
│       ├── lib/                  # Typed API client
│       └── types/                # TypeScript interfaces
└── README.md                     # Documentation
```

---

## 3. Installation & Run Commands

### Prerequisites
- Node.js version: **v18.0.0+** (tested on Node.js v20/v26)
- npm version: **9.0.0+**

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 3. Start Backend Server
```bash
cd ../backend
npm start
# Server listens on http://localhost:5001
```
*Note: If no external MongoDB daemon is active on `mongodb://localhost:27017`, the backend automatically launches an embedded in-memory MongoDB instance via `mongodb-memory-server` and pre-seeds default event settings and administrator credentials.*

### 4. Start Frontend Development Server
```bash
cd ../frontend
npm run dev -- -p 3000
# Application opens at http://localhost:3000
```

---

## 4. Environment Variables Configuration

Copy `backend/.env.example` to `backend/.env`:

```env
# Server
PORT=5001
NODE_ENV=development

# MongoDB (Local URI or Atlas Cluster Connection String)
MONGODB_URI=mongodb://localhost:27017/insac2026

# JWT & Cookie Secrets
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRES_IN=7d
COOKIE_SECRET=another-very-long-random-secret-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Admin Seed Credentials (Provisioned via protected script or on boot)
ADMIN_EMAIL=admin@insac2026.org
ADMIN_PASSWORD=ChangeThisSecurePassword123!
ADMIN_NAME=System Administrator

# SMTP Email Configuration (Optional - logs to console when unconfigured)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@insac2026.org

# File Upload Settings
MAX_FILE_SIZE_MB=10
UPLOAD_DIR=uploads
```

---

## 5. Secure Admin Provisioning

Public registration **never** grants administrator rights; any public registration request defaults strictly to the `participant` role.

The initial administrator is provisioned in one of two secure ways:
1. **Automated Server Bootstrapping**: On initial server boot, `backend/src/utils/initDefaults.js` securely provisions the admin using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`.
2. **Explicit Admin CLI Seed Command**:
   ```bash
   cd backend
   npm run seed:admin
   ```
   *Never commit plain-text credentials or production passwords to version control.*

To access the private Admin Dashboard:
1. Log in at `/login` using the provisioned administrator credentials (`admin@insac2026.org`).
2. Navigate to `/admin`. Unauthenticated users or non-admin participants attempting to load `/admin` or invoke admin endpoints receive an immediate `403 Forbidden` response.

---

## 6. Official Abstract Template

- **Source**: Retrieved live from the official conference reference site:  
  `https://www.insac2026.org/pdf/Template%20for%20extended%20abstract%20(INSAC-2026).docx`
- **File Name**: `Template for extended abstract (INSAC-2026).docx`
- **Format**: Microsoft Word OpenXML (`.docx`)
- **File Size**: 1.79 MB (1,793,931 bytes)
- **Local Storage**: `backend/uploads/templates/Template_for_extended_abstract_INSAC-2026.docx` and `frontend/public/downloads/`
- **Serving Route**: `GET /api/v1/settings/template/download`
- **Online Replacement**: Administrators can upload and replace the official template directly via `/admin` (Tab: "Event Content Settings") with automatic timestamped backup versioning.

---

## 7. Testing & Quality Assurance

A comprehensive automated test suite is included in `backend/src/scripts/testSuite.js`. It validates:
- Public health check and event metadata retrieval
- Populated committee data matching `Details.docx`
- Verified registration fee rates (Student: ₹500, Scholar: ₹750, Faculty: ₹1,000)
- Verified unconfirmed proposed date status
- Official abstract template download (HTTP 200, correct docx MIME type, exact file size)
- Participant registration, duplicate email rejection, and password hashing
- HttpOnly cookie authentication and `/auth/me` user retrieval
- Participant registration creation and backend-calculated fee snapshot
- Payment reporting (UPI, cash, bank transfer)
- Abstract word limit enforcement (>250 words rejected, ≤250 words accepted)
- Cross-user authorization check (participants blocked from admin endpoints)
- Administrator authentication and dashboard statistics
- Payment review and verification with automatic registration confirmation
- Abstract review and acceptance with review notes hidden from participants
- Session logout and cookie clearing

### Running the Test Suite:
```bash
cd backend
node src/scripts/testSuite.js
```
**Result**: `34 PASSED, 0 FAILED`.

### Running Production Builds:
```bash
# Frontend Next.js build
cd frontend
npm run build

# Backend production start
cd backend
NODE_ENV=production node src/server.js
```

---

## 8. Deployment & Production Considerations

1. **Database (MongoDB Atlas)**:
   - Provide your Atlas connection string in `MONGODB_URI` (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/insac2026?retryWrites=true&w=majority`).
2. **Reverse Proxy (Nginx / Cloudflare)**:
   - Route `/api/v1` to Node.js backend port `5001`.
   - Route `/` to Next.js frontend port `3000`.
   - Enable HTTPS/TLS and set `NODE_ENV=production` so `cookie.secure = true` is enforced.
3. **Email Delivery**:
   - Configure active SMTP credentials (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) for real-time transactional emails.
