# Telco Vulnerable REST API

Express/Node.js REST API implementation of the Telco Vulnerable API, demonstrating OWASP API Security Top 10 vulnerabilities for security education.

## 🚀 Quick Start

```bash
cd rest-api/
npm install
npm start
```

Server runs on **https://localhost:3000** (self-signed certificate — accept the browser warning).

Ensure MongoDB is running on `localhost:27017` before starting.

---

## 📋 Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Authenticate and get JWT token |
| `DELETE` | `/auth/user/:username` | Delete a user (BFLA — no role check) |
| `GET` | `/productOrder` | List orders (BOLA — no ownership check) |
| `POST` | `/productOrder` | Create an order |
| `PATCH` | `/productOrder/:orderId` | Update an order (mass assignment) |
| `DELETE` | `/productOrder/:orderId` | Delete an order |
| `POST` | `/webhook/test` | Test webhook (SSRF) |
| `GET` | `/debug/env` | Dump environment variables (info leak) |

---

## 🔐 Vulnerabilities

| Vulnerability | OWASP Category | Location |
|---|---|---|
| No ownership check on orders | API1 (BOLA) | `routes/new-productOrder.js` |
| `req.body` passed directly to `$set` | API3 (Mass Assignment) | `routes/new-productOrder.js` |
| Unvalidated URL in `fetch()` | API8 (SSRF) | `routes/webhook.js` |
| JWT decoded but signature NOT verified | API2 (Broken Auth) | `../shared/middleware/auth.js` |
| No role check on admin-only delete | API5 (BFLA) | `routes/auth.js` |
| `process.env` exposed via debug endpoint | API9 (Improper Assets) | `routes/debug.js` |

---

## 🔑 Test Credentials

```
username / password      (regular user)
username2 / password     (regular user 2)
admin / password         (admin)
```

---

## 🔧 Firewall Deployment

The 42Crunch API Firewall for this API is configured in `../firewall/`. See the root README for deployment instructions.

---

## 📖 OpenAPI Specs

Located in `openapi/`:
- `telco-openapi.json` — Vulnerable baseline (audit score ~1)
- `telco-openapi-remediated.json` — Partially secured
- `telco-openapi-protection.json` — For firewall demo

Firewall-specific OAS files are in `../firewall/openapi/`.
