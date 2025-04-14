#!/bin/bash

# MongoDB connection URI
MONGO_URI="mongodb://localhost:27017"

# Database name
DB_NAME="telco-api"

# Default users
DEFAULT_USERS='[
  {
    "username": "admin",
    "password": "password",
    "email": "admin@company.com",
    "isAdmin": true
  },
  {
    "username": "user",
    "password": "password",
    "email": "user@company.com",
    "isAdmin": false
  }
]'

echo "Resetting database: $DB_NAME"

# Drop existing collections
echo "Dropping existing collections..."
mongosh $MONGO_URI/$DB_NAME --eval "db.users.drop(); db.orders.drop();"

# Insert default users
echo "Creating default users..."
mongosh $MONGO_URI/$DB_NAME --eval "db.users.insertMany($DEFAULT_USERS);"

echo "Database reset successfully!"