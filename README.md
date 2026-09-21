# Meetly

**Meetly** is a full-stack event discovery, management, ticketing, and administration platform designed to provide a complete event lifecycle — from event discovery and event requests to ticket reservations, payments, QR-based check-in, notifications, analytics, and administration.

The project is built as a **Turborepo monorepo** with separate applications for the public web experience, mobile application, administration dashboard, and central backend API.

---

## Overview

Meetly connects event attendees, event organizers, and platform administrators through a unified platform.

Users can:

* Discover and search for events
* Filter events by category, location, date, and price
* View detailed event information
* Request new events
* Purchase tickets
* Reserve tickets temporarily during checkout
* Complete payments through supported payment providers
* Receive digital tickets with QR codes
* View and manage orders and tickets
* Favorite events
* Review attended events
* Receive event and order notifications

Administrators can:

* Manage users
* Review and approve event requests
* Create and manage events
* Manage categories and organizers
* Configure ticket types and inventory
* Manage orders and refunds
* Check in attendees using QR tickets
* Manage administrators, roles, and permissions
* View analytics
* Review audit logs

---

## Architecture

Meetly follows a modular monorepo architecture designed to keep the client applications separate from the business logic and persistence layer.

```text
                         ┌──────────────────┐
                         │      Users       │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │   Web    │ │  Mobile  │ │  Admin   │
              │ Next.js  │ │   RN     │ │ Next.js  │
              └────┬─────┘ └────┬─────┘ └────┬─────┘
                   │            │            │
                   └────────────┼────────────┘
                                ▼
                       ┌────────────────┐
                       │   NestJS API   │
                       └───────┬────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌───────────┐     ┌──────────────┐
       │ PostgreSQL│     │   Redis   │     │ Object Store │
       │ + TypeORM │     │ + BullMQ  │     │    + CDN     │
       └───────────┘     └───────────┘     └──────────────┘
                               │
                               ▼
                        Background Workers
```

---

## Monorepo Structure

```text
meetly/
├── apps/
│   ├── api/                    # NestJS backend API
│   ├── web/                    # Next.js public/user application
│   ├── admin/                  # Next.js administration dashboard
│   └── mobile/                 # React Native mobile application
│
├── packages/
│   ├── api-client/             # Shared typed API client
│   ├── types/                  # Shared TypeScript contracts
│   ├── validation/             # Shared validation schemas
│   ├── config/                 # Shared configuration
│   ├── ui/                     # Shared UI components
│   ├── eslint-config/          # Shared ESLint configuration
│   └── typescript-config/      # Shared TypeScript configuration
│
├── infrastructure/
│   └── docker/                 # Local/production infrastructure
│
├── docs/                       # Engineering documentation
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Applications

### Web

The public-facing Next.js application.

Responsibilities include:

* Event discovery
* Event search and filtering
* Event details
* Authentication
* Event requests
* Favorites
* Checkout
* Orders
* Tickets
* Reviews
* Notifications
* User profile

### Mobile

React Native application providing the core user experience on mobile platforms.

### Admin

Next.js administration dashboard for platform operators.

Responsibilities include:

* Dashboard
* User management
* Event management
* Event request approval
* Ticket management
* Order management
* Refunds
* Admin management
* Roles and permissions
* Analytics
* Audit logs

### API

NestJS central backend responsible for all business logic and data access.

The API is the authoritative source for:

* Authentication
* Authorization
* Event lifecycle
* Ticket inventory
* Pricing
* Orders
* Payments
* Ticket generation
* Check-in
* Notifications
* Analytics
* Audit logging

---

## Technology Stack

### Frontend

* [Next.js](https://nextjs.org/)
* React
* TypeScript
* Tailwind CSS
* React Native

### Backend

* [NestJS](https://nestjs.com/)
* TypeScript
* REST API
* Swagger / OpenAPI

### Database

* PostgreSQL
* TypeORM

> Prisma is intentionally not used in this project.

### Infrastructure

* Docker
* Redis
* BullMQ
* Object Storage
* CDN

### Payments

Meetly is designed around a payment-provider abstraction so different providers can be integrated without coupling the core order system to a single provider.

Potential providers include:

* bKash
* Nagad
* Stripe

### Monorepo

* pnpm
* Turborepo

---

## Core Domains

Meetly is organized around business domains rather than technical layers alone.

```text
Authentication
Users
Administrators
Roles
Permissions

Events
Event Requests
Categories
Organizers
Locations

Ticket Types
Reservations
Orders
Payments
Tickets
Check-in

Favorites
Reviews
Notifications

Uploads
Analytics
Audit Logs
```

---

## Authentication

### User Authentication

Users authenticate through an OTP-based flow.

The authentication system supports:

* OTP generation
* OTP hashing
* OTP expiration
* Attempt limits
* Resend cooldown
* Rate limiting
* One-time verification
* Session/token management

### Administrator Authentication

Administrator authentication is separated from normal user authentication.

The admin authentication flow includes:

```text
Email + Password
        ↓
