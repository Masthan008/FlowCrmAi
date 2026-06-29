import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { prisma, pool } from '../src/database/db';

dotenv.config();

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

    // Leads (extended)
    { name: 'leads:view', module: 'leads', action: 'view', description: 'View sales leads' },
    { name: 'leads:create', module: 'leads', action: 'create', description: 'Create new leads' },
    { name: 'leads:edit', module: 'leads', action: 'edit', description: 'Edit leads' },
    { name: 'leads:delete', module: 'leads', action: 'delete', description: 'Delete leads' },
    { name: 'leads:export', module: 'leads', action: 'export', description: 'Export leads data' },
    { name: 'leads:assign', module: 'leads', action: 'assign', description: 'Assign leads to team members' },
    { name: 'leads:import', module: 'leads', action: 'import', description: 'Import leads from CSV/Excel' },
    { name: 'leads:merge', module: 'leads', action: 'merge', description: 'Merge duplicate leads' },
    { name: 'leads:archive', module: 'leads', action: 'archive', description: 'Archive sales leads' },
    { name: 'leads:restore', module: 'leads', action: 'restore', description: 'Restore archived leads' },
    { name: 'leads:bulk-edit', module: 'leads', action: 'bulk-edit', description: 'Bulk edit multiple leads' },
    { name: 'leads:bulk-delete', module: 'leads', action: 'bulk-delete', description: 'Bulk delete multiple leads' },
    { name: 'leads:manage-views', module: 'leads', action: 'manage-views', description: 'Manage saved list views' },
    { name: 'leads:reassign', module: 'leads', action: 'reassign', description: 'Reassign lead owner' },
    { name: 'leads:convert', module: 'leads', action: 'convert', description: 'Convert lead to customer/deal' },
    { name: 'leads:approve', module: 'leads', action: 'approve', description: 'Approve lead transfers/conversions' },
    { name: 'leads:workflow-manage', module: 'leads', action: 'workflow-manage', description: 'Manage lead workflows' },
    { name: 'leads:score-view', module: 'leads', action: 'score-view', description: 'View lead scores' },
    { name: 'leads:insights-view', module: 'leads', action: 'insights-view', description: 'View lead insights' },
    { name: 'leads:notes:create', module: 'leads', action: 'notes:create', description: 'Create lead notes' },
    { name: 'leads:notes:edit', module: 'leads', action: 'notes:edit', description: 'Edit lead notes' },
    { name: 'leads:notes:delete', module: 'leads', action: 'notes:delete', description: 'Delete lead notes' },
    { name: 'leads:files:upload', module: 'leads', action: 'files:upload', description: 'Upload lead files' },
    { name: 'leads:files:delete', module: 'leads', action: 'files:delete', description: 'Delete lead files' },
    { name: 'leads:activities:create', module: 'leads', action: 'activities:create', description: 'Create lead activities' },
    { name: 'leads:activities:edit', module: 'leads', action: 'activities:edit', description: 'Edit lead activities' },
    { name: 'leads:activities:delete', module: 'leads', action: 'activities:delete', description: 'Delete lead activities' },

    // Contacts
    { name: 'contacts:view', module: 'contacts', action: 'view', description: 'View customer contacts' },
    { name: 'contacts:create', module: 'contacts', action: 'create', description: 'Create new contacts' },
    { name: 'contacts:edit', module: 'contacts', action: 'edit', description: 'Edit contacts' },
    { name: 'contacts:delete', module: 'contacts', action: 'delete', description: 'Delete contacts' },
    { name: 'contacts:assign', module: 'contacts', action: 'assign', description: 'Assign contacts to owners' },
    { name: 'contacts:export', module: 'contacts', action: 'export', description: 'Export contacts list' },
    { name: 'contacts:notes:create', module: 'contacts', action: 'notes:create', description: 'Create contact notes' },
    { name: 'contacts:notes:edit', module: 'contacts', action: 'notes:edit', description: 'Edit contact notes' },
    { name: 'contacts:notes:delete', module: 'contacts', action: 'notes:delete', description: 'Delete contact notes' },
    { name: 'contacts:files:upload', module: 'contacts', action: 'files:upload', description: 'Upload contact files' },
    { name: 'contacts:files:delete', module: 'contacts', action: 'files:delete', description: 'Delete contact files' },
    { name: 'contacts:activities:create', module: 'contacts', action: 'activities:create', description: 'Create contact activities' },
    { name: 'contacts:activities:edit', module: 'contacts', action: 'activities:edit', description: 'Edit contact activities' },
    { name: 'contacts:activities:delete', module: 'contacts', action: 'activities:delete', description: 'Delete contact activities' },
    { name: 'relationship:view', module: 'contacts', action: 'relationship:view', description: 'View relationship mapping graph' },
    { name: 'business_metrics:view', module: 'contacts', action: 'business_metrics:view', description: 'View relationship business metrics values' },
    { name: 'communication:view', module: 'contacts', action: 'communication:view', description: 'View unified communication logs' },
    { name: 'health:view', module: 'contacts', action: 'health:view', description: 'View relationship customer health metric' },
    { name: 'journey:view', module: 'contacts', action: 'journey:view', description: 'View relationship customer lifecycle journey map' },
    { name: 'contacts:workflow:manage', module: 'contacts', action: 'workflow:manage', description: 'Manage automation workflows' },
    { name: 'contacts:segment:manage', module: 'contacts', action: 'segment:manage', description: 'Manage dynamic contact segments' },
    { name: 'contacts:score:view', module: 'contacts', action: 'score:view', description: 'View rule-based contact scores' },
    { name: 'contacts:risk:view', module: 'contacts', action: 'risk:view', description: 'View customer risk analysis' },
    { name: 'contacts:lifecycle:manage', module: 'contacts', action: 'lifecycle:manage', description: 'Manage customer lifecycle transitions' },
    { name: 'contacts:preferences:edit', module: 'contacts', action: 'preferences:edit', description: 'Edit communication preferences' },

    // Companies
    { name: 'companies:view', module: 'companies', action: 'view', description: 'View client companies' },
    { name: 'companies:create', module: 'companies', action: 'create', description: 'Create new companies' },
    { name: 'companies:edit', module: 'companies', action: 'edit', description: 'Edit companies' },
    { name: 'companies:delete', module: 'companies', action: 'delete', description: 'Delete companies' },
    { name: 'company:workflow:manage', module: 'companies', action: 'workflow:manage', description: 'Manage company workflows and automation' },
    { name: 'company:analytics:view', module: 'companies', action: 'analytics:view', description: 'View company analytics and insights' },
    { name: 'company:health:view', module: 'companies', action: 'health:view', description: 'View company health status' },
    { name: 'company:risk:view', module: 'companies', action: 'risk:view', description: 'View company risk assessment' },
    { name: 'company:segment:manage', module: 'companies', action: 'segment:manage', description: 'Manage company segments' },
    { name: 'company:lifecycle:manage', module: 'companies', action: 'lifecycle:manage', description: 'Manage company lifecycle stages' },
    { name: 'company:tag:manage', module: 'companies', action: 'tag:manage', description: 'Manage company tags' },
    { name: 'company:followup:manage', module: 'companies', action: 'followup:manage', description: 'Manage company follow-ups' },
    { name: 'company:recommendation:view', module: 'companies', action: 'recommendation:view', description: 'View company recommendations' },
    { name: 'company:score:view', module: 'companies', action: 'score:view', description: 'View company scores' },

    // Deals
    { name: 'deals:view', module: 'deals', action: 'view', description: 'View opportunities and deals' },
    { name: 'deals:create', module: 'deals', action: 'create', description: 'Create new deals' },
    { name: 'deals:edit', module: 'deals', action: 'edit', description: 'Edit deals' },
    { name: 'deals:delete', module: 'deals', action: 'delete', description: 'Delete deals' },

    // Reports & Analytics
    { name: 'reports:view', module: 'reports', action: 'view', description: 'View reports' },
    { name: 'reports:export', module: 'reports', action: 'export', description: 'Export report data' },

    // Tasks Management
    { name: 'tasks:view', module: 'tasks', action: 'view', description: 'View tasks' },
    { name: 'tasks:create', module: 'tasks', action: 'create', description: 'Create new tasks' },
    { name: 'tasks:edit', module: 'tasks', action: 'edit', description: 'Edit tasks' },
    { name: 'tasks:delete', module: 'tasks', action: 'delete', description: 'Delete tasks' },
    { name: 'tasks:assign', module: 'tasks', action: 'assign', description: 'Assign tasks to team members' },
    { name: 'tasks:complete', module: 'tasks', action: 'complete', description: 'Mark tasks as completed' },
    { name: 'tasks:export', module: 'tasks', action: 'export', description: 'Export task lists' },
  ];

  const dbPermissions: any[] = [];
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
    'Team Lead',
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
  // Helper to assign permissions to a role by name match
  const assignPermissions = async (roleName: string, filterFn: (p: any) => boolean) => {
    const role = dbRoles[roleName];
    if (!role) return;
    const perms = dbPermissions.filter(filterFn);
    for (const perm of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  };

  // Super Admin & Admin: ALL permissions
  await assignPermissions('Super Admin', () => true);
  await assignPermissions('Admin', () => true);

  // Sales Manager: full leads, contacts, companies, deals, tasks; view reports
  await assignPermissions('Sales Manager', (p) =>
    p.module === 'dashboard' ||
    (p.module === 'leads' && !p.action.startsWith('workflow') && !p.action.startsWith('score') && !p.action.startsWith('insights')) ||
    (p.module === 'contacts' && !p.action.startsWith('workflow') && !p.action.startsWith('segment') && !p.action.startsWith('score') && !p.action.startsWith('risk') && !p.action.startsWith('preferences')) ||
    (p.module === 'companies' && p.name !== 'company:analytics:view') ||
    p.module === 'deals' ||
    (p.module === 'tasks') ||
    (p.module === 'reports') ||
    p.name === 'relationship:view' || p.name === 'communication:view' || p.name === 'health:view' || p.name === 'journey:view'
  );

  // Sales Executive: leads create/edit/view, contacts create/edit/view, companies view, tasks
  await assignPermissions('Sales Executive', (p) =>
    p.module === 'dashboard' ||
    (p.module === 'leads' && (p.action === 'view' || p.action === 'create' || p.action === 'edit' || p.action === 'assign' || p.action === 'convert' || p.action === 'notes:create' || p.action === 'notes:edit' || p.action === 'activities:create' || p.action === 'activities:edit' || p.action === 'files:upload' || p.action === 'score-view')) ||
    (p.module === 'contacts' && (p.action === 'view' || p.action === 'create' || p.action === 'edit' || p.action === 'notes:create' || p.action === 'notes:edit' || p.action === 'activities:create' || p.action === 'activities:edit' || p.action === 'files:upload' || p.name === 'relationship:view' || p.name === 'communication:view' || p.name === 'journey:view')) ||
    (p.module === 'companies' && (p.action === 'view' || p.action === 'create' || p.action === 'edit')) ||
    (p.module === 'deals' && (p.action === 'view' || p.action === 'create' || p.action === 'edit')) ||
    (p.module === 'tasks' && (p.action === 'view' || p.action === 'create' || p.action === 'edit' || p.action === 'complete' || p.action === 'assign'))
  );

  // Marketing: leads view/create, contacts view, dashboard
  await assignPermissions('Marketing', (p) =>
    p.module === 'dashboard' ||
    (p.module === 'leads' && (p.action === 'view' || p.action === 'create' || p.action === 'edit' || p.action === 'export' || p.action === 'insights-view')) ||
    (p.module === 'contacts' && (p.action === 'view')) ||
    (p.module === 'tasks' && (p.action === 'view' || p.action === 'create')) ||
    p.module === 'reports'
  );

  // Support: contacts view/edit, companies view, tasks
  await assignPermissions('Support', (p) =>
    p.module === 'dashboard' ||
    (p.module === 'contacts' && (p.action === 'view' || p.action === 'create' || p.action === 'edit' || p.action === 'notes:create' || p.action === 'notes:edit')) ||
    (p.module === 'companies' && p.action === 'view') ||
    (p.module === 'tasks' && (p.action === 'view' || p.action === 'create' || p.action === 'edit' || p.action === 'complete'))
  );

  // Finance: dashboard, reports, deals/companies view
  await assignPermissions('Finance', (p) =>
    p.module === 'dashboard' ||
    (p.module === 'companies' && p.action === 'view') ||
    (p.module === 'deals' && p.action === 'view') ||
    p.module === 'reports'
  );

  // HR: users view, dashboard, settings
  await assignPermissions('HR', (p) =>
    p.module === 'dashboard' ||
    p.module === 'settings' ||
    (p.module === 'users' && p.action === 'view')
  );

  // Team Lead: lifecycle, tag, score, health, risk view, followup, recommendation
  await assignPermissions('Team Lead', (p) =>
    p.name === 'company:lifecycle:manage' ||
    p.name === 'company:tag:manage' ||
    p.name === 'company:score:view' ||
    p.name === 'company:health:view' ||
    p.name === 'company:risk:view' ||
    p.name === 'company:followup:manage' ||
    p.name === 'company:recommendation:view'
  );

  // Viewer: only view & access actions plus Phase 6 company view permissions
  await assignPermissions('Viewer', (p) =>
    p.action === 'view' ||
    p.action === 'access' ||
    p.name === 'company:health:view' ||
    p.name === 'company:risk:view' ||
    p.name === 'company:score:view' ||
    p.name === 'company:recommendation:view'
  );

  console.log('Linked permissions to all 9 roles.');

  // 5. Seed Lead Sources
  const leadSourcesData = [
    { name: 'Website', description: 'Leads from website forms and landing pages' },
    { name: 'Referral', description: 'Referred by existing customers or partners' },
    { name: 'Email Campaign', description: 'Generated from email marketing campaigns' },
    { name: 'Facebook', description: 'Leads from Facebook ads and pages' },
    { name: 'Instagram', description: 'Leads from Instagram marketing' },
    { name: 'LinkedIn', description: 'Leads from LinkedIn outreach and ads' },
    { name: 'Google Ads', description: 'Leads from Google Ads campaigns' },
    { name: 'Cold Calling', description: 'Generated through cold calling efforts' },
    { name: 'Trade Show', description: 'Leads collected at trade shows and events' },
    { name: 'Partner', description: 'Leads from partner organizations' },
    { name: 'Existing Customer', description: 'Cross-sell or upsell from existing customers' },
    { name: 'Manual', description: 'Manually entered leads' },
    { name: 'Custom', description: 'Custom or other sources' },
  ];

  for (const src of leadSourcesData) {
    await prisma.leadSource.upsert({
      where: { name: src.name },
      update: {},
      create: src,
    });
  }
  console.log(`Upserted ${leadSourcesData.length} lead sources.`);

  // 6. Seed Lead Statuses
  const leadStatusesData = [
    { name: 'New', description: 'Newly created lead', color: '#3B82F6', order: 1 },
    { name: 'Open', description: 'Lead is open for engagement', color: '#6366F1', order: 2 },
    { name: 'Contacted', description: 'Initial contact has been made', color: '#8B5CF6', order: 3 },
    { name: 'Qualified', description: 'Lead has been qualified', color: '#06B6D4', order: 4 },
    { name: 'Proposal Sent', description: 'Proposal has been sent', color: '#F59E0B', order: 5 },
    { name: 'Negotiation', description: 'In active negotiation', color: '#F97316', order: 6 },
    { name: 'Won', description: 'Deal has been won', color: '#10B981', order: 7 },
    { name: 'Lost', description: 'Deal has been lost', color: '#EF4444', order: 8 },
    { name: 'Inactive', description: 'Lead is currently inactive', color: '#6B7280', order: 9 },
    { name: 'Archived', description: 'Lead has been archived', color: '#9CA3AF', order: 10 },
  ];

  for (const st of leadStatusesData) {
    await prisma.leadStatus.upsert({
      where: { name: st.name },
      update: { color: st.color, order: st.order },
      create: st,
    });
  }
  console.log(`Upserted ${leadStatusesData.length} lead statuses.`);

  // 7. Seed default Super Admin user if not exists
  const superAdminRole = dbRoles['Super Admin'];
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
