# Apex Robotics & Innovation Club Portal

A complete, production-ready, full-stack **Club Management & Public Verification Website** featuring digital cryptographic QR member verification, dynamic content management, and an executive administration dashboard.

---

## 🌟 Key Highlights & Features

### 1. Public Website
* **Home Page**: Hero section with dynamic club title, tagline, core mission preview, live metric counters, featured team members, alumni spotlight, award accreditations, and contact call-to-actions.
* **About Page**: Club history, mission, vision, dynamic core objectives list, and official campus accreditation details.
* **Team Page**: Interactive directory with search (by name, skill, or role), department filters, member credential badges, skills chips, and one-click QR code view/download.
* **QR Member Verification (`/member/:memberId`)**:
  * Permanent cryptographic URL for every official club member (e.g. `/member/ARC-2025-001`).
  * Features the official club seal: **✓ VERIFIED CLUB MEMBER** with authenticated credential details.
  * Handles inactive/deactivated members gracefully (**"Member currently inactive"**).
  * Friendly, clean 404 handling if a scanned member ID does not exist.
  * Displays linked certificates, bio, competencies, and a **Print Credential Badge** option.
* **Alumni Page**: Searchable graduate network with batch filtering, previous club leadership roles, current company placements, and linked honors.
* **Certificates Page**: Public registry of verified certificates and honors with category and recipient filters, zoomable viewer modal, verification IDs, and direct download.
* **Contact Page**: Campus headquarters details, lab hours, contact telephone, email, and an interactive message submission form.

---

### 2. Admin Management Console (`/admin`)
* **Secure Authentication**: Protected routes with JSON Web Token (JWT) sessions and bcrypt password hashing.
* **Dashboard**: Key statistical metrics (Active Members, Alumni, Certificates, Unread Inquiries) and recent additions.
* **Club Information & Settings**: Edit club name, tagline, logo upload/URL, lab banner, about narrative, history, mission, vision, dynamic objectives, contact info, and social links.
* **Team Management**:
  * Full CRUD for team members with auto-generated unique Member IDs.
  * Photo upload or URL input.
  * Skills tags and achievements manager.
  * One-click **Active / Inactive** status toggle.
  * One-click **QR Code Regeneration**.
  * View, download PNG, and print member badges.
* **Alumni Management**: Full CRUD for alumni profiles, batch years, previous club roles, and current industry employers.
* **Certificates Management**: Issue certificates to team members, alumni, or club teams; upload high-res images/PDFs; set public/private visibility; and assign unique verification IDs.
* **QR & ID Hub**: Dedicated command center to view all member QR codes, download PNGs, and batch print credentials for orientation or events.
* **Media Library**: Persistent file storage for logos, banners, and documents with one-click copy URL.
* **Inquiries**: Review messages submitted through the public contact form, mark as read, and delete.

---

## 🔐 Default Admin Credentials

* **URL**: `http://localhost:5000/admin/login` (or `/admin/login` on dev port 3000)
* **Email**: `admin@club.org`
* **Password**: `admin123`

---

## 🛠️ Tech Stack

* **Backend**: Node.js, Express 5, SQLite (`better-sqlite3` with WAL mode), bcryptjs, jsonwebtoken, multer, qrcode.
* **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, React Router v7, `qrcode.react`.
* **Database**: `server/club.db` (auto-seeded with realistic team, alumni, certificates, and settings).

---

## 🚀 Running the Application

### 1. Production Mode (Single Port 5000)
Runs the backend API and serves the production-compiled frontend client together:
```bash
npm start
```
Open [http://localhost:5000](http://localhost:5000) in your browser.

### 2. Development Mode (with Live Reloading & HMR)
Runs Express on port 5000 and Vite dev server on port 3000:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Re-seed Initial Database
```bash
npm run seed
```

### 4. Run Automated End-to-End Verification Tests
```bash
node server/test-e2e.js
```
*(Runs 35 automated checks covering auth, QR generation, member verification, CRUD, and security)*
