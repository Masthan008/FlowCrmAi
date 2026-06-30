#!/bin/sh
set -e

echo "🔄 Running Prisma db push..."
npx prisma db push --accept-data-loss

echo "🌱 Seeding Database..."
npx prisma db seed

exec "$@"
