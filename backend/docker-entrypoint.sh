#!/bin/sh
set -e

echo "🔄 Running Prisma db push..."
npx prisma db push

echo "🌱 Seeding Database..."
npx prisma db seed

exec "$@"
