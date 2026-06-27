import { prisma } from '../../database/db';

export const companyRelatedDataRepository = {
  async getContacts(companyId: string) {
    return prisma.contact.findMany({
      where: { companyId, deletedAt: null },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getLeads(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    return prisma.lead.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        source: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getLeadsSummary(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    const allLeads = await prisma.lead.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
    });
    return {
      total: allLeads.length,
      open: allLeads.filter(l => l.statusId === null).length,
      qualified: allLeads.filter(l => true).length,
      converted: allLeads.filter(l => false).length,
      lost: allLeads.filter(l => false).length,
      totalValue: allLeads.reduce((sum, l) => sum + l.value, 0),
    };
  },

  async getDeals(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    return prisma.deal.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        stage: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getDealsSummary(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    const allDeals = await prisma.deal.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
    });
    return {
      total: allDeals.length,
      totalValue: allDeals.reduce((sum, d) => sum + d.value, 0),
      openCount: allDeals.filter(d => true).length,
      wonCount: allDeals.filter(d => false).length,
      lostCount: allDeals.filter(d => false).length,
    };
  },

  async getQuotes(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    return prisma.quote.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getInvoices(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    return prisma.invoice.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getPayments(companyId: string) {
    const customers = await prisma.customer.findMany({
      where: { companyId, deletedAt: null },
      select: { id: true },
    });
    const customerIds = customers.map(c => c.id);
    const invoices = await prisma.invoice.findMany({
      where: { customerId: { in: customerIds }, deletedAt: null },
      select: { id: true },
    });
    const invoiceIds = invoices.map(i => i.id);
    return prisma.payment.findMany({
      where: { invoiceId: { in: invoiceIds }, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getPaymentsSummary(companyId: string) {
    const payments = await this.getPayments(companyId);
    return {
      totalPaid: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
      totalPending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalOverdue: payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0),
      totalRefunded: payments.filter(p => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0),
      count: payments.length,
    };
  },

  async getRevenueDashboard(companyId: string) {
    const deals = await this.getDeals(companyId);
    const payments = await this.getPayments(companyId);
    const invoices = await this.getInvoices(companyId);

    const totalSales = deals.reduce((sum, d) => sum + d.value, 0);
    const avgDealValue = deals.length > 0 ? totalSales / deals.length : 0;
    const paidAmount = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const outstandingAmount = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
    const pipelineValue = deals.filter(d => true).reduce((sum, d) => sum + d.value, 0);

    return {
      totalSales,
      averageDealValue: avgDealValue,
      outstandingAmount,
      paidAmount,
      pipelineValue,
      dealCount: deals.length,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
    };
  },
};
