import { paymentRepository } from '../repository/payment.repository';
import { prisma } from '../../database/db';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val: any) => typeof val === 'string' && UUID_REGEX.test(val);

export const paymentService = {
  list: async (params: any) => {
    return paymentRepository.findMany(params);
  },

  getById: async (id: string) => {
    const payment = await paymentRepository.findById(id);
    if (!payment) {
      throw Object.assign(new Error('Payment record not found'), { statusCode: 404 });
    }
    return payment;
  },

  create: async (data: any, userId?: string) => {
    // Currency fallback
    let currencyId = isUuid(data.currencyId) ? data.currencyId : null;
    if (!currencyId) {
      let usd = await prisma.currency.findFirst({ where: { code: 'USD' } });
      if (!usd) {
        usd = await prisma.currency.create({
          data: { code: 'USD', name: 'US Dollar', symbol: '$' }
        });
      }
      currencyId = usd.id;
    }

    // Invoice fallback
    let invoiceId = isUuid(data.invoiceId) ? data.invoiceId : null;
    if (!invoiceId) {
      let firstInvoice = await prisma.invoice.findFirst();
      if (!firstInvoice) {
        let firstCust = await prisma.customer.findFirst();
        if (!firstCust) {
          firstCust = await prisma.customer.create({
            data: { name: 'Default Enterprise Client', type: 'client', status: 'active' }
          });
        }
        firstInvoice = await prisma.invoice.create({
          data: {
            number: `INV-${Date.now().toString().substring(5)}`,
            customerId: firstCust.id,
            total: Number(data.amount) || 100.00,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: 'unpaid',
          }
        });
      }
      invoiceId = firstInvoice.id;
    }

    const payload = {
      invoiceId,
      currencyId,
      amount: Number(data.amount) || 0,
      method: data.method || 'Credit Card',
      status: data.status || 'completed',
      transactionId: data.transactionId || `TXN-${Date.now()}`,
      createdBy: userId || null,
    };

    const payment = await paymentRepository.create(payload);

    // If payment is completed, auto-update invoice status to paid
    if (payload.status === 'completed' && invoiceId) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'paid' },
      }).catch(() => {});
    }

    return payment;
  },

  update: async (id: string, data: any, userId?: string) => {
    const existing = await paymentService.getById(id);
    const payload: any = { ...data, updatedBy: userId || null };
    if (payload.amount !== undefined) payload.amount = Number(payload.amount) || 0;
    if (payload.currencyId && !isUuid(payload.currencyId)) delete payload.currencyId;
    if (payload.invoiceId && !isUuid(payload.invoiceId)) delete payload.invoiceId;

    const updated = await paymentRepository.update(id, payload);

    if (payload.status === 'completed' && existing.invoiceId) {
      await prisma.invoice.update({
        where: { id: existing.invoiceId },
        data: { status: 'paid' },
      }).catch(() => {});
    }

    return updated;
  },

  delete: async (id: string, userId?: string) => {
    await paymentService.getById(id);
    return paymentRepository.delete(id, userId);
  },
};
