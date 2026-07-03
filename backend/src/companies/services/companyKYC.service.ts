import { companyKYCRepository } from '../repositories/companyKYC.repository';
import { prisma } from '../../database/db';

export const companyKYCService = {
  getKYCByCompanyId: async (companyId: string) => {
    return companyKYCRepository.findByCompanyId(companyId);
  },

  updateKYC: async (companyId: string, data: any, updatedBy?: string) => {
    const updatedRecord = await companyKYCRepository.upsertKYC(companyId, {
      ...data,
      updatedBy: updatedBy || 'Compliance Officer'
    });

    // Update Company cvrVerified or compliance flag if verified
    if (data.status === 'Verified') {
      await prisma.company.update({
        where: { id: companyId },
        data: { cvrVerified: true }
      });
    }

    return updatedRecord;
  }
};
