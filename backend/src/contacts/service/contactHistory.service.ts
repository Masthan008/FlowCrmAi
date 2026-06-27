import { contactHistoryRepository } from '../repository/contactHistory.repository';

export const contactHistoryService = {
  getHistory: async (contactId: string, search?: string) => {
    return contactHistoryRepository.findByContactId(contactId, search);
  },
};

export default contactHistoryService;
