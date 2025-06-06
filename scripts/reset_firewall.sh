#!/bin/bash

# Navigate to the firewall deployment directory
cd "$(dirname "$0")/../src/firewall-deployment" || exit 1

echo "Stopping and removing existing firewall containers..."
docker-compose -p 42crunch -f protect.yml down

echo "Starting firewall deployment..."
docker-compose -p 42crunch -f protect.yml up -d telco-secured.42crunch.test

echo "Firewall deployment has been reset."