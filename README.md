
# Telco Vulnerable API

A set of telecommunications API endpoints intentionally designed with security vulnerabilities for educational and testing purposes.

---

## 📘 Introduction

The **Telco Vulnerable API** simulates a telecommunications service provider's backend. It allows users to register, log in, and manage product orders, mimicking real-world telco operations. The API is designed to demonstrate common API security issues, especially those listed in the OWASP API Security Top 10, including BOLA, BFLA, mass assignment, excessive data exposure, SSRF, and more.

If you have feature requests or issues, please [create an issue](https://github.com/your-org/telco-vulnerable-api/issues/new).

---

## 🚀 Overview of the API Endpoints

- **Register**: Create a new customer account.
- **Login**: Authenticate and retrieve an access token.
- **Product Orders**: Create, view, update, and cancel product orders.
- **Webhooks**: Simulate webhook event handling. (to be developed)
- **Debug**: Access debug endpoints for testing and internal tooling. (to be developed)

---

## 🛠️ Get Started

### Basic Mode

1. Clone this repository to your local machine.
2. Ensure Docker Desktop (or compatible container software) is running.
3. Start the API Server(Run command in repo root directory):
   ```bash
   npm start
   ```
4. Update PROTECTION_TOKEN_PROTECTION env. variable under ../firewall-deployment/.env with your Protection Token generated in the SaaS platform.
4. Deploy the Firewall and its dependencies using Docker Compose:
   ```bash
   docker-compose -f ../firewall-deployment/protect.yml up
   ```

---

## 📦 Project Resources

### OpenAPI Definitions

- **Vulnerable Version**: For demonstrating Audit failures.
- **Secure Version**: For use with Conformance Scan and best-practice checks.

### Seeded User Accounts

- Two test users are included in the MongoDB instance for immediate login and testing.

### Postman Assets

- A collection and environment file are available for testing API endpoints.

---

## Protection Demonstration

| OAS Audit Score | 1 (No Security + No Schemas) | 31 (Security + No Schemas) | 32 (Security + additional properties + No schemas) | 100 (Security + additional properties + schemas) |
| --- | --- | --- | --- | --- |
| API2- Broken Auth | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API3 - BOPLA (Mass Assignment) | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API3 - BOPLA (Excessive Data Exposure) | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API4:2019 - Injection | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(224, 62, 45);">No</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API8 - Security Misconfiguration  <br>(PathTraversal/ Undocumented Endpoints) | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API8 - Security Misconfiguration (Invalid body Type) | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |
| API9 - Improper Inventory Management (Undocumented Methods) | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> | <span style="color: rgb(45, 194, 107);">Yes</span> |

&nbsp;