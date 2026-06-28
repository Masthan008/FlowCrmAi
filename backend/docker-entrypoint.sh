#!/sh
set -e

echo "🔄 Running Prisma db push..."
npx prisma db push

exec "$@"
