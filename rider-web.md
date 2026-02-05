# Rider Onboarding & Delivery Management Platform — Portfolio Documentation

A full-stack **rider onboarding, order management, and last-mile delivery** platform comprising a NestJS backend API (**rider-api**) and a React SPA (**rider-web**). The system supports rider registration with OTP/KYC, attendance, real-time order assignment, multi-stop deliveries, earnings & wallet, and admin back-office—with WebSocket + FCM for live updates.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack Summary](#tech-stack-summary)
3. [Backend (rider-api)](#backend-rider-api)
4. [Frontend (rider-web)](#frontend-rider-web)
5. [Key Features & User Flows](#key-features--user-flows)
6. [Architecture & Design](#architecture--design)
7. [APIs & Integration](#apis--integration)
8. [Security & Auth](#security--auth)
9. [Deployment & Environment](#deployment--environment)

---

## Project Overview

| Aspect | Description |
|--------|-------------|
| **Purpose** | Rider lifecycle (registration → verification → attendance → orders → earnings) and admin management of riders, shipments, zones, and withdrawals |
| **Backend** | REST API + WebSocket namespaces; PostgreSQL; optional Google Maps / OSRM for routing |
| **Frontend** | React SPA with rider app (dashboard, orders, wallet, profile) and admin panel (riders, shipments, attendance, zones, withdrawals) |
| **Real-time** | Socket.IO (rider notifications + admin notifications namespaces), Firebase Cloud Messaging (FCM) for push |
| **Payments** | Razorpay for registration fee (create order, verify, webhook); manual/UPI proof flows |

---

## Tech Stack Summary

### Backend (rider-api)

| Category | Technologies |
|----------|--------------|
| **Runtime & framework** | Node.js, **NestJS 11** |
| **Language** | **TypeScript 5.7** |
| **Database** | **PostgreSQL** via **TypeORM** (migrations, entities) |
| **API docs** | **Swagger** (OpenAPI) at `/swagger` |
| **Auth** | **JWT** (separate secrets for admin vs rider), **bcryptjs** for passwords |
| **Validation** | **class-validator**, **class-transformer**, global validation pipe |
| **Real-time** | **Socket.IO** (`@nestjs/websockets`, `@nestjs/platform-socket.io`) |
| **Push notifications** | **Firebase Admin SDK** (FCM + optional storage) |
| **Email** | **Nodemailer** (SMTP) |
| **SMS / OTP** | **Msg91** API (with dev mock) |
| **Payments** | **Razorpay** (orders, verification, webhooks) |
| **Maps & routing** | **@turf/turf** (geospatial), **Google Distance Matrix API**, **OSRM** (fallback), Haversine fallback; rate-limited Google calls |
| **File uploads** | **Multer** |
| **HTTP client** | **Axios** (`@nestjs/axios`) |
| **Testing** | **Jest**, **Supertest** |
| **Tooling** | ESLint, Prettier, ts-node, tsconfig-paths |

### Frontend (rider-web)

| Category | Technologies |
|----------|--------------|
| **Framework** | **React 19** |
| **Build** | **Vite 7** with **@vitejs/plugin-react-swc** (SWC) |
| **Routing** | **React Router v7** |
| **State** | **React Context** (AuthContext, OngoingOrderContext); **Redux Toolkit** + **react-redux** (available for future use) |
| **UI & styling** | **Bootstrap 5**, **React Bootstrap**, **Tailwind CSS 4**, **PrimeReact**, **PrimeIcons**, **PrimeFlex** |
| **Maps** | **Leaflet**, **react-leaflet**; **@turf/turf**; optional **@react-google-maps/api** (config-driven) |
| **Charts** | **Chart.js**, **react-chartjs-2**, chartjs-plugin-annotation, chartjs-plugin-datalabels |
| **Dates** | **dayjs**, **moment**, **flatpickr**, **react-flatpickr**, **bootstrap-daterangepicker**, **react-datepicker** |
| **Rich text** | **Quill** (snow theme), **TipTap** (extensions: color, text-style, starter-kit) |
| **Animations** | **Framer Motion**, **GSAP** |
| **Icons** | **Bootstrap Icons**, **React Icons**, **PrimeIcons** |
| **HTTP** | **Axios** |
| **Real-time** | **socket.io-client** (rider notifications + admin notifications) |
| **Tooling** | ESLint, PostCSS, Autoprefixer |

---

## Backend (rider-api)

### Structure

- **`src/`**
  - **`main.ts`** — Bootstrap: CORS, cookie-parser, global validation pipe, raw body for Razorpay webhook, Swagger at `/swagger`, port binding with fallback.
  - **`app.module.ts`** — Root module: ConfigModule, TypeORM (PostgreSQL, `DATABASE_URL`), middleware (request logger), and feature modules.
  - **`config/`** — Configuration (upload dir, city/timezone, map defaults, rate card defaults, attendance/rewards flags).
  - **`common/`** — Middleware (request logger with `X-Req-Id`), shared services (e.g. dispatcher webhook, location sync).
  - **`entities/`** — TypeORM entities (riders, addresses, documents, shifts, attendance, shipments, stops, assignments, payments, withdrawals, cities, zones, etc.).
  - **`auth/`** — Admin + rider auth: JWT (admin 8h, rider 7d), guards (JwtAuthGuard, RiderJwtGuard, RolesGuard), AuthService, AuthBootstrap, email/SMS integration.
  - **`riders/`** — Rider CRUD, registration flow (start, address, selfie, documents, shifts), rider auth (password + OTP login, reset/change password).
  - **`otp/`** — OTP send/verify (Msg91, Mailer), session/init/check/profile for registration resume.
  - **`payments/`** — Razorpay: registration order create/verify, UPI/manual proof, webhook (signature verification via raw body).
  - **`files/`** — File upload handling (e.g. documents, selfies) with optional Firebase Storage.
  - **`admin/`** — Admin controllers: riders management, shipments, attendance, city/zone, registration, withdrawals; admin notification WebSocket gateway (`/admin-notifications`).
  - **`shipments/`** — Core delivery logic: ShipmentsService, MultiShipmentService, RoutingService, RouteDistanceService (Google → OSRM → Haversine), LocationProximityService, PostGISProximityService, ArrivalService, NotificationsService (WebSocket + FCM), BuzzService; controllers: shipments, webhooks, dispatcher, dispatcher-multi, mangwale-legacy, test, debug-webhook; DTOs and earnings utilities (single/multi-stop).
  - **`rider-locations/`** — Rider location tracking (entity, service) for proximity and live tracking.
  - **`websocket/`** — Rider notification gateway (`/notifications`), JWT auth, rider connection tracking.
  - **`attendance/`** — Start/end shift with optional selfie and geo; status endpoint.
  - **`wallet/`** — Wallet balance (from assignments), withdrawal requests, admin approval.
  - **`webhooks/`** — External webhooks (e.g. Razorpay).
  - **`firebase/`** — Firebase Admin (FCM, optional storage).
  - **`email/`** — Nodemailer SMTP.
  - **`sms/`** — SMS abstraction (Msg91 used via OTP module).
  - **`notifications/`** — Notification module used by shipments.
  - **`meta/`** — Meta endpoints (vehicle types, zones, registration fee).
  - **`reupload/`** — Reupload portal (token-based document re-upload).
  - **`menu/`** — Menu/back-office data.
  - **`seed/`** — Seed service for dev data.
  - **`test/`** — Test controller / utilities.
- **`migrations/`** — TypeORM migrations (e.g. AddMissingColumns).
- **`sql/`** — Raw SQL assets if any.

### Key Backend Features

- **Rider registration**: Multi-step flow (OTP for mobile/email, basic details, address, selfie, documents, shifts, registration fee). Resume via session/cookie and reupload via tokenized links.
- **Rider auth**: Password login and OTP login (request/verify), password reset (OTP), change password. Rider JWT for app and WebSocket.
- **Admin auth**: JWT with roles; bootstrap endpoint for current user.
- **Shipments**: Single and multi-stop; status lifecycle (CREATED → ASSIGNED → ACCEPTED → ARRIVED_AT_PICKUP → PICKED_UP → ARRIVED_AT_DROP → DELIVERED, etc.); assignments with timeouts; earnings (pickup/drop, rewards) computed with rate cards and Haversine/Google/OSRM.
- **Real-time**: Rider namespace for new orders, assignment updates, cancellations; admin namespace for admin-targeted notifications; FCM for push when app in background.
- **Location**: Rider location updates; proximity (PostGIS or in-memory); ETA and distance to pickup/drop.
- **Attendance**: Start/end with optional selfie and coordinates; rider.online as source of truth.
- **Wallet**: Balance from completed assignments; withdrawal requests; admin approval flow.

---

## Frontend (rider-web)

### Structure

- **`src/`**
  - **`main.jsx`** — Entry: React 19 createRoot, BrowserRouter, App; PrimeReact + Quill CSS; index.css.
  - **`App.jsx`** — AuthProvider + OngoingOrderProvider; Routes (public + private); layout via AdminLayout; global navigate, new-order and order-cancelled event listeners; RealTimeDataService and NotificationService init; cache cleanup.
  - **`context/`** — AuthContext (token, rider profile, login/logout), OngoingOrderContext (current order state for app).
  - **`layouts/`** — AdminLayout: sidebar/header/footer for admin; RiderHead for rider; EXCLUDED/ORDER_PAGES for layout rules; admin JWT check; AdminNotificationModal.
  - **`pages/`** — Login, ResetPassword, ChangePassword; RiderRegister (full wizard); CheckoutPage, ReuploadPortal, PaymentProofPortal; Dashboard, NewOrderPopup, OrderPickup, OrderDelivery, OrderEarnings, OrderCancelled, OrderStepper, OrderAssignment; Orders, Notifications, Wallet, Profile; Admin: AdminLogin, AdminRiders, AdminRidersManagement, RiderDetails, AdminShipmentsManagement, AdminAttendanceManagement, AdminUserManage, AdminZones, AdminWithdrawals.
  - **`components/`** — Reusable UI: Button, Modal, TextInput, PhoneInput, DateInput, Dropdown, SelectComponent, FileUploadComponent, AddressInput, MiniMap (Leaflet), DataTable, Table, Filter, Searchbar, OnlineToggle, BottomNav, RiderDashboard, NewOrderPopup, OrderNotificationPopup, RealTimeNotifications, AdminNotificationModal, etc.
  - **`services/`** — RealTimeDataService (Socket.IO + FCM, cache, auto-refresh, fallback polling), NotificationService (FCM + WebSocket navigation), AdminNotificationService, RateCardService, RouteDistanceService (Google/OSRM usage from env).
  - **`hooks/`** — useRealTimeData (data, connection status, events, force refresh).
  - **`utils/`** — apiConfig (OTP, RIDER, PAYMENT, META, AUTH, GEO_ADMIN, ATTENDANCE), auth (token, rider info, login, logout), cacheManager, gateways, notificationsStore, ongoingOrder, navigation, downloadUtils, timeUtils, earningsCalculator, etc.
  - **`assets/`** — CSS (rider, style, wallet, profile, etc.), ServerLoader, images, sounds (e.g. new order alert).
- **`public/`** — Static assets, sounds, clear-cache/generate-sound pages.
- **`vite.config.js`** — Vite + React (SWC).
- **`tailwind.config.js`** — Tailwind 4 content paths.
- **`.env.example`** — VITE_GMAPS_KEY (and any VITE_* used).

### Key Frontend Features

- **Rider app**: Login (password/OTP), dashboard with online toggle and ongoing order card; new order popup with map and earnings; order flow (pickup → delivery/stepper → assignment → earnings/cancelled); orders list; notifications; wallet; profile; change password.
- **Rider registration**: Multi-step wizard (mobile/email OTP, basic details + address, selfie, documents, shifts, T&C, payment); checkout with Razorpay/manual/UPI; reupload and payment-proof portals.
- **Admin panel**: Riders list and management, rider detail (documents, shipments, status); shipments management; attendance; city/zone management; user management; withdrawals; admin notifications over WebSocket.
- **Real-time**: Socket.IO connection with rider JWT; subscription to new_order, order_updated, order_cancelled, etc.; FCM for push; navigation and modal triggers from events; fallback polling when WebSocket unavailable.
- **Maps**: Leaflet/react-leaflet in MiniMap and order flows; optional Google Maps (via env); OSRM for route polyline where configured.

---

## Key Features & User Flows

### Rider registration (end-to-end)

1. **Start** — OTP send/verify for mobile and email (Msg91/SMTP); optional session init for resume.
2. **Basic details** — Name, vehicle type, zone, language; address (single component).
3. **Selfie & documents** — Upload selfie and KYC docs (type-specific); reupload via email token.
4. **Shifts** — Preferred shift slots.
5. **Terms** — Accept T&C; then payment (Razorpay or manual/UPI proof).
6. **Post-payment** — Status polling or redirect; on success, rider can log in.

### Rider order flow

1. **Dashboard** — Go online (attendance start with optional selfie); see available orders and ongoing order card.
2. **New order** — Real-time offer (WebSocket/FCM) → New Order popup with map, ETA, earnings, accept/decline.
3. **Accepted** — Navigate to pickup → arrive → pickup confirmation → delivery (or multi-stop stepper/assignment) → delivery confirmation → earnings screen (or cancelled).

### Admin

- **Riders**: List, filters, rider detail (profile, documents, shipments, status), approve/reject/request reupload.
- **Shipments**: Create/manage shipments; dispatcher/webhook integration; view status and assignments.
- **Attendance**: View and manage rider attendance/online status.
- **Zones/Cities**: CRUD for cities and zones (geo coverage).
- **Withdrawals**: List and approve/reject rider withdrawal requests.
- **Notifications**: Admin-targeted WebSocket notifications (modal in layout).

---

## Architecture & Design

- **Monorepo-style**: Two codebases (rider-api, rider-web) that share no single repo root in the layout shown; typically deployed separately (API on Node, web as static + SPA).
- **API design**: REST with JSON; DTOs validated at controller level; Swagger for discovery; cookie + Bearer JWT for auth; raw body only on Razorpay webhook path.
- **Real-time**: Two Socket.IO namespaces—one for riders (order/assignment/cancel events), one for admins (admin notifications); JWT auth on connect; FCM for push when client is backgrounded.
- **State**: Frontend uses React Context for auth and ongoing order; optional Redux Toolkit for future scaling; sessionStorage/localStorage for token and cache.
- **Offline/fallback**: RealTimeDataService uses polling when WebSocket fails; cache for available/ongoing orders and dashboard stats.

---

## APIs & Integration

| Integration | Purpose |
|------------|---------|
| **Razorpay** | Registration fee: create order, verify payment, webhook for signature verification |
| **Msg91** | Send/verify OTP for registration and rider login (SMS) |
| **Nodemailer (SMTP)** | Email OTP, reupload links, transactional mail |
| **Firebase** | FCM push notifications; optional Firebase Storage for uploads |
| **Google Maps** | Distance Matrix (route distance/duration); optional frontend map (via VITE_GMAPS_KEY) |
| **OSRM** | Public or self-hosted OSRM for route geometry and distance/duration fallback |
| **Turf** | Geospatial helpers (distance, point-in-poly for zones, etc.) |

---

## Security & Auth

- **Admin**: JWT in `Authorization: Bearer` or cookie; roles; guarded routes and RolesGuard.
- **Rider**: Separate JWT secret (RIDER_JWT_SECRET); used for REST and WebSocket; password hashed with bcryptjs; OTP for login and reset.
- **CORS**: Allowed origins from env (WEB_ORIGIN, FRONTEND_URL) plus dev defaults (localhost, 127.0.0.1, etc.); credentials true.
- **Validation**: Global ValidationPipe (whitelist, transform); class-validator on DTOs.
- **Webhook**: Razorpay webhook uses raw body and signature verification; no global raw body to avoid breaking JSON parsing elsewhere.

---

## Deployment & Environment

### Backend (rider-api)

- **Port**: From `PORT` (default 4000), with fallback to PORT+1, PORT+2 if in use.
- **Env**: `DATABASE_URL`, `ADMIN_JWT_SECRET`, `RIDER_JWT_SECRET`, `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, `WEB_ORIGIN` / `FRONTEND_URL`, `GOOGLE_MAPS_API_KEY`, `OSRM_BASE_URL`, `MSG91_API_KEY`, SMTP vars, Firebase (FB_*, TEMP_FB_*), `UPLOAD_DIR`, etc.
- **DB**: Run TypeORM migrations (`migration:run`) before start; `synchronize: false` in app.

### Frontend (rider-web)

- **Build**: `vite build`; output typically served as static files (e.g. Nginx, CDN).
- **Env**: `VITE_API` (backend base URL), `VITE_GMAPS_KEY`, `VITE_REGISTRATION_FEE_WAIVED`, etc.; all client-side vars must be prefixed with `VITE_`.

---

## Summary for Portfolio

This project demonstrates:

- **Full-stack delivery**: NestJS + TypeORM + PostgreSQL backend and React + Vite frontend with rider and admin experiences.
- **Real-time**: Socket.IO namespaces (rider + admin) and FCM push with fallback polling and connection monitoring.
- **Auth & security**: Dual JWT (admin/rider), OTP (Msg91 + email), bcrypt, validation, and CORS.
- **Payments**: Razorpay integration with webhook verification and manual/UPI proof flows.
- **Maps & routing**: Google Distance Matrix, OSRM, Turf, Leaflet/react-leaflet; ETA and earnings based on distance/time.
- **Operational features**: Rider registration with KYC and reupload tokens; attendance with selfie; multi-stop shipments; wallet and withdrawals; admin back-office and notifications.
- **DevEx & quality**: TypeScript on backend, Swagger, ESLint/Prettier, Jest/Supertest, structured modules and DTOs.

You can use this document as the basis for a portfolio page: copy sections (e.g. Tech Stack, Key Features, Architecture) into your site and trim or expand per project length you want to show.
