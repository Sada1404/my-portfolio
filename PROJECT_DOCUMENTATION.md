# Mangwale Dispatcher Platform — Technical Documentation

**Purpose:** Resume-ready and portfolio-ready technical overview of the **dispatcher-web** (React) and **dispatcher-api** (NestJS) projects that power the Mangwale delivery and business platform.

---

## 1. Executive Summary

The **Mangwale Dispatcher Platform** is a full-stack delivery management system consisting of:

- **dispatcher-web** — React SPA for internal ops (delivery management, orders, riders, admin) and the B2B portal **business.mangwale.com** (Enterprise API users).
- **dispatcher-api** — NestJS backend providing auth, orders, multi-provider logistics (Porter, LoadShare, Mangwale), webhooks, live tracking, enterprise API, and third-party integrations.

Together they support:
- **Internal operations:** Create/book orders, manage riders, pricing, feedback, notifications.
- **Multi-provider logistics:** Quote and create orders via Porter, LoadShare, or Mangwale Rider API; status sync via webhooks.
- **Customer tracking:** Public tracking pages (e.g. track.mangwale.in) with live map and status.
- **B2B (business.mangwale.com):** Enterprise signup, API keys, wallet, orders, invoices, and API documentation.

---

## 2. Technology Stack

### 2.1 dispatcher-web (Frontend)

| Category | Technology |
|----------|------------|
| **Framework** | React 19 |
| **Routing** | React Router v7 |
| **UI / Styling** | Bootstrap 5, React-Bootstrap, DaisyUI, Tailwind CSS 4 |
| **Maps** | Leaflet, react-leaflet, leaflet-routing-machine; Google Maps (@react-google-maps/api) with fallback to OSM |
| **HTTP / State** | Axios, TanStack React Query |
| **Tables / Export** | DataTables (datatables.net), jQuery, JSZip, pdfmake |
| **Utilities** | Moment.js, haversine-distance, sortablejs |
| **Build** | Create React App (react-scripts 5) |
| **Dev** | Jest, React Testing Library, PostCSS, Autoprefixer |

**Notable:** Single codebase serves both internal admin (track.mangwale.in) and **business.mangwale.com**; domain detection switches landing (Enterprise landing vs redirect to login) and navbar (Enterprise vs standard).

### 2.2 dispatcher-api (Backend)

| Category | Technology |
|----------|------------|
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5.7 |
| **ORM / DB** | TypeORM, PostgreSQL (pg); session store: connect-pg-simple |
| **Validation** | class-validator, class-transformer |
| **API Docs** | Swagger (NestJS Swagger), swagger-ui-express |
| **Auth** | Session-based (express-session), bcrypt/bcryptjs, role-based guards (admin, superadmin, enterprise) |
| **HTTP** | Axios, NestJS AxiosModule |
| **Scheduling** | @nestjs/schedule |
| **Files / PDF** | Multer, pdfkit, html-pdf-node, ExcelJS, xlsx, QRCode, nodemailer |
| **Payments** | Razorpay (enterprise wallet recharge) |
| **Push** | Firebase Admin (optional) |
| **Testing** | Jest, Supertest |

**Database:** PostgreSQL with JSONB for `route_data`, `metadata`, `flow`; migrations supported (e.g. 001_init_pg.sql).

---

## 3. System Architecture

### 3.1 High-Level Flow

```
[Internal Admin / Ops]     [Enterprise Users - business.mangwale.com]     [End Customers]
         |                                    |                                    |
         v                                    v                                    v
   dispatcher-web  <----------------->  dispatcher-api  <----------------->  Mangwale Rider API
   (React, port 3000)                    (NestJS, port 5000)                  (Porter / LoadShare)
         |                                    |                                    |
         |                                    |                                    |
         +-------- Orders, Quotes, Tracking, Webhooks, Enterprise API --------------+
         |                                    |
         v                                    v
   PostgreSQL (orders, users, enterprise_accounts, enterprise_wallets, sessions)
```

### 3.2 dispatcher-api Module Layout

- **Config** — Environment and app config.
- **Database** — TypeORM entities (Order, User, Customer, Vendor, Feedback, Raider, Settings, Address, Notification, DeliveryPricing, Enterprise entities), optional DatabaseService for raw SQL.
- **Auth** — Login/logout, session, role guards (admin, superadmin, enterprise).
- **Users** — User CRUD and management.
- **Orders** — Order lifecycle: create, update status, list, details; multi-delivery (route_data); integration with plugins.
- **Plugins** — **Porter**, **LoadShare**, **Mangwale** (LogisticsProvider: getQuote, createOrder, cancelOrder, track); Mangwale webhook controller.
- **Webhooks** — Order status webhooks to helper.mangwale.com; provider webhooks (e.g. Mangwale → dispatcher); order automation (pull from remote DB and create orders).
- **Live-tracking** — Endpoints under `/api/webhooks/mangwale` for rider location/status push from Mangwale Rider API; persistence and retrieval for tracking page.
- **Notifications** — In-app and optional push (Firebase).
- **Feedback** — Questions and responses.
- **Addresses** — Saved addresses CRUD.
- **Delivery-pricing** — Pricing rules and config.
- **Enterprise** — Enterprise accounts, API keys, wallet, recharge (Razorpay), invoices (EJS/PDF), webhooks; Enterprise API (quote, create order, cancel, track) with API key + rate limiting.
- **Third-party** — External API for pricing, bulk address upload, Mangwale-order creation (X-API-Key).
- **Public** — Static assets (e.g. ads), template endpoints.
- **Media** — File uploads.
- **Contacts** — Contact form or similar.
- **Schedules** — Cron/scheduled tasks.
- **Riders** — Rider data and management.

