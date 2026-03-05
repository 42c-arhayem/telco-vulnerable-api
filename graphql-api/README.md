# Telco Vulnerable GraphQL API

GraphQL implementation of the Telco Vulnerable API, demonstrating security vulnerabilities and their remediation using 42Crunch Security Audit.

## 🎯 Two Implementations Available

| Version | Port | Security Score | Purpose | Schema |
|---------|------|----------------|---------|--------|
| **Vulnerable** | 4000 | 13.02/100 | Demonstrate OWASP API vulnerabilities | [schema.graphql](schema/schema.graphql) |
| **Secured** | 4001 | 93.56/100 | Show 42Crunch audit remediation | [schema-secured.graphql](schema/schema-secured.graphql) |

Both versions share the same database and business logic but differ in schema security implementation.

---

## 🚀 Quick Start

### Option 1: Run Vulnerable Version (Educational)

```bash
cd graphql-api/
npm install
npm start
```
- **Endpoint**: `https://localhost:4000/graphql`
- **Purpose**: Security training, vulnerability demonstrations
- **Features**: BOLA, mass assignment, JWT manipulation, SSRF, introspection enabled

### Option 2: Run Secured Version (Production-Ready)

```bash
cd graphql-api/
npm install
npm run start:secured
```
- **Endpoint**: `https://localhost:4001/graphql`
- **Purpose**: Production best practices, security baseline
- **Features**: Custom scalars, query complexity controls, input validation, list constraints

### Option 3: Run Both Simultaneously (Comparison)

```bash
# Terminal 1 - Vulnerable version
npm start

# Terminal 2 - Secured version
npm run start:secured
```

Access both endpoints to compare behavior side-by-side.

---

## 📊 Security Comparison

### Vulnerable Version (Port 4000)

**42Crunch Audit Results:**
- **Score**: 13.02/100 ⚠️
- **Issues**: 257 security problems
- **Schema**: Basic GraphQL types (String, ID, Int, Float)

**Key Vulnerabilities:**
- No input validation
- No query complexity limits
- No list size constraints
- Generic types everywhere
- Introspection enabled

### Secured Version (Port 4001)

**42Crunch Audit Results:**
- **Score**: 93.56/100 ✅
- **Issues**: 11 (95% reduction)
- **Schema**: Custom scalars + security directives

**Security Features:**
- ✅ Custom validated scalars (CustomString, CustomID, Quantity, Price)
- ✅ Query complexity controls (@cost directive)
- ✅ List size constraints (@list directive)
- ✅ Input validation with patterns
- ✅ Numeric range validation
- ✅ Field-level cost analysis

**See [SCHEMA_SECURITY.md](SCHEMA_SECURITY.md) for complete audit remediation details.**

---

## 📋 Prerequisites

- Node.js 14+ installed
- MongoDB running on `localhost:27017`
- (Optional) 42Crunch CLI for schema audits

---

## 🛠️ Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd telco-vulnerable-api/graphql
```

2. **Install dependencies**:
```bash
npm install
```

3. **Verify MongoDB is running**:
```bash
# Check if MongoDB is accessible
mongosh --eval "db.runCommand({ ping: 1 })"
```

4. **Seed the database** (optional - auto-seeded on first run):
```bash
./scripts/reset_database.sh
```

---

## 🎮 Testing the APIs

### Using GraphQL Playground

Both versions provide a GraphQL Playground interface:
- **Vulnerable**: https://localhost:4000/graphql
- **Secured**: https://localhost:4001/graphql

Accept the self-signed certificate warning in your browser.

### Example Queries

#### 1. Register a new user
```graphql
mutation {
  register(input: {
    username: "testuser"
    password: "password123"
    email: "test@example.com"
    isAdmin: false
  }) {
    message
    user {
      customerId
      username
      email
      isAdmin
    }
  }
}
```

#### 2. Login
```graphql
mutation {
  login(input: {
    username: "username"
    password: "password"
  }) {
    token
    message
    user {
      customerId
      username
      isAdmin
    }
  }
}
```

#### 3. Get current user (requires authentication)
```graphql
query {
  me {
    customerId
    username
    email
    isAdmin
  }
}
```

**Set authorization header**:
```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

