§§# Telco Vulnerable API - AI Agent Instructions

## Project Overview

This is an **intentionally vulnerable** telecommunications API designed for security education and testing. It demonstrates OWASP API Security Top 10 vulnerabilities including BOLA, BFLA, mass assignment, excessive data exposure, and SSRF. The codebase contains vulnerabilities by design - do NOT fix them unless explicitly requested.

**Two API Implementations:**
- **REST API** (OpenAPI) in `rest-api/` - Express with route-based endpoints
- **GraphQL API** in `graphql-api/` - Apollo Server with single GraphQL endpoint

Both share the same MongoDB database and demonstrate identical vulnerabilities adapted to each paradigm.

## Architecture

### REST API (rest-api/)
- **Stack**: Node.js/Express HTTPS + MongoDB + 42Crunch API Firewall (Docker)
- **Entry Point**: [rest-api/app.js](../rest-api/app.js) - HTTPS server on port 3000
- **Routes**: Auth (`/auth`), Product Orders (`/productOrder`), Webhooks (`/webhook`), Debug (`/debug`)
- **Auth Pattern**: JWT tokens manually decoded (no signature verification)

### GraphQL API (graphql-api/)
- **Stack**: Apollo Server 4 + Express + MongoDB (shared with REST)
- **Entry Point**: [graphql-api/server.js](../graphql-api/server.js) - HTTPS server on port 4000
- **Endpoint**: Single `/graphql` endpoint with introspection enabled
- **Auth Pattern**: Same vulnerable JWT decoding via GraphQL context

### Shared Components
- **Models**: Mongoose models in `shared/models/` (User, Order, ProductOrder)
- **Database**: [shared/data/db.js](../shared/data/db.js) seeds 3 test users (username/username2/admin, password: "password")
- **Certificates**: Self-signed SSL certs in `shared/certs/`
- **Auth Middleware**: `shared/middleware/auth.js` — exports `restAuthenticate` and `graphqlAuthenticate`
- **JWT Utils**: `shared/utils/jwt.js`
- **UUIDs**: All models use `customerId`/`orderId` instead of MongoDB `_id`

## Critical Workflows

### Starting the Applications
```bash
# Start REST API (from rest-api/ directory)
cd rest-api/
npm install
npm start  # Runs on https://localhost:3000

# Start GraphQL API (from graphql-api/ directory)
cd graphql-api/
npm install
npm start  # Runs on https://localhost:4000/graphql
# Or use: ./start.sh

# Deploy 42Crunch API Firewall for REST API (from repo root)
docker-compose -f firewall/protect.yml up
# Requires PROTECTION_TOKEN in firewall/.env
```

### Reset Operations
```bash
# Reset database (removes test data, reseeds users for both APIs)
./scripts/reset_database.sh

# Reset firewall deployment (REST API only)
./scripts/manage.sh rest fw-reset
```

### API Security Testing
```bash
# REST API - Conformance scan (Python script for 42Crunch)
./scripts/conformance_scanv2.py

# REST API - Postman collection
# Collection: postman/collection/telco.json

# GraphQL API - Sample queries
# See: graphql-api/queries.md for testing scenarios
# Use GraphQL Playground at https://localhost:4000/graphql
```

## Security Vulnerability Patterns (DO NOT FIX)

