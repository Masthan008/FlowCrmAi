const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join('C:/valli/FlowCRM AI Enterprise/backend', '.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
  try {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
    console.log('TABLE_COUNT=' + tables.length);
    const names = tables.map(t => t.tablename);
    console.log(names.join(', '));
    const perms = await prisma.permission.count().catch(() => -1);
    const users = await prisma.user.count().catch(() => -1);
    const tasks = await prisma.task.count().catch(() => -1);
    console.log('USERS=' + users + ' PERMISSIONS=' + perms + ' TASKS=' + tasks);
  } catch (e) {
    console.error('ERR:', e.message);
  } finally {
    await pool.end();
  }
})();
