// Load .env file for local development if available
try {
  require("dotenv").config();
} catch (e) {
  // Ignore in production where environment variables are injected directly
}

module.exports = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
};
