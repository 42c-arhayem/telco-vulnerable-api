#!/bin/bash

# MongoDB connection URI
MONGO_URI="mongodb://localhost:27017"

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

echo "Resetting database: $DB_NAME"

# Drop existing collections
echo "Dropping existing collections..."
mongosh $MONGO_URI/$DB_NAME --eval "db.users.drop(); db.orders.drop();"

# Insert default users
echo "Creating default users with unique customerIds..."
mongosh $MONGO_URI/$DB_NAME --eval "db.users.insertMany($DEFAULT_USERS);"

# Recreate the customerId index
echo "Recreating customerId index..."
mongosh $MONGO_URI/$DB_NAME --eval "db.users.createIndex({ customerId: 1 }, { unique: true });"

echo "Database reset successfully!"