### 3.3 dispatcher-web Route Structure

- **Public:** `/track/:orderId/:d_contact` (UserTrackingPage), `/raider/track` (RaiderTrackingPage).
- **Auth:** `/login`, `/signup` (admin only).
- **Internal (session, non-enterprise):** `/` (DeliveryManagement), `/orders`, `/order-details/:orderId`, `/customers`, `/delivery-partners`, `/multi-delivery`, `/addresses`, `/admin/settings`, `/notifications`, `/configuration`, `/allorders`, `/users`, `/admin/feedback-*`, `/admin/delivery-pricing`, `/admin/enterprise/*`, `/admin/wallet-recharge-approvals`.
- **Enterprise (user_type === 'enterprise'):** `/enterprise/dashboard`, `/enterprise/orders`, `/enterprise/wallet`, `/enterprise/api-keys`, `/enterprise/invoices`, `/enterprise/documentation`.
- **business.mangwale.com:** On that domain (or IP), `/` shows Enterprise landing + registration; after login, enterprise users go to `/enterprise/dashboard`.

---

## 4. Core Features (Resume-Oriented)

### 4.1 Multi-Provider Logistics

- **Unified interface:** Single `LogisticsProvider` interface: `getQuote`, `createOrder`, `cancelOrder`, `track`.
- **Providers:** Porter, LoadShare, Mangwale (in-house Rider API). Provider chosen per order (e.g. by automation `tracking_gateway` or UI selection).
- **Mangwale integration:** Full quote/order/cancel/track with Mangwale API; webhook at `POST /api/webhooks/mangwale` for order_created, rider_assigned, picked_up, delivered; status mapping to internal statuses.

### 4.2 Order and Delivery Management

- **Single and multi-stop:** Orders stored with `route_data` (JSONB) for multiple pickup/drop stops; legacy single pickup/drop columns kept for compatibility.
- **Order lifecycle:** Created → assigned → arrived_at_pickup → picked_up → reached_at_drop → delivered (and cancelled); status pushed to helper.mangwale.com and to provider webhooks where applicable.
- **Delivery management UI:** DeliveryManagement.js — quote from multiple providers, vehicle selection, place order, reorder; supports rewards, preferred vehicle types, processing time.

### 4.3 Live Tracking

- **Rider location/status:** Received from Mangwale Rider API via `/api/webhooks/mangwale` (e.g. location and status payloads); stored and served for tracking page.
- **User-facing:** UserTrackingPage with map (Leaflet/Google Maps), status timeline, and optional live rider position.

### 4.4 Enterprise (B2B) Platform — business.mangwale.com

- **Landing:** Marketing + registration form; domain detection (`business.mangwale.com` or IP) shows this instead of redirect-to-login.
- **Auth:** Same session-based auth; `user_type === 'enterprise'` gets Enterprise layout and routes.
- **Features:** Dashboard (stats, recent orders, wallet, API keys), Orders list/filters, Wallet (balance, transactions, recharge), API Keys (create/revoke, test/live), Invoices, Documentation (API docs).
- **Backend:** Enterprise module — accounts, API keys (hashed), wallets (live/test), wallet transactions, recharge with Razorpay, invoices (EJS + PDF), rate limiting, permission scopes; Enterprise API under `X-API-Key` / `X-API-Secret` for quote, create order, cancel, track (test mode returns simulated responses).

### 4.5 Third-Party and External APIs

- **Third-party API:** Pricing config, calculate pricing, create orders, bulk address upload (Excel), Mangwale-order flow; authenticated with `X-API-Key`.
- **Webhooks out:** Order status changes trigger POSTs to helper.mangwale.com (e.g. accepted, assigned, arrived-at-pickup, picked-up, reached-at-drop, delivered) with optional rider info.

### 4.6 Admin and Operations

- **Users, roles:** Admin, superadmin, enterprise; role-based routes and guards.
- **Feedback:** Configurable questions and response panel.
- **Delivery pricing:** Rules and configuration.
- **Wallet recharge approvals:** Admin approval for enterprise wallet top-ups.
- **Notifications:** In-app and optional Firebase.

### 4.7 Maps and Geo

