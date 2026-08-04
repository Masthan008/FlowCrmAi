const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

dotenv.config();

let dbModule;
try {
  dbModule = require('../dist/database/db');
} catch (e) {
  try {
    require('ts-node/register');
    dbModule = require('../src/database/db');
  } catch (err) {
    console.error("❌ Failed to load database module from dist/ (JS) or src/ (TS):");
    console.error("Primary Error (Dist):", e.message || e);
    console.error("Fallback Error (TS):", err.message || err);
    process.exit(1);
  }
}
const { prisma, pool } = dbModule;

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
    { name: 'deals:assign', module: 'deals', action: 'assign', description: 'Assign deals to team members' },
    { name: 'deals:export', module: 'deals', action: 'export', description: 'Export deals data' },
    { name: 'pipeline:manage', module: 'pipeline', action: 'manage', description: 'Manage deal pipelines and stages' },

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

    // Meetings & Calendar
    { name: 'meetings:view', module: 'meetings', action: 'view', description: 'View calendar meetings and events' },
    { name: 'meetings:create', module: 'meetings', action: 'create', description: 'Create calendar meetings' },
    { name: 'meetings:edit', module: 'meetings', action: 'edit', description: 'Edit calendar meetings' },
    { name: 'meetings:delete', module: 'meetings', action: 'delete', description: 'Delete calendar meetings' },

    // Products Catalog
    { name: 'products:view', module: 'products', action: 'view', description: 'View product catalog' },
    { name: 'products:create', module: 'products', action: 'create', description: 'Create product catalog items' },
    { name: 'products:edit', module: 'products', action: 'edit', description: 'Edit product catalog items' },
    { name: 'products:delete', module: 'products', action: 'delete', description: 'Delete product catalog items' },

    // Quotes & Proposals
    { name: 'quotes:view', module: 'quotes', action: 'view', description: 'View sales quotes' },
    { name: 'quotes:create', module: 'quotes', action: 'create', description: 'Create sales quotes' },
    { name: 'quotes:edit', module: 'quotes', action: 'edit', description: 'Edit sales quotes' },
    { name: 'quotes:delete', module: 'quotes', action: 'delete', description: 'Delete sales quotes' },

    // Invoices & Billing
    { name: 'invoices:view', module: 'invoices', action: 'view', description: 'View customer invoices' },
    { name: 'invoices:create', module: 'invoices', action: 'create', description: 'Create customer invoices' },
    { name: 'invoices:edit', module: 'invoices', action: 'edit', description: 'Edit customer invoices' },
    { name: 'invoices:delete', module: 'invoices', action: 'delete', description: 'Delete customer invoices' },

    // Operations Suite
    { name: 'campaigns:view', module: 'campaigns', action: 'view', description: 'View marketing campaigns' },
    { name: 'campaigns:create', module: 'campaigns', action: 'create', description: 'Create marketing campaigns' },
    { name: 'campaigns:edit', module: 'campaigns', action: 'edit', description: 'Edit marketing campaigns' },
    { name: 'campaigns:delete', module: 'campaigns', action: 'delete', description: 'Delete marketing campaigns' },

    { name: 'tickets:view', module: 'tickets', action: 'view', description: 'View support tickets' },
    { name: 'tickets:create', module: 'tickets', action: 'create', description: 'Create support tickets' },
    { name: 'tickets:edit', module: 'tickets', action: 'edit', description: 'Edit support tickets' },
    { name: 'tickets:delete', module: 'tickets', action: 'delete', description: 'Delete support tickets' },

    { name: 'knowledge:view', module: 'knowledge', action: 'view', description: 'View knowledge base articles' },
    { name: 'knowledge:create', module: 'knowledge', action: 'create', description: 'Create knowledge base articles' },
    { name: 'knowledge:edit', module: 'knowledge', action: 'edit', description: 'Edit knowledge base articles' },
    { name: 'knowledge:delete', module: 'knowledge', action: 'delete', description: 'Delete knowledge base articles' },

    { name: 'contracts:view', module: 'contracts', action: 'view', description: 'View enterprise contracts' },
    { name: 'contracts:create', module: 'contracts', action: 'create', description: 'Create enterprise contracts' },
    { name: 'contracts:edit', module: 'contracts', action: 'edit', description: 'Edit enterprise contracts' },
    { name: 'contracts:delete', module: 'contracts', action: 'delete', description: 'Delete enterprise contracts' },

    { name: 'orders:view', module: 'orders', action: 'view', description: 'View sales orders' },
    { name: 'orders:create', module: 'orders', action: 'create', description: 'Create sales orders' },
    { name: 'orders:edit', module: 'orders', action: 'edit', description: 'Edit sales orders' },
    { name: 'orders:delete', module: 'orders', action: 'delete', description: 'Delete sales orders' },

    { name: 'projects:view', module: 'projects', action: 'view', description: 'View client projects' },
    { name: 'projects:create', module: 'projects', action: 'create', description: 'Create client projects' },
    { name: 'projects:edit', module: 'projects', action: 'edit', description: 'Edit client projects' },
    { name: 'projects:delete', module: 'projects', action: 'delete', description: 'Delete client projects' },

    { name: 'subscriptions:view', module: 'subscriptions', action: 'view', description: 'View customer subscriptions' },
    { name: 'subscriptions:create', module: 'subscriptions', action: 'create', description: 'Create customer subscriptions' },
    { name: 'subscriptions:edit', module: 'subscriptions', action: 'edit', description: 'Edit customer subscriptions' },
    { name: 'subscriptions:delete', module: 'subscriptions', action: 'delete', description: 'Delete customer subscriptions' },

    { name: 'expenses:view', module: 'expenses', action: 'view', description: 'View company expenses' },
    { name: 'expenses:create', module: 'expenses', action: 'create', description: 'Create company expenses' },
    { name: 'expenses:edit', module: 'expenses', action: 'edit', description: 'Edit company expenses' },
    { name: 'expenses:delete', module: 'expenses', action: 'delete', description: 'Delete company expenses' },

    { name: 'assets:view', module: 'assets', action: 'view', description: 'View IT assets' },
    { name: 'assets:create', module: 'assets', action: 'create', description: 'Create IT assets' },
    { name: 'assets:edit', module: 'assets', action: 'edit', description: 'Edit IT assets' },
    { name: 'assets:delete', module: 'assets', action: 'delete', description: 'Delete IT assets' },

    { name: 'webforms:view', module: 'webforms', action: 'view', description: 'View web forms' },
    { name: 'webforms:create', module: 'webforms', action: 'create', description: 'Create web forms' },
    { name: 'webforms:edit', module: 'webforms', action: 'edit', description: 'Edit web forms' },
    { name: 'webforms:delete', module: 'webforms', action: 'delete', description: 'Delete web forms' },

    { name: 'portal:view', module: 'portal', action: 'view', description: 'View customer portal' },
    { name: 'portal:manage', module: 'portal', action: 'manage', description: 'Manage customer portal' },

    { name: 'gdpr:view', module: 'gdpr', action: 'view', description: 'View GDPR compliance' },
    { name: 'gdpr:manage', module: 'gdpr', action: 'manage', description: 'Manage GDPR compliance' },
    { name: 'gdpr:create', module: 'gdpr', action: 'create', description: 'Create GDPR consent or requests' },

    { name: 'surveys:view', module: 'surveys', action: 'view', description: 'View NPS surveys' },
    { name: 'surveys:create', module: 'surveys', action: 'create', description: 'Create NPS surveys' },
    { name: 'surveys:edit', module: 'surveys', action: 'edit', description: 'Edit NPS surveys' },
    { name: 'surveys:delete', module: 'surveys', action: 'delete', description: 'Delete NPS surveys' },

    { name: 'commissions:view', module: 'commissions', action: 'view', description: 'View sales commissions' },
    { name: 'commissions:manage', module: 'commissions', action: 'manage', description: 'Manage sales commissions and rules' },
    { name: 'commissions:create', module: 'commissions', action: 'create', description: 'Create commission payouts' },

    // Live Chat & Email Communications
    { name: 'chat:view', module: 'chat', action: 'view', description: 'View live chat conversations' },
    { name: 'chat:respond', module: 'chat', action: 'respond', description: 'Respond to live chat conversations' },
    { name: 'chat:manage', module: 'chat', action: 'manage', description: 'Manage live chat settings' },
    { name: 'chat:create', module: 'chat', action: 'create', description: 'Create live chat conversations' },

    { name: 'email:view', module: 'email', action: 'view', description: 'View emails & accounts' },
    { name: 'email:manage', module: 'email', action: 'manage', description: 'Manage email accounts & sync' },
    { name: 'email:send', module: 'email', action: 'send', description: 'Send emails' },
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
    'Team Lead',
    'Marketing',
    'Support',
    'Finance',
    'HR',
    'Viewer',
  ];

  const dbRoles = {};
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
  const assignPermissions = async (roleName, filterFn) => {
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

  // Sales Manager
  await assignPermissions('Sales Manager', (p) =>
    p.module === 'dashboard' ||
    p.module === 'leads' ||
    p.module === 'contacts' ||
    p.module === 'companies' ||
    p.module === 'deals' ||
    p.module === 'tasks' ||
    p.module === 'reports' ||
    p.module === 'products' ||
    p.module === 'quotes' ||
    p.module === 'invoices' ||
    p.module === 'contracts' ||
    p.module === 'orders' ||
    p.module === 'projects' ||
    p.module === 'subscriptions' ||
    p.module === 'campaigns' ||
    p.module === 'tickets' ||
    p.module === 'knowledge' ||
    p.module === 'webforms' ||
    p.module === 'portal' ||
    p.module === 'chat' ||
    p.module === 'email' ||
    p.module === 'expenses' ||
    p.module === 'assets' ||
    p.module === 'gdpr' ||
    p.module === 'surveys' ||
    p.module === 'commissions' ||
    p.module === 'meetings'
  );

  // Sales Executive
  await assignPermissions('Sales Executive', (p) =>
    p.module === 'dashboard' ||
    p.module === 'leads' ||
    p.module === 'contacts' ||
    p.module === 'companies' ||
    p.module === 'deals' ||
    p.module === 'tasks' ||
    p.module === 'products' ||
    p.module === 'quotes' ||
    p.module === 'invoices' ||
    p.module === 'contracts' ||
    p.module === 'orders' ||
    p.module === 'projects' ||
    p.module === 'subscriptions' ||
    p.module === 'chat' ||
    p.module === 'email' ||
    p.module === 'meetings'
  );

  // Marketing
  await assignPermissions('Marketing', (p) =>
    p.module === 'dashboard' ||
    p.module === 'leads' ||
    p.module === 'contacts' ||
    p.module === 'deals' ||
    p.module === 'tasks' ||
    p.module === 'reports' ||
    p.module === 'campaigns' ||
    p.module === 'webforms' ||
    p.module === 'surveys' ||
    p.module === 'chat' ||
    p.module === 'email' ||
    p.module === 'portal'
  );

  // Support
  await assignPermissions('Support', (p) =>
    p.module === 'dashboard' ||
    p.module === 'contacts' ||
    p.module === 'companies' ||
    p.module === 'deals' ||
    p.module === 'tasks' ||
    p.module === 'tickets' ||
    p.module === 'knowledge' ||
    p.module === 'chat' ||
    p.module === 'portal' ||
    p.module === 'email'
  );

  // Finance
  await assignPermissions('Finance', (p) =>
    p.module === 'dashboard' ||
    p.module === 'companies' ||
    p.module === 'deals' ||
    p.module === 'reports' ||
    p.module === 'invoices' ||
    p.module === 'subscriptions' ||
    p.module === 'expenses' ||
    p.module === 'commissions' ||
    p.module === 'orders'
  );

  // HR
  await assignPermissions('HR', (p) =>
    p.module === 'dashboard' ||
    p.module === 'settings' ||
    p.module === 'users' ||
    p.module === 'assets'
  );

  // Team Lead
  await assignPermissions('Team Lead', (p) =>
    p.module === 'dashboard' ||
    p.module === 'leads' ||
    p.module === 'contacts' ||
    p.module === 'companies' ||
    p.module === 'deals' ||
    p.module === 'tasks' ||
    p.module === 'projects' ||
    p.module === 'orders' ||
    p.module === 'quotes'
  );

  // Viewer: only view & access actions plus company view permissions
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
  // 8. Seed default employees for owner assignment dropdown
  const existingEmployees = await prisma.employee.count({ where: { deletedAt: null } });
  if (existingEmployees === 0) {
    // Create a default internal company for employees if none exists
    let internalCompany = await prisma.company.findFirst({ where: { name: 'FlowCRM Internal', deletedAt: null } });
    if (!internalCompany) {
      const companyNumber = `CO-${Date.now()}`;
      internalCompany = await prisma.company.create({
        data: {
          name: 'FlowCRM Internal',
          companyNumber,
          companyType: 'Internal',
          status: 'Customer',
          priority: 'Medium',
        },
      });
      console.log(`Created internal company: ${internalCompany.name}`);
    }

    // Resolve admin user for linking
    const adminUser = await prisma.user.findUnique({ where: { email: defaultAdminEmail } });

    const employeeRecords = [
      { firstName: 'Alex', lastName: 'Mercer', email: 'alex.mercer@flowcrm.ai', phone: '+15550199', department: 'Management', designation: 'CEO', userId: adminUser?.id || null },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@flowcrm.ai', phone: '+15550200', department: 'Sales', designation: 'Sales Manager', userId: null },
      { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@flowcrm.ai', phone: '+15550201', department: 'Engineering', designation: 'CTO', userId: null },
    ];

    for (const emp of employeeRecords) {
      await prisma.employee.create({
        data: {
          companyId: internalCompany.id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          designation: emp.designation,
          userId: emp.userId,
        },
      });
    }
    console.log(`Seeded ${employeeRecords.length} default employees.`);
  } else {
    console.log(`Employees already exist (${existingEmployees}). Skipping employee seeding.`);
  }

  // 9. Seed default sales pipeline with stages
  const defaultPipeline = await prisma.pipeline.findFirst({
    where: { name: 'Default Sales Pipeline', deletedAt: null },
  });
  if (!defaultPipeline) {
    const createdPipeline = await prisma.pipeline.create({
      data: {
        name: 'Default Sales Pipeline',
        description: 'Standard sales pipeline with default stages',
        isDefault: true,
        stages: {
          create: [
            { name: 'Prospecting', order: 1, probability: 10, color: '#3B82F6' },
            { name: 'Qualification', order: 2, probability: 25, color: '#6366F1' },
            { name: 'Proposal', order: 3, probability: 50, color: '#8B5CF6' },
            { name: 'Negotiation', order: 4, probability: 75, color: '#F59E0B' },
            { name: 'Closed Won', order: 5, probability: 100, color: '#10B981' },
            { name: 'Closed Lost', order: 6, probability: 0, color: '#EF4444' },
          ],
        },
      },
    });
    console.log(`Created default sales pipeline: ${createdPipeline.name}`);
  } else {
    console.log('Default sales pipeline already exists. Skipping.');
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
