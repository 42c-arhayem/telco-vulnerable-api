
# Telco Vulnerable API

A set of telecommunications API endpoints intentionally designed with security vulnerabilities for educational and testing purposes.

**Available in two implementations:**
- **REST API** (OpenAPI/Swagger) - in `rest-api/` directory
- **GraphQL API** - in `graphql-api/` directory

---

## � Repository Structure

```
telco-vulnerable-api/
├── rest-api/           # REST API (Express/Node.js) — port 3000
│   └── openapi/        # OpenAPI specs (vulnerable, remediated, protection)
├── graphql-api/        # GraphQL API (Apollo Server) — ports 4000 (vulnerable) / 4001 (secured)
├── shared/             # Code shared by both APIs
│   ├── models/         # Mongoose models (User, Order, ProductOrder)
│   ├── data/           # MongoDB connection & seeding
│   ├── middleware/      # Auth middleware (REST + GraphQL variants)
│   ├── utils/          # JWT helpers
│   └── certs/          # Self-signed SSL certificates
├── firewall/           # 42Crunch API Firewall Docker deployment
│   └── openapi/        # Firewall-specific OpenAPI specs (protection levels)
├── postman/            # Postman collections (REST + GraphQL)
└── scripts/            # Utility scripts (manage.sh, reset DB, conformance scan)
```

---

## �📘 Introduction

The **Telco Vulnerable API** simulates a telecommunications service provider's backend. It allows users to register, log in, and manage product orders, mimicking real-world telco operations. The API is designed to demonstrate common API security issues, especially those listed in the OWASP API Security Top 10, including BOLA, BFLA, mass assignment, excessive data exposure, SSRF, and more.

Both REST and GraphQL implementations demonstrate the same vulnerabilities but adapted to each API paradigm.

**📖 Quick Links:**
- **[graphql-api/README.md](graphql-api/README.md)** - Detailed GraphQL documentation
- **[graphql-api/queries.md](graphql-api/queries.md)** - GraphQL sample queries for testing

