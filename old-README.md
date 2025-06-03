Overview
The Telco Vulnerable API is an intentionally vulnerable API designed to demonstrate the OWASP Top 10 API Security Issues in the context of a telco company. This API provides functionalities for managing product orders and user authentication while showcasing common vulnerabilities that can lead to severe security risks.

API Functionalities
1. User Authentication
Endpoints:
POST /auth/register
Allows users to register with a username, password, and email.
Example Request:

Example Response:

POST /auth/login
Allows users to log in with their credentials and receive a JWT token.
Example Request:

Example Response:

2. Product Order Management
Endpoints:
GET /productOrder
Retrieves all product orders with optional filters (customerId, status).
Example Request:
GET /productOrder?customerId=a83a29f5-0d63-46f2-8f2e-44c2f1d2e07e&status=completed

GET /productOrder/:orderId
Retrieves details of a specific product order by orderId.

POST /productOrder
Creates a new product order.
Example Request:

PATCH /productOrder/:orderId
Updates an existing product order by orderId.

DELETE /productOrder/:orderId
Deletes a product order by orderId.

Vulnerabilities Demonstrated
1. Broken Object Level Authorization (BOLA)
Endpoints Affected:
GET /productOrder/:orderId, DELETE /productOrder/:orderId
Description:
No ownership checks are implemented, allowing any user to access or delete another user's orders by providing the orderId.
2. Broken User Authentication
Endpoints Affected:
POST /auth/login
Description:
Weak password validation and no rate limiting allow brute force attacks. Passwords are stored in plaintext.
3. Excessive Data Exposure
Endpoints Affected:
POST /auth/login
Description:
The API exposes sensitive user data, including password and isAdmin fields, in the login response.
4. Broken Function Level Authorization (BFLA)
Endpoints Affected:
POST /productOrder
Description:
Any user can create orders for other customers by specifying a different customerId in the request body.
5. Mass Assignment
Endpoints Affected:
POST /auth/register
Description:
Users can escalate privileges by setting isAdmin: true in the request body during registration.
6. Security Misconfiguration
Endpoints Affected:
GET /debug/env
Description:
The API exposes sensitive environment variables, including database credentials and API keys.
7. Injection
Endpoints Affected:
GET /productOrder
Description:
The API directly uses user input in database queries, allowing NoSQL injection attacks.
8. Improper Assets Management
Endpoints Affected:
/v1/productOrder, /v2/productOrder
Description:
Older API versions are not deprecated, exposing unpatched vulnerabilities.
9. Insufficient Logging & Monitoring
Endpoints Affected:
POST /auth/login, GET /productOrder/:orderId
Description:
The API does not log failed login attempts or unauthorized access attempts, making it difficult to detect attacks.
10. Server-Side Request Forgery (SSRF)
Endpoints Affected:
POST /webhook/test
Description:
The API allows users to fetch external URLs without validation, enabling attackers to make requests to internal services.

## 🔐 Vulnerabilities Demonstrated

| Vulnerability Description | OWASP Category | Operation | Endpoint | Source Code |
|---------------------------|----------------|-----------|----------|-------------|
| A user can access or modify another user's product order | API-1 (BOLA) | GET/PUT/DELETE | /productOrder/{orderId} | productOrderController.js |
| No function-level authorization on admin-only endpoints | API-5 (BFLA) | DELETE | /auth/user/{username} | authController.js |
| Mass assignment allows hidden fields to be set | API-3 (Mass Assignment) | PATCH | /productOrder/{orderId} | productOrderController.js |
| Excessive data exposure in order responses | API-3 (Excessive Data Exposure) | GET | /productOrder/{orderId} | productOrderController.js |
| No rate limiting on order creation | API-4 (Unrestricted Resource Consumption) | POST | /productOrder | productOrderController.js |
| SSRF via webhook endpoint | API-7 (SSRF) | POST | /webhook | webhookController.js |
| Security misconfiguration: unsupported HTTP verbs not blocked | API-8 (Security Misconfiguration) | Various | /auth/login | authRoutes.js |
| Path traversal in debug endpoints | API-9 (Improper Assets Management) | GET | /debug/files | debugController.js |

Disclaimer
This API is intentionally vulnerable and should not be used in production environments. It is designed for educational purposes to demonstrate common API security issues and their impact.