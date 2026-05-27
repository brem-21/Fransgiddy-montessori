# Fransgiddy Royal School — Management System

A full-stack school management platform built for Fransgiddy Royal School. It covers everything from student enrolment and academic results to daily fee collection, announcements, SMS broadcasts, and printable report cards — all behind a role-based dashboard for Principals and Teachers.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Default Credentials](#default-credentials)
- [API Overview](#api-overview)
- [Roles & Permissions](#roles--permissions)

---

## Overview

The system has two sides:

| Side | Description |
|------|-------------|
| **Public (Guest)** | Landing page with photo slideshow, school announcements, and admission enquiry form |
| **Dashboard** | Authenticated area for Principal (admin) and Teachers |

The Principal has full visibility — all students, all fee collections, all results, analytics, user management, and transcripts. Teachers see only their assigned classes and their own fee entries.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.2.5 |
| Security | Spring Security + JWT (HS384) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 15 (port 5433) |
| Build | Maven |
| Utilities | Lombok |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (Radix UI primitives) |
| Forms | React Hook Form + Zod |
| HTTP | Axios |

---

## Features

### Public / Guest
- **Landing page** — hero section, photo slideshow (10-second auto-advance, pause on hover, prev/next controls), school stats, and feature highlights
- **Announcements** — published news, events, and announcements with optional media
- **Admission enquiry** — public registration form; Principal reviews and updates status

### Principal Dashboard
- **Dashboard** — at-a-glance summary: student count, today's fees, active teachers, pending registrations
- **User management** — create teacher accounts (phone + password), activate/deactivate, delete
- **Student management** — add, edit, and deactivate student records
- **Class management** — create classes, assign teachers and students
- **Results entry** — enter subject scores for any student in any class
- **Report cards** — generate per-student, per-term report cards with:
  - Class position (e.g., *2nd out of 12 students*)
  - Teacher's remarks (auto-suggested by performance tier; editable)
  - School Reopens date
  - Printable / PDF via browser print
- **Transcripts** — full academic record across all terms and years; export as CSV or print
- **Rankings** — class leaderboard with ordinal positions and total student count
- **Fee entry** — record daily fee payments on behalf of any teacher or self
- **Fee analytics** — filterable summary with CSV export (by date range, teacher, student, class)
- **Content / Announcements** — create, publish/unpublish, delete announcements with media uploads
- **SMS broadcast** — send bulk SMS to parents, teachers, or custom recipients via mNotify; approve/reject teacher requests
- **Registrations** — manage admission enquiries (Pending → Reviewed → Accepted / Rejected)
- **Settings** — school name, address, phone, academic year

### Teacher Dashboard
- **Results entry** — enter and update scores for students in their assigned classes only
- **Report cards** — generate report cards for their students
- **Rankings** — view class rankings for their assigned classes
- **Fee entry** — record fee payments collected from students; view today's entries and running total
- **My Analytics** — personal fee collection summary with charts
- **SMS** — request bulk SMS; view own request history

---

## Project Structure

```
Fransgiddy-montessori/
├── backend/                        # Spring Boot application
│   ├── src/main/java/com/fransgiddy/montessori/
│   │   ├── config/                 # SecurityConfig, DataSeeder, CORS
│   │   ├── controller/             # REST endpoints
│   │   ├── dto/                    # Request/Response records
│   │   │   ├── auth/
│   │   │   ├── fee/
│   │   │   ├── result/             # ReportCardResponse, TranscriptResponse, RankingsResponse
│   │   │   └── student/
│   │   ├── entity/                 # JPA entities
│   │   ├── enums/                  # Role, Term, AnnouncementType
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── security/               # JWT filter, UserDetailsService
│   │   └── service/                # Business logic
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── backend-env.env             # Local environment variables (gitignored)
│   └── pom.xml
│
└── frontend/                       # Next.js application
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx            # Public landing page with slideshow
    │   │   ├── login/
    │   │   ├── register/
    │   │   ├── admin/              # Principal dashboard pages
    │   │   │   ├── dashboard/
    │   │   │   ├── students/
    │   │   │   ├── users/
    │   │   │   ├── classes/
    │   │   │   ├── results/
    │   │   │   ├── report-card/
    │   │   │   ├── transcript/
    │   │   │   ├── rankings/
    │   │   │   ├── fees/
    │   │   │   ├── analytics/
    │   │   │   ├── registrations/
    │   │   │   ├── content/
    │   │   │   ├── sms/
    │   │   │   └── settings/
    │   │   └── teacher/            # Teacher dashboard pages
    │   │       ├── dashboard/
    │   │       ├── results/
    │   │       ├── report-card/
    │   │       ├── rankings/
    │   │       ├── fees/
    │   │       ├── analytics/
    │   │       └── sms/
    │   ├── components/
    │   │   ├── ui/                 # shadcn/ui primitives
    │   │   ├── DashboardLayout.tsx
    │   │   ├── Sidebar.tsx         # Responsive collapsible sidebar
    │   │   ├── Navbar.tsx
    │   │   └── Slideshow.tsx       # Auto-advancing photo slideshow
    │   ├── contexts/
    │   │   └── AuthContext.tsx
    │   ├── hooks/
    │   │   ├── use-my-students.ts
    │   │   └── use-toast.ts
    │   ├── lib/
    │   │   └── api.ts              # Axios client + all API calls
    │   └── types/
    │       └── index.ts            # TypeScript interfaces
    ├── .env.local
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Java 21** (`java -version`)
- **Maven 3.9+** (`mvn -version`)
- **Node.js 18+** (`node -v`)
- **PostgreSQL 15** running on port **5433**
- A PostgreSQL database named `montessori`

```sql
-- Run once in psql
CREATE DATABASE montessori;
```

---

### Backend Setup

```bash
cd backend

# Copy the example env file and fill in your values
cp backend-env.example.env backend-env.env
# Edit backend-env.env with your DB credentials, JWT secret, etc.

# Start the server (sources backend-env.env automatically)
bash start.sh
```

The backend starts on **http://localhost:8081**.

On first run, `DataSeeder` automatically populates the database with:
- A Principal account
- 3 teacher accounts
- 12 sample students across 4 classes
- Sample results, fees, announcements, and registrations

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp frontend-env.example.env .env.local
# Ensure NEXT_PUBLIC_API_URL=http://localhost:8081/api

# Start the development server
npm run dev
```

The frontend runs on **http://localhost:3000**.

---

## Environment Variables

### Backend (`backend/backend-env.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASS` | PostgreSQL password | `password` |
| `JWT_SECRET` | HS384 signing key (≥ 32 chars) | `changeme-very-long-secret-...` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |
| `PRINCIPAL_NAME` | Name for seeded principal | `School Principal` |
| `PRINCIPAL_PASSWORD` | Password for seeded principal | `Principal@2024` |
| `UPLOAD_DIR` | Directory for media uploads | `uploads` |
| `MNOTIFY_API_KEY` | mNotify SMS gateway API key | *(from mNotify dashboard)* |
| `MNOTIFY_SENDER_ID` | SMS sender name | `FransgiddyRS` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8081/api` |

---

## Default Credentials

These are seeded automatically on first run. **Change them immediately in production.**

| Role | Phone | Password |
|------|-------|----------|
| Principal | `0302000001` | `Principal@2024` |
| Teacher 1 (Abena Asante) | `0244100001` | `Teacher@2024` |
| Teacher 2 (Kofi Mensah) | `0244100002` | `Teacher@2024` |
| Teacher 3 (Akosua Boateng) | `0244100003` | `Teacher@2024` |

---

## API Overview

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>` headers.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/login` | Public | Login with phone + password |
| `POST` | `/public/registrations` | Public | Submit admission enquiry |
| `GET` | `/public/announcements` | Public | Fetch published announcements |
| `GET` | `/students` | Auth | List students (filtered by role) |
| `POST` | `/students` | Principal | Create student |
| `PUT` | `/students/{id}` | Principal | Update student |
| `DELETE` | `/students/{id}` | Principal | Deactivate student |
| `GET` | `/admin/users` | Principal | List all users |
| `POST` | `/admin/users` | Principal | Create teacher account |
| `PATCH` | `/admin/users/{id}/toggle` | Principal | Toggle user active status |
| `GET` | `/admin/classes` | Auth | List school classes |
| `POST` | `/results` | Auth | Enter a subject result |
| `GET` | `/results/report-card` | Auth | Generate report card (with position) |
| `GET` | `/results/transcript` | Principal | Full academic transcript |
| `GET` | `/results/rankings` | Auth | Class rankings with ordinal positions |
| `POST` | `/fees` | Auth | Record fee payment |
| `GET` | `/fees/my-fees` | Auth | List own fee entries |
| `GET` | `/fees/analytics` | Principal | Full fee analytics |
| `GET` | `/fees/all` | Principal | All fee entries (for CSV export) |
| `GET` | `/admin/registrations` | Principal | List admission enquiries |
| `PATCH` | `/admin/registrations/{id}/status` | Principal | Update enquiry status |
| `POST` | `/admin/sms/send` | Principal | Send SMS broadcast |
| `POST` | `/teacher/sms/request` | Teacher | Request SMS broadcast |

---

## Roles & Permissions

| Feature | Principal | Teacher |
|---------|-----------|---------|
| View all students | ✅ | Own classes only |
| Manage students (add/edit/deactivate) | ✅ | ❌ |
| Manage users | ✅ | ❌ |
| Enter results | ✅ All | Own classes only |
| Generate report cards | ✅ All | Own classes only |
| Generate transcripts | ✅ | ❌ |
| View rankings | ✅ All | Own classes only |
| Enter fees | ✅ Any collector | Self only |
| View fee analytics | ✅ Full | Own entries only |
| Export CSV (fees, transcript) | ✅ | ❌ |
| Manage announcements | ✅ | ❌ |
| Send SMS directly | ✅ | Request only |
| Manage registrations | ✅ | ❌ |
| School settings | ✅ | ❌ |

---

## Contributing

1. Fork the repo and create a feature branch (`git checkout -b feat/my-feature`)
2. Make your changes and ensure `mvn compile` (backend) and `npx tsc --noEmit` (frontend) pass cleanly
3. Open a pull request with a clear description of what changed and why

---

*Built with care for Fransgiddy Royal School — Accra, Ghana.*