- **Leaflet + OSM** as default; Google Maps when key available; fallback logic in components (e.g. UserTrackingMap, FallbackOSMMap).
- **Routing:** leaflet-routing-machine; haversine for distance.

---

## 5. Security and Auth

- **Sessions:** express-session with PostgreSQL store (connect-pg-simple), HttpOnly, Secure in production, SameSite=Lax.
- **CORS:** Whitelist includes track.mangwale.in, mangwale.com, business.mangwale.com, localhost; credentials true.
- **Enterprise API:** API key + secret validation, rate limiting, optional IP whitelist, permission scopes (e.g. quote, order.create, order.read, order.cancel).
- **Passwords:** bcrypt/bcryptjs.

---

## 6. Deployment and Environment

- **Frontend:** React build; proxy to API (e.g. `proxy: "http://localhost:5000"`); production: typically Nginx serving build and reverse-proxying `/api` to backend.
- **Backend:** Node (NestJS), port 5000; env: `DB_*`, `SESSION_SECRET`, `CORS_ORIGIN`, `MANGWALE_API_URL`, `MANGWALE_API_KEY`, `DISPATCHER_WEBHOOK_URL`, Razorpay keys, etc.
- **Domains:** track.mangwale.in (ops/tracking), business.mangwale.com (Enterprise), mangwale.com (main brand); helper.mangwale.com (webhook consumer).

---

## 7. Resume Bullet Points (Copy-Paste Friendly)

- **Full-stack delivery platform:** Built and maintained React (dispatcher-web) and NestJS (dispatcher-api) applications for order management, multi-provider logistics (Porter, LoadShare, Mangwale), and real-time tracking.
- **Multi-provider integration:** Implemented pluggable logistics providers (getQuote, createOrder, cancelOrder, track) and webhook handlers for status sync with Mangwale Rider API and external systems.
- **Enterprise B2B portal (business.mangwale.com):** Delivered end-to-end B2B experience: landing, registration, dashboard, wallet with Razorpay recharge, API key management, order history, and API documentation; secured with API key auth and rate limiting.
- **Real-time tracking:** Integrated live rider location and status from Mangwale API; built tracking UI with Leaflet/Google Maps and status timelines for customers.
- **Backend design:** Designed NestJS modules for orders, webhooks, live-tracking, enterprise (accounts, wallets, invoices), and third-party API; used TypeORM with PostgreSQL and JSONB for flexible route and metadata.
- **DevOps and APIs:** Configured CORS, session store (PostgreSQL), and environment-based config for multiple domains (track.mangwale.in, business.mangwale.com); documented and exposed REST and webhook APIs for internal and external consumers.

---

## 8. File and Repo Structure (Summary)

### dispatcher-web

- `src/App.js` — Router, session check, enterprise vs standard layout/navbar, route definitions.
- `src/pages/` — DeliveryManagement, OrderDetails, OrdersList, UserTrackingPage, RaiderTrackingPage; enterprise-user (Dashboard, Orders, Wallet, ApiKeys, Invoices, Documentation, Landing); enterprise admin (EnterpriseList, Create, Detail, Wallet, Invoices, Orders, ApiDocumentation); admin (WalletRechargeApprovals); others (Feedback, Configuration, etc.).
- `src/components/` — Maps (UserTrackingMap, EnhancedLiveTrackingMap, FallbackOSMMap, LiveOrdersMap), enterprise (EnterpriseLayout, EnterpriseNavbar, EnterpriseSidebar, RegistrationForm, StatCard, etc.), shared (Navbar, Button, Modals, etc.).
- `src/services/`, `src/contexts/`, `src/utils/` — API helpers, environment context, logger, geo, Google Maps loader.

### dispatcher-api

- `src/main.ts` — Bootstrap, CORS, session, Swagger at `/api/docs`.
- `src/app.module.ts` — Imports all feature modules and TypeORM config.
- `src/plugins/` — porter, loadshare, mangwale (provider + webhook controller); interfaces (logistics-provider.interface.ts).
- `src/enterprise/` — controllers (admin, API, auth-web, registration, user, wallet-recharge), services (order, wallet, auth, invoice, razorpay, etc.), entities, guards, DTOs.
- `src/orders/`, `src/webhooks/`, `src/live-tracking/` — Order lifecycle, webhook processing, live tracking endpoints.
- `src/database/entities/` — Order, User, Customer, Vendor, Feedback, Raider, Settings, Address, Notification, DeliveryPricing, Enterprise entities.

---

**Related docs:**
- **business.mangwale.com (portfolio):** See `BUSINESS_MANGWALE_PORTFOLIO.md` in this repo for product description, features, and copy for your portfolio site.
- **API details:** In dispatcher-api: `Enterprise_api.md`, `THIRD_PARTY_API_GUIDE.md`, `WEBHOOK_STATUS_UPDATE_DOCUMENTATION.md`, `MANGWALE_INTEGRATION_COMPLETE.md`.

*This document is intended for resume and portfolio use and reflects the codebase as of the last review.*
