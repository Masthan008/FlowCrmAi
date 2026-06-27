import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

// Create connection adapter for standalone seed execution
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowcrm_db?schema=public',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database Roles and Permissions...');

  // 1. Define permissions list
  const permissionsData = [
    // Dashboard & Admin
    { name: 'dashboard:access', module: 'dashboard', action: 'access', description: 'Access dashboard metrics' },
    { name: 'settings:access', module: 'settings', action: 'access', description: 'Access system settings' },
    { name: 'admin:access', module: 'admin', action: 'access', description: 'Access administrative modules' },
    
    // Users Management
    { name: 'users:view', module: 'users', action: 'view', description: 'View user list' },
    { name: 'users:create', module: 'users', action: 'create', description: 'Create new users' },
    { name: 'users:edit', module: 'users', action: 'edit', description: 'Edit existing users' },
    { name: 'users:delete', module: 'users', action: 'delete', description: 'Delete users' },

    // Leads
    { name: 'leads:view', module: 'leads', action: 'view', description: 'View sales leads' },
    { name: 'leads:create', module: 'leads', action: 'create', description: 'Create new leads' },
    { name: 'leads:edit', module: 'leads', action: 'edit', description: 'Edit leads' },
    { name: 'leads:delete', module: 'leads', action: 'delete', description: 'Delete leads' },

    // Contacts
    { name: 'contacts:view', module: 'contacts', action: 'view', description: 'View customer contacts' },
    { name: 'contacts:create', module: 'contacts', action: 'create', description: 'Create new contacts' },
    { name: 'contacts:edit', module: 'contacts', action: 'edit', description: 'Edit contacts' },
    { name: 'contacts:delete', module: 'contacts', action: 'delete', description: 'Delete contacts' },

    // Companies
    { name: 'companies:view', module: 'companies', action: 'view', description: 'View client companies' },
    { name: 'companies:create', module: 'companies', action: 'create', description: 'Create new companies' },
    { name: 'companies:edit', module: 'companies', action: 'edit', description: 'Edit companies' },
    { name: 'companies:delete', module: 'companies', action: 'delete', description: 'Delete companies' },

    // Deals
    { name: 'deals:view', module: 'deals', action: 'view', description: 'View opportunities and deals' },
    { name: 'deals:create', module: 'deals', action: 'create', description: 'Create new deals' },
    { name: 'deals:edit', module: 'deals', action: 'edit', description: 'Edit deals' },
    { name: 'deals:delete', module: 'deals', action: 'delete', description: 'Delete deals' },

    // Reports & Analytics
    { name: 'reports:view', module: 'reports', action: 'view', description: 'View reports' },
    { name: 'reports:export', module: 'reports', action: 'export', description: 'Export report data' },
  ];

  const dbPermissions = [];
  for (const perm of permissionsData) {
    const dbPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    dbPermissions.push(dbPerm);
  }
  console.log(`Upserted ${dbPermissions.length} permissions.`);

  // 2. Define roles list
  const roles = [
    'Super Admin',
    'Admin',
    'Sales Manager',
    'Sales Executive',
    'Marketing',
    'Support',
    'Finance',
    'HR',
    'Viewer',
  ];

  const dbRoles: Record<string, any> = {};
  for (const roleName of roles) {
    const dbRole = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: `${roleName} default system role`,
      },
    });
    dbRoles[roleName] = dbRole;
  }
  console.log(`Upserted ${roles.length} roles.`);

  // 3. Link permissions to roles (RolePermissions)
  // Super Admin gets all permissions
  const superAdminRole = dbRoles['Super Admin'];
  for (const perm of dbPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: perm.id,
      },
    });
  }

  // Viewer role gets only view permissions
  const viewerRole = dbRoles['Viewer'];
  const viewPermissions = dbPermissions.filter((p) => p.action === 'view' || p.action === 'access');
  for (const perm of viewPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log('Linked permissions to Super Admin & Viewer roles.');

  // 4. Seed default Super Admin user if not exists
  const defaultAdminEmail = 'admin@flowcrm.ai';
  const existingUser = await prisma.user.findUnique({
    where: { email: defaultAdminEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('Password@123', 12);
    const superAdminUser = await prisma.user.create({
      data: {
        email: defaultAdminEmail,
        password: hashedPassword,
        firstName: 'Alex',
        lastName: 'Mercer',
        fullName: 'Alex Mercer',
        phone: '+15550199',
        status: 'active',
        roleId: superAdminRole.id,
        emailVerified: true,
        phoneVerified: true,
        timezone: 'UTC',
        language: 'en',
        themePreference: 'white-glossy',
        preferences: {
          create: {
            theme: 'white-glossy',
            language: 'en',
            timezone: 'UTC',
            compactMode: false,
            notificationsEnabled: true,
          },
        },
      },
    });
    console.log(`Created default Super Admin user: ${superAdminUser.email}`);
  } else {
    console.log('Default Super Admin user already exists. Skipping user creation.');
  }

  console.log('Database Seeding Completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
