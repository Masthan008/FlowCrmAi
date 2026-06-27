import { contactTimelineRepository } from '../repository/contactTimeline.repository';

export const contactTimelineService = {
  getTimeline: async (contactId: string, search?: string) => {
    return contactTimelineRepository.findByContactId(contactId, search);
  },

  logEvent: async (params: {
    contactId: string;
    type: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    createdBy?: string;
  }) => {
    return contactTimelineRepository.create({
      contactId: params.contactId,
      type: params.type,
      title: params.title,
      description: params.description || null,
      icon: params.icon || null,
      color: params.color || null,
      createdBy: params.createdBy || 'system',
    });
  },
};

export default contactTimelineService;
