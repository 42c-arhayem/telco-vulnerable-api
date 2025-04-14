import pymongo
from pymongo import MongoClient
import sys

# MongoDB connection URI
MONGO_URI = "mongodb://localhost:27017/telco-api"

# Default users
DEFAULT_USERS = [
    {
        "username": "admin",
        "password": "password",
        "email": "admin@company.com",
        "isAdmin": True,
    },
    {
        "username": "user",
        "password": "password",
        "email": "user@company.com",
        "isAdmin": False,
    },
]

def reset_database():
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client.get_database()

        # Drop existing collections
        print("Dropping existing collections...")
        db.users.drop()
        db.orders.drop()

        # Recreate default users
        print("Creating default users...")
        db.users.insert_many(DEFAULT_USERS)

        print("Database reset successfully!")
    except Exception as e:
        print(f"Error resetting database: {e}")
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    reset_database()