Credential Validation
        ↓
MFA / OTP
        ↓
Authenticated Admin Session
        ↓
Permission-Based Authorization
```

---

## Authorization

Meetly uses **permission-based RBAC**.

```text
Admin
  │
  └── Roles
       │
       └── Permissions
```

Example permissions:

```text
events.read
events.create
events.update
events.delete
events.publish
events.cancel

users.read
users.update
users.block

orders.read
orders.refund

tickets.read
tickets.checkIn

admins.manage
roles.manage
permissions.manage

analytics.read
audit_logs.read
```

Authorization is always enforced by the backend.

The frontend must never be considered an authorization boundary.

---

## Event Lifecycle

Event requests and published events are separate concepts.

### Event Request

```text
PENDING
   │
   ├── APPROVED
   │      ↓
   │    Event Created
   │
   ├── REJECTED
   │
   └── CANCELLED
```

### Event

```text
DRAFT
  │
  ▼
SCHEDULED
  │
  ▼
ONGOING
  │
  ▼
COMPLETED
```

An event can also transition to:

```text
CANCELLED
```

Publication status is managed independently from the event lifecycle.

---

## Ticketing

Ticket inventory is one of the most critical parts of the system.

The backend is responsible for:

* Ticket availability
* Maximum tickets per order
* Temporary reservations
* Reservation expiration
* Inventory updates
* Order creation
* Ticket generation

### Reservation Flow

```text
Select Tickets
      ↓
Reserve Inventory
      ↓
Create Order
      ↓
Payment
   ┌──┴──┐
   │     │
Success  Failure
   │     │
   ▼     ▼
Tickets Release
Generated Inventory
```

Inventory-sensitive operations are executed transactionally to prevent overselling.

---

## Payments

Payments use a provider abstraction.

```text
PaymentProvider
├── createPayment()
├── verifyPayment()
├── refundPayment()
└── parseWebhook()
```

Payment success is determined by the payment provider's verified webhook rather than by a frontend response.

### Payment Flow

```text
Create Order
    ↓
Create Payment
    ↓
Payment Provider
    ↓
User Completes Payment
    ↓
Verified Webhook
    ↓
Idempotent Payment Processing
    ↓
Order Confirmed
    ↓
Tickets Generated
```

Webhook processing is designed to be idempotent so duplicate provider notifications do not create duplicate tickets or financial state changes.

---

## Digital Tickets

After successful payment:

```text
Order Confirmed
      ↓
Ticket Generated
      ↓
Unique Ticket Number
      ↓
QR Token Generated
      ↓
Ticket Delivered
```

Tickets can be validated through QR-based check-in.

The check-in operation is atomic to prevent the same ticket from being accepted multiple times.

---

## Notifications

Meetly supports multiple notification channels:

* In-app
* Email
* SMS
* Push notifications

Notifications are processed asynchronously where appropriate.

Examples include:

* OTP
* Event request updates
* Order confirmation
* Payment confirmation
* Payment failure
* Ticket generation
* Event reminders
* Event cancellation
* Event updates
* Refund completion

---

## Background Jobs

Redis and BullMQ are used for asynchronous processing.

Typical jobs include:

* OTP delivery
* Email delivery
* SMS delivery
* Push notifications
* Reservation expiration
* Event reminders
* Payment webhook processing
* Ticket/QR generation
* Reports

Jobs are designed with:

* Retry policies
* Backoff
* Idempotency
* Failure handling
* Observability

---

## Database

Meetly uses:

```text
PostgreSQL
     +
TypeORM
```

Core entities include:

```text
User
Admin
Role
Permission
RefreshToken
OTP

Category
Organizer
Location
EventRequest
Event
EventImage

TicketType
TicketReservation
Order
OrderItem
Payment
Ticket
TicketCheckIn

Favorite
Review
Notification
AuditLog
```

Critical database invariants are enforced through a combination of:

* Application validation
* Database constraints
* Foreign keys
* Unique constraints
* Indexes
* Transactions
* Row-level locking where required

---

## Search

Meetly initially uses PostgreSQL for event search and filtering.

Supported filtering concepts include:

* Search term
* Category
* Location
* City
* Date
* Price range
* Event status
* Sorting
* Pagination

A dedicated search engine can be introduced later if actual scale and product requirements justify it.

---

## Time & Timezones

Meetly stores timestamps in UTC.

Events additionally retain their IANA timezone.

For example:

```text
Asia/Dhaka
```

Event times should be presented according to the event's timezone where appropriate.

---

## Security Principles

The system follows a backend-first security model.

The backend never trusts frontend-provided:

* User identity
* Roles
* Permissions
* Ticket prices
* Order totals
* Inventory values
* Payment status

Security controls include:

* JWT/session security
* Refresh-token rotation
* OTP hashing
* Rate limiting
* Helmet
* CORS
* Input validation
* MFA for administrators
* Permission guards
* Webhook signature verification
* Audit logging
* Secure secret management

---

## API

All APIs are versioned under:

```text
/api/v1
```

Example:

```http
GET /api/v1/events
GET /api/v1/events/:id
POST /api/v1/orders
GET /api/v1/me/tickets
POST /api/v1/admin/events
POST /api/v1/admin/events/:id/publish
POST /api/v1/admin/tickets/:id/check-in
```

API documentation is generated through Swagger/OpenAPI.

---

## API Response Format

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event not found"
  }
}
```