### BOLA (Broken Object Level Authorization)
- **Location**: [rest-api/routes/new-productOrder.js#L116](../rest-api/routes/new-productOrder.js#L116)
- **Pattern**: No ownership validation when filtering orders by customerId
- **Example**: Users can access other users' orders by manipulating customerId query param

### Mass Assignment
- **Location**: [rest-api/routes/new-productOrder.js#L199](../rest-api/routes/new-productOrder.js#L199)
- **Pattern**: Direct `req.body` passed to MongoDB update with `$set`
- **Impact**: Attackers can modify hidden fields like `status`, `orderDate`

### SSRF (Server-Side Request Forgery)
- **Location**: [rest-api/routes/webhook.js#L8](../rest-api/routes/webhook.js#L8)
- **Pattern**: Unvalidated URL passed to `fetch()` from request body

### JWT Token Manipulation
- **Location**: [shared/middleware/auth.js](../shared/middleware/auth.js)
- **Pattern**: JWT decoded but NOT verified - signature is ignored
- **Why**: Allows token forgery for privilege escalation demos

### BFLA (Broken Function Level Authorization)
- **Example**: Admin-only endpoints lack proper role checks
- **REST Location**: [rest-api/routes/auth.js#L69](../rest-api/routes/auth.js#L69) - user deletion endpoint
- **GraphQL Location**: `deleteUser` mutation in [graphql-api/resolvers/index.js](../graphql-api/resolvers/index.js)
- **Pattern**: No validation that only admin or user themselves can perform action

## GraphQL-Specific Vulnerabilities

### Introspection Enabled
- **Location**: [graphql-api/server.js](../graphql-api/server.js)
- **Issue**: Full schema introspection enabled in all environments
- **Exploit**: Enumerate all types, queries, mutations to discover attack surface

### No Query Complexity Limits
- **Issue**: No limits on query depth, breadth, or complexity
- **Exploit**: Craft deeply nested or batched queries to cause DoS

### Batch Query Amplification
- **Pattern**: Multiple queries/mutations in single request without rate limiting
- **Example**: Create 100 orders in one batched mutation request
- **Impact**: Amplifies BOLA, mass assignment, and other vulnerabilities

## OpenAPI Specification Strategy

Multiple OAS files demonstrate progressive security hardening:

- **telco-openapi.json**: Vulnerable baseline (audit score ~1)
- **telco-openapi-remediated.json**: Partially secured
- **telco-openapi-protection.json**: For firewall protection demo
- **Firewall variants** (`firewall/openapi/`): Show different protection levels
  - `telco-openapi-one.json`: Minimal security
  - `telco-openapi-low.json`: Basic security + schemas
  - `telco-openapi-low+additional-properties.json`: Adds mass assignment protection
  - `telco-openapi-fully-secured.json`: Full schema validation

When modifying OAS files, understand which protection level is being demonstrated.

## 42Crunch Integration Points

- **Audit Configuration**: [42c-conf.yaml](../42c-conf.yaml) - searches `rest-api/openapi/` for specs
- **CI/CD Example**: [gitlab-ci-example.yaml](../gitlab-ci-example.yaml) - audi, symlinked to `graphql/certs/`
5. **Shared database**: Both REST and GraphQL APIs use same MongoDB instance and collections
6. **Port conventions**: REST on 3000, GraphQL on 4000
7. **Route organization** (REST): Two product order implementations exist:
   - `src/routes/productOrder.js` - Legacy/simple
   - `src/routes/new-productOrder.js` - More complete with vulnerabilities documented
8. **GraphQL patterns**:
   - Single `/graphql` endpoint with introspection /resolvers, maintain the vulnerable-by-design principle
- **Update both implementations**: Add equivalent functionality to both REST and GraphQL versions
- **Document in README**: Update the vulnerabilities table in README.md
- **REST API considerations**:
  - Add to ALL relevant OpenAPI specs (vulnerable, remediated, protection variants)
  - Update Postman collection: `postman/collection/telco.json`
- **GraphQL API considerations**:
  - Update `graphql-api/schema/typeDefs.js` with new types/queries/mutations
  - Add resolvers to `graphql-api/resolvers/index.js`
  - Document sample queries in `graphql-api/queries.md`
- **Seeded data**: If adding models, update [shared/data/db.js](../shared/data/db.js) (shared by both APIs)
## Project-Specific Conventions

1. **UUIDs over MongoDB _ids**: All models use `customerId`/`orderId` (not `_id`) for external references
2. **Schema transforms**: Models exclude `_id` and `__v` in JSON responses (see `toJSON` transforms)
3. **No password hashing**: Plaintext passwords stored (vulnerable by design for demos)
4. **HTTPS-only**: Self-signed certificates in `shared/certs/` (cert.pem, key.pem)
5. **Route organization**: Two product order implementations exist:
   - `rest-api/routes/productOrder.js` - Legacy/simple
   - `rest-api/routes/new-productOrder.js` - More complete with vulnerabilities documented

## When Adding Features

- **Preserve vulnerabilities**: If adding endpoints, maintain the vulnerable-by-design principle
- **Document in README**: Update the vulnerabilities table at bottom of README.md
- **Consider OAS impact**: New endpoints should be added to ALL relevant OpenAPI specs
- **Test with Postman**: Update `postman/collection/telco.json` (REST) or `postman/collection/telco-graphql.json` (GraphQL) with new requests
- **Seeded data**: If adding models, consider seeding in [shared/data/db.js](../shared/data/db.js)

## Testing Credentials

```
Regular User 1: username / password
Regular User 2: username2 / password
Admin User: admin / password
```

All users have auto-generated `customerId` UUIDs. Check MongoDB after startup to get actual IDs.