If you have feature requests or issues, please [create an issue](https://github.com/your-org/telco-vulnerable-api/issues/new).

---

## 🚀 Overview of the API Endpoints

- **Register**: Create a new customer account.
- **Login**: Authenticate and retrieve an access token.
- **Product Orders**: Create, view, update, and cancel product orders.
- **Webhooks**: Simulate webhook event handling. (to be added)
- **Debug**: Access debug endpoints for testing and internal tooling. (to be added)

### REST vs GraphQL Comparison

| Feature | REST API | GraphQL API (Vulnerable) | GraphQL API (Secured) |
|---------|----------|--------------------------|----------------------|
| **Location** | `rest-api/` | `graphql-api/` | `graphql-api/` |
| **Port** | 3000 | 4000 | 4001 |
| **Endpoint** | Multiple (`/auth`, `/productOrder`, etc.) | Single (`/graphql`) | Single (`/graphql`) |
| **Documentation** | OpenAPI/Swagger | GraphQL Schema | GraphQL Schema + Directives |
| **Security Score** | Varies by spec | 13.02/100 | 93.56/100 |
| **Vulnerabilities** | BOLA, BFLA, Mass Assignment, SSRF | Same + Introspection, Batch Queries | Significantly Reduced |
| **Security Layer** | 42Crunch API Firewall (external) | None | Schema Directives + Custom Scalars |
| **Use Case** | REST API best practices demo | GraphQL vulnerability demo | GraphQL security best practices |

---

## 🛠️ Get Started

All services run via Docker Compose. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running.

### Start Everything (recommended)

```bash
./scripts/manage.sh all start
```

| Service | URL |
|---------|-----|
| REST API | https://localhost:3000 |
| GraphQL (vulnerable) | https://localhost:4000/graphql |
| GraphQL (secured) | https://localhost:4001/graphql |

### Start individual targets

```bash
./scripts/manage.sh rest start     # REST API + MongoDB only
./scripts/manage.sh graphql start  # GraphQL APIs + MongoDB only
```

### Management commands

```bash
./scripts/manage.sh <target> stop        # stop containers
./scripts/manage.sh <target> reset       # stop → remove → recreate containers
./scripts/manage.sh all data-reset       # restart MongoDB container
./scripts/manage.sh rest fw-reset        # restart 42Crunch API Firewall
./scripts/manage.sh rest ngrok           # expose REST API via ngrok (port 3000)
./scripts/manage.sh graphql ngrok        # expose GraphQL API via ngrok (port 4000)
```

Targets: `rest` | `graphql` | `all`

### Reset database

```bash
./scripts/reset_database.sh
```

Drops all collections and reseeds 3 default users.

### (Optional) Deploy 42Crunch API Firewall

Update `PROTECTION_TOKEN` in `firewall/.env`, then:

```bash
./scripts/manage.sh rest fw-reset
```

---

## 📦 Project Resources

### OpenAPI Definitions

- **Vulnerable Version**: For demonstrating Audit & SQG (Security Quality Gates) failures.
- **Secure Version**: For use with Conformance Scan and best-practice checks.
- **Protection Version**: For demonstrating different protection levels based on the quality of the OpenAPI Specification.

---

### Seeded User Accounts

- Three test users are included in the MongoDB instance for immediate login and testing.

regular test user
```bash
username = username
password = password
```
regular test user 2
```bash
username = username2
password = password
```
admin test user
```bash
username = admin
password = password
```

---

### Postman Assets

- A collection is available for testing API endpoints.

---

### Scripts

Scripts are under the **/scripts/** folder:

- **`manage.sh`** — start, stop, reset, ngrok, and firewall management (REST only). Run `./scripts/manage.sh` for usage.
- **`reset_database.sh`** — drops all collections and reseeds the 3 default users. Useful after conformance scans.
- **`conformance_scanv2.py`** — uploads scan configs and fetches tokens for 42Crunch conformance scanning (used by CI/CD).

---

## REST API Firewall Protection Demonstration

| OAS Audit Score | 1 (No Security + No Schemas) | 31 (Security + No Schemas) | 32 (Security + additional properties + No schemas) | 100 (Security + additional properties + schemas) |
| --- | --- | --- | --- | --- |
| API2- Broken Auth | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API3 - BOPLA (Mass Assignment) | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API3 - BOPLA (Excessive Data Exposure) | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API4:2019 - Injection | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API8 - Security Misconfiguration  <br>(PathTraversal/ Undocumented Endpoints) | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API8 - Security Misconfiguration (Invalid body Type) | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API9 - Improper Inventory Management (Undocumented Methods) | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |

---

## 🔐 Vulnerabilities Demonstration

| Vulnerability Description | OWASP Category | Operation | Endpoint | Source Code |
|---------------------------|----------------|-----------|----------|-------------|
| A user can access or modify another user's product order | API-1 (BOLA) | PATCH/DELETE | /productOrder/{orderId} | productOrderController.js |
| Mass assignment allows hidden fields to be set | API-3 (Mass Assignment) | PATCH | /productOrder/{orderId} | productOrderController.js |
| Excessive data exposure in order responses | API-3 (Excessive Data Exposure) | GET | /productOrder/{orderId} | productOrderController.js |
| No rate limiting on order creation | API-4 (Unrestricted Resource Consumption) | POST | /productOrder | productOrderController.js |
| No function-level authorization on admin-only endpoints | API-5 (BFLA) | DELETE | /auth/user/{username} | authController.js |
| SSRF via webhook endpoint | API-7 (SSRF) | POST | /webhook | webhookController.js |
| Security misconfiguration: unsupported HTTP verbs not blocked | API-8 (Security Misconfiguration) | Various | /auth/login | authRoutes.js |
| Path traversal in debug endpoints | API-9 (Improper Assets Management) | GET | /debug/files | debugController.js |

&nbsp;