#### 4. Query orders (demonstrates BOLA vulnerability in port 4000)
```graphql
query {
  orders(customerId: "ANY_CUSTOMER_ID") {
    orderId
    productId
    quantity
    status
  }
}
```

**More examples**: See [queries.md](queries.md)

---

## 🚨 Intentional Vulnerabilities (Port 4000)

### 1. **BOLA (Broken Object Level Authorization)**
- **Location**: `orders` and `productOrders` queries
- **Issue**: No validation that the requested `customerId` belongs to the authenticated user
- **Exploit**: Query any customer's orders by changing the `customerId` parameter

### 2. **Mass Assignment**
- **Location**: `updateOrder` and `updateProductOrder` mutations
- **Issue**: All fields from input are directly passed to database update
- **Exploit**: Modify protected fields like `status`, `orderDate`, `state`

### 3. **JWT Token Manipulation**
- **Location**: `middleware/auth.js`
- **Issue**: JWT is decoded but signature is NOT verified
- **Exploit**: Forge tokens with modified `customerId` or `isAdmin` claims

### 4. **BFLA (Broken Function Level Authorization)**
- **Location**: `deleteUser` mutation
- **Issue**: No check that only admins or the user themselves can delete accounts
- **Exploit**: Any authenticated user can delete any other user

### 5. **SSRF (Server-Side Request Forgery)**
- **Location**: `triggerWebhook` mutation
- **Issue**: URL parameter is not validated before making server-side request
- **Exploit**: Access internal services, cloud metadata endpoints, etc.

### 6. **Introspection Enabled**
- **Issue**: GraphQL introspection is enabled in production
- **Exploit**: Enumerate entire API schema to discover all types, queries, and mutations

### 7. **Mass Assignment in Registration**
- **Location**: `register` mutation
- **Issue**: Accepts `isAdmin` field directly from user input
- **Exploit**: Register as admin by setting `isAdmin: true`

### 8. **No Query Complexity Limits**
- **Issue**: No limits on query depth or complexity
- **Exploit**: Craft deeply nested queries to exhaust server resources

---

## ✅ Security Improvements (Port 4001)

### Custom Scalars

| Scalar | Validation | Use Case |
|--------|-----------|----------|
| `CustomString` | 0-10,000 chars, UTF-8 pattern | General text fields |
| `CustomID` | 1-128 chars, alphanumeric+hyphens | Unique identifiers |
| `CustomInt` | -2.1B to 2.1B | Integer fields |
| `CustomFloat` | Finite numbers only | Decimal values |
| `Quantity` | 1 to 999,999 | Order quantities |
| `Price` | 0 to 999,999,999.99 | Monetary amounts |

### Security Directives

```graphql
# String validation
directive @stringValue(
  maxLength: Int
  minLength: Int
  pattern: String
) on SCALAR

# Numeric validation
directive @numberValue(
  min: Float
  max: Float
) on SCALAR | FIELD_DEFINITION | INPUT_FIELD_DEFINITION

# List constraints
directive @list(
  maxItems: Int
  minItems: Int
) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION

# Query complexity
directive @cost(
  weight: Int
) on FIELD_DEFINITION
```

### Implementation Files

- **[schema/customScalars.js](schema/customScalars.js)** - Custom scalar implementations
- **[schema/directives.js](schema/directives.js)** - Directive transformers
- **[server-secured.js](server-secured.js)** - Secured Apollo Server configuration

---

## 🗄️ Database Models

This GraphQL API uses the same Mongoose models as the REST API:
- `User` model from `../src/models/User.js`
- `Order` model from `../src/models/Order.js`
- `ProductOrder` model from `../src/models/new-productOrder.js`

All seeded data from the REST API is accessible here.

---

## 👤 Default Test Users

```
Regular User 1: username / password
Regular User 2: username2 / password
Admin User: admin / password
```

All users have auto-generated `customerId` UUIDs. Check MongoDB after startup to get actual IDs.

---

## 🔧 Management Scripts

Located in `scripts/` directory:

```bash
./scripts/start.sh          # Start vulnerable version
./scripts/stop.sh           # Stop server
./scripts/reset_database.sh # Reset DB and reseed users
./scripts/health_check.sh   # Check all services
./scripts/dev.sh            # Start with auto-reload
./scripts/install.sh        # Install dependencies
./scripts/logs.sh           # View server logs
./scripts/ngrok.sh          # Expose to internet
```

**See [scripts/README.md](scripts/README.md) for details.**

---

## 📚 Documentation

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - Fastest way to get started
- **[queries.md](queries.md)** - Example queries and mutations

### Security & Comparison
- **[SCHEMA_SECURITY.md](SCHEMA_SECURITY.md)** - Complete audit remediation guide
- **[COMPARISON.md](COMPARISON.md)** - Detailed vulnerable vs secured comparison
- **[GRAPHQL_SECURITY_AUDIT_DEMO.md](GRAPHQL_SECURITY_AUDIT_DEMO.md)** - Sales demo script
- **[GRAPHQL_SECURITY_INCIDENTS.md](GRAPHQL_SECURITY_INCIDENTS.md)** - Real-world breach analysis

### Development & Maintenance
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Maintenance guide for contributors

---

## 🎯 Use Cases

### For Security Training
1. Start vulnerable version (port 4000)
2. Demonstrate OWASP API vulnerabilities
3. Show exploitation techniques
4. Compare with secured version (port 4001)

### For Development Teams
1. Run 42Crunch audit on your own schemas
2. Compare audit scores (13.02 vs 93.56)
3. Learn custom scalar implementation
4. Understand security directive patterns

### For Sales Demonstrations
1. Use [GRAPHQL_SECURITY_AUDIT_DEMO.md](GRAPHQL_SECURITY_AUDIT_DEMO.md) as guide
2. Show before/after comparison
3. Demonstrate real-world breach prevention
4. Calculate ROI based on prevented incidents

---

## 🔍 Running 42Crunch Security Audit

```bash
# Audit vulnerable schema
42crunch audit graphql/schema/schema.graphql --output audit-report.json

# Audit secured schema
42crunch audit graphql/schema/schema-secured.graphql --output audit-report-secured.json
```

---

## 🐛 Troubleshooting

### MongoDB Connection Failed?
```bash
# Check if MongoDB is running
pgrep mongod

# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community
```

### Port Already in Use?
```bash
# Check what's using port 4000 or 4001
lsof -ti:4000
lsof -ti:4001

# Or change ports in .env file
PORT=5000
SECURED_PORT=5001
```

### SSL Certificate Errors?
- Expected with self-signed certificates
- In browsers: click "Advanced" → "Proceed to localhost"
- In curl: use `-k` flag
- In GraphQL clients: disable SSL verification for localhost

### Schema Changes Not Reflected?
```bash
# Restart the server
npm start  # or npm run start:secured

# Clear node_modules if issues persist
rm -rf node_modules
npm install
```

---

## 🔄 GraphQL-Specific Security Considerations

1. **Query Depth/Complexity**: No limits on query depth or complexity (vulnerable version)
2. **Introspection**: Enabled in all environments (vulnerable version only)
3. **Error Messages**: Detailed error messages expose internal structure
4. **Batch Queries**: No rate limiting on batched operations
5. **Field-level Authorization**: Missing authorization checks on individual fields

---

## 🆚 Differences from REST API

- Single endpoint (`/graphql`) instead of multiple REST endpoints
- Authentication via context instead of route middleware
- Schema introspection reveals all available operations
- Batch queries can amplify vulnerabilities
- No HTTP verb-based security controls
- Custom directives for declarative security

---

## 🏗️ Architecture

- **Apollo Server 4** with Express integration
- HTTPS only (self-signed certificates from `certs/`)
- Shares database connection with REST API
- Authentication pattern matches REST but adapted for GraphQL context
- Resolvers maintain same vulnerable patterns as REST controllers
- Secured version adds schema transformation layer

---

## 📝 License

This project is for educational and testing purposes only. Not for production use.

---

## 🤝 Contributing

See [DEVELOPMENT.md](DEVELOPMENT.md) for contribution guidelines and maintenance procedures.

---

## 📧 Support

For issues or questions:
1. Check [troubleshooting](#-troubleshooting) section
2. Review [documentation](#-documentation)
3. Create an issue in the repository
