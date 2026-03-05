#!/bin/bash

# Reset MongoDB database via Docker Compose
# Drops all collections and reseeds the 3 default users

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# Database name
DB_NAME="telco-api"

# Generate unique customerIds for default users (lowercase UUIDs)
ADMIN_CUSTOMER_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
USER_CUSTOMER_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
USER2_CUSTOMER_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Default users with unique customerIds
DEFAULT_USERS="[
  {
    \"username\": \"admin\",
    \"password\": \"password\",
    \"email\": \"admin@company.com\",
    \"isAdmin\": true,
    \"customerId\": \"$ADMIN_CUSTOMER_ID\"
  },
  {
    \"username\": \"username\",
    \"password\": \"password\",
    \"email\": \"user@company.com\",
    \"isAdmin\": false,
    \"customerId\": \"$USER_CUSTOMER_ID\"
  },
  {
    \"username\": \"username2\",
    \"password\": \"password\",
    \"email\": \"user2@company.com\",
    \"isAdmin\": false,
    \"customerId\": \"$USER2_CUSTOMER_ID\"
  }
]"

echo "🔄 Resetting database: $DB_NAME"
docker compose exec -T mongo mongosh $DB_NAME --eval "db.users.drop(); db.orders.drop(); db.productorders.drop();" --quiet
docker compose exec -T mongo mongosh $DB_NAME --eval "db.users.insertMany($DEFAULT_USERS);" --quiet
docker compose exec -T mongo mongosh $DB_NAME --eval "db.users.createIndex({ customerId: 1 }, { unique: true });" --quiet

echo "✅ Database reset. Users: admin / username / username2 (password: password)"