### Pagination

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Testing Strategy

Meetly uses multiple levels of testing.

### Unit Tests

Business logic and domain rules.

Examples:

* Authentication
* Event lifecycle
* Event request approval
* Order calculation
* Payment processing
* Ticket generation
* Reservation expiration

### Integration Tests

Examples:

* OTP verification
* Database transactions
* Payment webhooks
* Inventory reservation
* Ticket generation
* Check-in

### End-to-End Tests

The most important user journey:

```text
Signup
  ↓
Login
  ↓
Browse Event
  ↓
View Event
  ↓
Select Ticket
  ↓
Reserve
  ↓
Create Order
  ↓
Payment
  ↓
Ticket Generated
  ↓
QR Check-in
```

Concurrency testing is especially important for ticket inventory.

---

## Development Roadmap

### Phase 1 — Foundation

* Turborepo
* pnpm
* NestJS
* PostgreSQL
* TypeORM
* Docker
* Configuration
* Logging
* Validation
* Swagger
* Testing infrastructure

### Phase 2 — Authentication

* User OTP authentication
* Refresh tokens
* User profiles
* Admin authentication
* MFA

### Phase 3 — Authorization

* Roles
* Permissions
* Permission guards
* Admin management

### Phase 4 — Events

* Categories
* Organizers
* Locations
* Event requests
* Events
* Publication workflow

### Phase 5 — Ticketing

* Ticket types
* Reservations
* Inventory management

### Phase 6 — Orders & Payments

* Orders
* Order items
* Payment abstraction
* Payment providers
* Webhooks
* Refunds

### Phase 7 — Tickets

* Ticket generation
* QR codes
* Check-in

### Phase 8 — Notifications

* Email
* SMS
* Push
* In-app notifications
* Background jobs

### Phase 9 — Web

* Event discovery
* Event details
* Authentication
* Checkout
* Orders
* Tickets
* Profile

### Phase 10 — Administration

* Dashboard
* Event management
* User management
* Order management
* Ticket management
* Analytics
* Audit logs

### Phase 11 — Mobile

* React Native application
* Authentication
* Discovery
* Checkout
* Tickets
* Notifications

### Phase 12 — Production

* CI/CD
* Monitoring
* Logging
* Backups
* Security hardening
* Performance testing
* Production deployment

---

## Local Development

### Prerequisites

* Node.js
* pnpm
* Docker
* PostgreSQL
* Redis

### Install dependencies

```bash
pnpm install
```

### Start infrastructure

```bash
docker compose up -d
```

### Start development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

### Typecheck

```bash
pnpm typecheck
```

### Test

```bash
pnpm test
```

> The exact scripts may evolve as the monorepo implementation progresses.

---

## Environment Variables

Environment configuration is validated at application startup.

Typical configuration includes:

```env
DATABASE_URL=
REDIS_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

PAYMENT_PROVIDER=
PAYMENT_API_KEY=
PAYMENT_WEBHOOK_SECRET=

EMAIL_PROVIDER=
SMS_PROVIDER=
PUSH_PROVIDER=
```

Secrets must never be committed to the repository.

Use environment-specific configuration for development, staging, and production.

---

## Documentation

The complete engineering documentation is maintained separately under:

```text
/docs
```

Documentation covers:

* Product requirements
* User stories
* User flows
* System architecture
* Monorepo architecture
* Backend architecture
* Database architecture
* Entity models
* ERD
* API standards
* API catalog
* Security
* Ticketing
* Payments
* Notifications
* Search
* Timezones
* Analytics
* Testing
* DevOps
* Roadmap
* Task backlog
* Architecture decisions
* Risk register
* Definition of Done

---

## Engineering Principles

Meetly follows several core principles:

1. **Backend is the source of truth.**
2. **Never trust client-calculated financial values.**
3. **Never trust client authorization claims.**
4. **Protect ticket inventory transactionally.**
5. **Payment webhooks are authoritative.**
6. **Financial operations must be idempotent.**
7. **Critical administrative actions are auditable.**
8. **Keep business logic inside domain services.**
9. **Keep external integrations behind provider abstractions.**
10. **Prefer a modular monolith before introducing unnecessary microservices.**
11. **Use PostgreSQL constraints as a second line of defense.**
12. **Keep documentation and implementation synchronized.**

---

## Project Status

> **Status: In Development**

Meetly is being developed incrementally according to the engineering roadmap and implementation blueprint.

The architecture and documentation are being established before implementing the complete production feature set.

---

## License

License information will be added when the project's distribution model is finalized.
