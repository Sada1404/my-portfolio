# business.mangwale.com — Portfolio Documentation

**Product:** Mangwale Enterprise — B2B API platform for delivery management  
**URL:** https://business.mangwale.com  
**Role:** Full-stack delivery platform (dispatcher-web + dispatcher-api)

Use this document to describe the project on your portfolio site, in interviews, or in proposals.

---

## 1. Product Overview

**business.mangwale.com** is the B2B portal of the Mangwale delivery ecosystem. It lets businesses:

- **Sign up** as enterprise customers and get API access.
- **Manage delivery operations** via a REST API: get quotes, create orders, cancel, and track in real time.
- **Use a prepaid wallet** for order charges, with recharge via Razorpay and optional admin approval.
- **Manage API keys** (test and live) and view **invoices** and **API documentation** in one place.

The same React app serves the internal operations dashboard (e.g. track.mangwale.in) and **business.mangwale.com**; the app detects the hostname and shows the Enterprise landing and flows only on the business subdomain (or configured IP).

---

## 2. Target Users

- **Businesses** that need to integrate delivery into their own apps (e.g. e‑commerce, pharmacy, grocery).
- **Developers** who integrate via API and use test/live keys and docs.
- **Operations** who monitor orders, balance, and invoices from the portal.

---

## 3. Key Features (For Portfolio Description)

### 3.1 Landing & Onboarding

- **Landing page** at **business.mangwale.com**: hero (“Mangwale Enterprise”), value proposition, and **registration form** (multi-step: required fields → optional business details).
- **Registration** sends data to backend (`/api/enterprise/register`); accounts start as pending and can be activated by admin.
- **Get Started** and **View API Docs** CTAs; **Login** leads to the same auth used for the rest of the platform (enterprise users see the Enterprise dashboard after login).

### 3.2 Dashboard

- **Enterprise dashboard** (`/enterprise/dashboard`) after login:
  - **Stats:** total orders, live vs test orders, wallet balance (live and test).
  - **Recent orders** and **API keys** summary.
  - Quick links to Orders, Wallet, API Keys, Invoices, Documentation.

### 3.3 Orders

- **Orders page** (`/enterprise/orders`): list of enterprise orders with filters (e.g. status, date, environment).
- Order details: status, route, amount, timestamps; optional link to public tracking page.

### 3.4 Wallet

- **Wallet page** (`/enterprise/wallet`):
  - **Balance** for test and live environments.
  - **Transaction history** (credits, debits, refunds, adjustments) with reference (order, recharge, etc.).
  - **Recharge:** trigger Razorpay payment; optional **admin approval** workflow for high-value or manual top-ups (admin panel: Wallet Recharge Approvals).

### 3.5 API Keys

- **API Keys page** (`/enterprise/api-keys`):
  - Create keys with name and environment (**test** or **live**).
  - View key prefix (full secret shown once at creation); revoke/disable keys.
  - Keys are hashed in DB; used with **X-API-Key** and **X-API-Secret** for Enterprise API calls.

### 3.6 Invoices

- **Invoices** (`/enterprise/invoices`): list and download invoices (generated from wallet transactions and order data; EJS + PDF on backend).

### 3.7 Documentation

- **Documentation** (`/enterprise/documentation`): in-app API docs for Enterprise API (quote, create order, cancel, track), auth (headers), and examples — so developers can integrate without leaving the portal.

### 3.8 API Capabilities (What Enterprises Integrate)

- **Quote:** POST body with pickup + drops (and optional order_type, vehicle_type); returns price and ETA (test mode returns simulated response).
- **Create order:** Single or multi-drop; wallet debited on success; order flows to Mangwale (or other configured provider).
- **Cancel order:** By order ID; wallet refund per business rules.
- **Track:** Order status and, when available, live tracking (rider location, status).

All secured with **API key + secret**, **rate limiting**, and optional **IP whitelist**; **test** environment avoids real charges and can return mocks.

---

## 4. Tech Stack (Summary for Portfolio)

- **Frontend:** React 19, React Router, Bootstrap 5, React-Bootstrap (same codebase as internal dashboard).
- **Backend:** NestJS (TypeScript), PostgreSQL, TypeORM; session auth for web, API key + secret for API.
- **Payments:** Razorpay for wallet recharge.
- **Hosting / domains:** App runs on same stack as track.mangwale.in; **business.mangwale.com** is the dedicated subdomain for this product (and optionally an IP for staging).

---

## 5. Portfolio Copy (Short)

**One-liner:**  
“B2B portal and API platform for delivery management: signup, wallet, API keys, orders, and docs at business.mangwale.com.”

**Paragraph:**  
“**Mangwale Enterprise (business.mangwale.com)** is the B2B arm of the Mangwale delivery platform. I worked on the full stack: React frontend (landing, dashboard, orders, wallet, API keys, invoices, documentation) and NestJS backend (enterprise accounts, API key auth, rate limiting, wallet with Razorpay recharge, and order/quote/track APIs). Enterprises get a prepaid wallet, test and live API keys, and REST APIs for quotes, order creation, cancellation, and tracking, with optional webhooks and multi-drop support.”

**Bullets for resume/portfolio:**  
- Built B2B portal **business.mangwale.com**: landing, registration, dashboard, wallet, API keys, orders, invoices, and in-app API docs.  
- Implemented Enterprise REST API (quote, create order, cancel, track) with API key auth, rate limiting, and test/live environments.  
- Integrated Razorpay for wallet recharge and designed approval flow for high-value top-ups.  
- Single React codebase serving internal ops and Enterprise portal with domain-based routing and role-based UI.

---

## 6. Screenshots / Demo Suggestions

For portfolio or interviews, you can highlight:

1. **Landing:** Hero + registration form and “Why Choose Mangwale Enterprise” section.  
2. **Dashboard:** Stats cards, recent orders, wallet balance (test/live).  
3. **API Keys:** List of keys with environment and “Create key” flow.  
4. **Orders:** Filterable list and one order detail with status.  
5. **Wallet:** Balance and transaction history; recharge CTA.  
6. **Documentation:** In-app API docs (endpoints and examples).

---

## 7. Links to Use

- **Live product:** https://business.mangwale.com  
- **Main brand:** https://mangwale.com  
- **Tracking (public):** https://track.mangwale.in (and tracking page for a given order).

---

## 8. Business Context (For “About the Project”)

Mangwale is a delivery/logistics brand. The dispatcher platform has two main surfaces:

- **Internal:** Operations team uses track.mangwale.in for creating orders, managing riders, pricing, and support.  
- **B2B:** Business customers use **business.mangwale.com** to register, get API keys, fund a wallet, and integrate delivery into their own apps via the Enterprise API.

**business.mangwale.com** is the public-facing product for those B2B users and is the right name to use in a portfolio when referring to the “Mangwale Enterprise” product.

---

*Use this doc as the single source for how to describe business.mangwale.com in your portfolio, resume, and interviews.*
