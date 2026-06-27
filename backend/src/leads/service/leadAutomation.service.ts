import { prisma } from '../../database/db';
import { leadRepository } from '../repository/lead.repository';

export const leadAutomationService = {
  /**
   * Assign lead owner with timeline log and assignment audit log
   */
  assignLead: async (params: {
    leadId: string;
    assignedToId: string;
    type?: string;
    reason?: string;
    userId: string;
  }) => {
    const { leadId, assignedToId, type = 'Manual', reason = 'Direct Transfer', userId } = params;

    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    const previousOwnerId = lead.assignedToId;

    // Update Lead owner
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        assignedToId,
        previousOwnerId,
        assignedDate: new Date(),
        assignmentReason: reason,
        updatedBy: userId,
      },
    });

    // Create Assignment Audit Row
    await prisma.leadAssignment.create({
      data: {
        leadId,
        assignedToId,
        assignmentType: type,
        reason,
        previousOwnerId,
        createdBy: userId,
      },
    });

    // Create Timeline entry
    await prisma.leadTimeline.create({
      data: {
        leadId,
        type: 'OWNER_CHANGED',
        title: 'Lead Owner Reassigned',
        description: `Lead reassigned from ${previousOwnerId || 'Unassigned'} to ${assignedToId}. Reason: ${reason}`,
        createdBy: userId,
      },
    });

    // Create notification for assignee
    await prisma.leadNotification.create({
      data: {
        userId: assignedToId,
        title: 'New Lead Assigned',
        message: `Lead ${lead.fullName} (${lead.leadNumber}) has been assigned to you.`,
        type: 'info',
        createdBy: userId,
      },
    });

    // Trigger workflow engine rules for "Lead Assigned"
    await leadAutomationService.executeWorkflows('Lead Assigned', updatedLead, userId);

    return updatedLead;
  },

  /**
   * Auto routing engines (Round Robin or Load-Based workload distribution)
   */
  autoAssignLead: async (leadId: string, ruleType: 'ROUND_ROBIN' | 'LOAD_BASED', userId: string) => {
    const employees = await prisma.employee.findMany({ where: { deletedAt: null } });
    if (employees.length === 0) throw new Error('No active employees to assign to.');

    let targetEmployeeId = employees[0].id;

    if (ruleType === 'ROUND_ROBIN') {
      // Find the last assignment log to locate who was assigned last
      const lastAssignment = await prisma.leadAssignment.findFirst({
        where: { assignmentType: 'Round Robin' },
        orderBy: { createdAt: 'desc' },
      });

      if (lastAssignment) {
        const lastIdx = employees.findIndex((e) => e.id === lastAssignment.assignedToId);
        const nextIdx = (lastIdx + 1) % employees.length;
        targetEmployeeId = employees[nextIdx].id;
      }
    } else if (ruleType === 'LOAD_BASED') {
      // Group leads counts to find who has the lowest active workload
      const workloads = await prisma.lead.groupBy({
        by: ['assignedToId'],
        _count: { id: true },
        where: { deletedAt: null, archivedAt: null },
      });

      const workloadMap = new Map(workloads.map((w) => [w.assignedToId, w._count.id]));
      let minLoad = Infinity;

      for (const emp of employees) {
        const load = workloadMap.get(emp.id) || 0;
        if (load < minLoad) {
          minLoad = load;
          targetEmployeeId = emp.id;
        }
      }
    }

    return leadAutomationService.assignLead({
      leadId,
      assignedToId: targetEmployeeId,
      type: ruleType === 'ROUND_ROBIN' ? 'Round Robin' : 'Load Based',
      reason: `Automated ${ruleType} Lead distribution rules.`,
      userId,
    });
  },

  /**
   * Transaction-safe Lead Conversion Wizard Mapper
   */
  convertLead: async (
    leadId: string,
    config: {
      skipCompany: boolean;
      mergeContact: boolean;
      contactId?: string;
      companyId?: string;
      dealName?: string;
      dealStageId?: string;
      notes?: string;
    },
    userId: string
  ) => {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { status: true },
    });
    if (!lead) throw new Error('Lead not found');

    let customerId = lead.customerId;
    let companyId = config.companyId || null;
    let contactId = config.contactId || null;
    let dealId: string | null = null;

    // Transaction safety guarantees full rollback on any validation failure
    await prisma.$transaction(async (tx) => {
      // Step 2: Resolve Company mapping
      if (!config.skipCompany && !companyId && lead.companyName) {
        const newCompany = await tx.company.create({
          data: {
            name: lead.companyName,
            industry: lead.industry || null,
            website: lead.website || null,
            phone: lead.phone || null,
            address: lead.address || null,
            city: lead.city || null,
            state: lead.state || null,
            country: lead.country || null,
            createdBy: userId,
          },
        });
        companyId = newCompany.id;
      }

      // Step 3: Resolve Customer / Contact mapping
      if (!customerId) {
        const newCustomer = await tx.customer.create({
          data: {
            name: lead.fullName,
            email: lead.email || null,
            phone: lead.phone || null,
            type: 'client',
            companyId,
            createdBy: userId,
          },
        });
        customerId = newCustomer.id;
      }

      if (!config.mergeContact && !contactId) {
        const lastContact = await tx.contact.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { contactNumber: true },
        });
        let nextNum = 1;
        if (lastContact?.contactNumber) {
          const parts = lastContact.contactNumber.split('-');
          const num = parseInt(parts[1], 10);
          if (!isNaN(num)) nextNum = num + 1;
        }
        const contactNumber = `CNT-${String(nextNum).padStart(5, '0')}`;

        const newContact = await tx.contact.create({
          data: {
            contactNumber,
            firstName: lead.firstName,
            lastName: lead.lastName,
            fullName: `${lead.firstName} ${lead.lastName}`.trim(),
            email: lead.email || '',
            phone: lead.phone || null,
            companyId,
            createdBy: userId,
          },
        });
        contactId = newContact.id;
      }

      // Step 4: Resolve Deal mapping
      if (config.dealName && config.dealStageId) {
        const newDeal = await tx.deal.create({
          data: {
            name: config.dealName,
            customerId: customerId as string,
            stageId: config.dealStageId,
            value: lead.value || 0.0,
            assignedToId: lead.assignedToId,
            createdBy: userId,
          },
        });
        dealId = newDeal.id;
      }

      // Step 5: Mark Lead converted and map references
      const convertedStatus = await tx.leadStatus.findFirst({
        where: { name: 'Converted' },
      });

      await tx.lead.update({
        where: { id: leadId },
        data: {
          statusId: convertedStatus?.id || lead.statusId,
          customerId,
          updatedBy: userId,
        },
      });

      // Step 6: Log conversion history
      await tx.leadConversionHistory.create({
        data: {
          leadId,
          customerId,
          companyId,
          contactId,
          dealId,
          notes: config.notes || 'Lead converted successfully via Wizard.',
          createdBy: userId,
        },
      });

      // Write timeline log
      await tx.leadTimeline.create({
        data: {
          leadId,
          type: 'DEAL_CONVERTED',
          title: 'Lead Converted',
          description: `Lead converted to customer and deal. Created references: Contact(${contactId}), Company(${companyId}), Deal(${dealId}).`,
          createdBy: userId,
        },
      });
    });

    return { success: true, customerId, companyId, contactId, dealId };
  },

  /**
   * Rule-Based Lead Scoring Engine
   */
  calculateLeadScore: async (leadId: string) => {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        notes: true,
        activities: true,
        files: true,
      },
    });
    if (!lead) throw new Error('Lead not found');

    let score = 30; // base score
    const factors: Array<{ name: string; val: number }> = [];

    // Evaluate budget value
    if (lead.value && lead.value > 15000) {
      score += 25;
      factors.push({ name: 'High Pipeline Value', val: 25 });
    } else if (lead.value && lead.value > 5000) {
      score += 15;
      factors.push({ name: 'Medium Pipeline Value', val: 15 });
    }

    // Evaluate engagement count
    const totalEngagement = lead.notes.length + lead.activities.length + lead.files.length;
    if (totalEngagement > 8) {
      score += 25;
      factors.push({ name: 'Strong engagement levels', val: 25 });
    } else if (totalEngagement > 3) {
      score += 12;
      factors.push({ name: 'Active discussion thread', val: 12 });
    }

    // Evaluate lead classification criteria
    if (lead.priority === 'Critical') {
      score += 15;
      factors.push({ name: 'Critical priority lead', val: 15 });
    } else if (lead.priority === 'High') {
      score += 8;
      factors.push({ name: 'High priority lead', val: 8 });
    }

    if (lead.rating && lead.rating >= 4) {
      score += 10;
      factors.push({ name: '4+ Star Rating', val: 10 });
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score));

    const dbScore = await prisma.leadScore.upsert({
      where: { leadId },
      update: { score, factors },
      create: { leadId, score, factors },
    });

    return dbScore;
  },

  /**
   * Evaluate health scores indices
   */
  evaluateLeadHealth: async (leadId: string) => {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        score: true,
        activities: true,
      },
    });
    if (!lead) throw new Error('Lead not found');

    const leadScore = lead.score?.score || 50;
    const activitiesCount = lead.activities.length;
    const activityScore = Math.min(100, activitiesCount * 15);
    const engagementScore = Math.round((leadScore + activityScore) / 2);
    const communicationScore = Math.min(100, Math.max(10, leadScore - 5));

    let overallHealth = 'Healthy';
    let followupStatus = 'Good';

    if (engagementScore < 35) {
      overallHealth = 'At Risk';
      followupStatus = 'Critical';
    } else if (engagementScore < 60) {
      overallHealth = 'Needs Attention';
      followupStatus = 'Warning';
    }

    const health = await prisma.leadHealth.upsert({
      where: { leadId },
      update: {
        leadScore,
        activityScore,
        engagementScore,
        communicationScore,
        followupStatus,
        overallHealth,
      },
      create: {
        leadId,
        leadScore,
        activityScore,
        engagementScore,
        communicationScore,
        followupStatus,
        overallHealth,
      },
    });

    return health;
  },

  /**
   * SLA Management response tracking
   */
  updateSlaStatus: async (leadId: string, responseMinutes: number) => {
    let status = 'Green';
    let hasBreached = false;

    // Breach threshold set at 120 minutes (2 hrs response time SLA)
    if (responseMinutes > 120) {
      status = 'Red';
      hasBreached = true;
    } else if (responseMinutes > 60) {
      status = 'Yellow';
    }

    const sla = await prisma.leadSla.upsert({
      where: { leadId },
      update: {
        firstResponseTime: responseMinutes,
        status,
        hasBreached,
      },
      create: {
        leadId,
        firstResponseTime: responseMinutes,
        status,
        hasBreached,
      },
    });

    if (hasBreached) {
      // Send breach notification
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (lead && lead.assignedToId) {
        await prisma.leadNotification.create({
          data: {
            userId: lead.assignedToId,
            title: 'SLA Response Breach Alert',
            message: `Lead ${lead.fullName} (${lead.leadNumber}) exceeded SLA response time limits.`,
            type: 'breach',
            createdBy: 'system',
          },
        });
      }
    }

    return sla;
  },

  /**
   * Conditional Workflow Executor
   */
  executeWorkflows: async (trigger: string, lead: any, userId: string) => {
    const workflows = await prisma.leadWorkflow.findMany({
      where: { trigger, isActive: true },
    });

    for (const wf of workflows) {
      // Simple condition matching logic
      const conditions: any = wf.conditions || {};
      let isMatch = true;

      if (conditions.priority && lead.priority !== conditions.priority) isMatch = false;
      if (conditions.industry && lead.industry !== conditions.industry) isMatch = false;
      if (conditions.minValue && (lead.value || 0) < conditions.minValue) isMatch = false;

      if (isMatch) {
        const actions: any = wf.actions || [];
        for (const action of actions) {
          if (action.type === 'Assign User') {
            await leadAutomationService.assignLead({
              leadId: lead.id,
              assignedToId: action.value,
              type: 'Workflow Engine',
              reason: `Triggered by workflow rule: ${wf.name}`,
              userId,
            });
          }

          if (action.type === 'Change Status') {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { statusId: action.value, updatedBy: userId },
            });
          }

          if (action.type === 'Create Task') {
            const lastTask = await prisma.task.findFirst({
              orderBy: { createdAt: 'desc' },
              select: { taskNumber: true },
            });
            let nextNum = 1;
            if (lastTask?.taskNumber) {
              const parts = lastTask.taskNumber.split('-');
              const num = parseInt(parts[1], 10);
              if (!isNaN(num)) nextNum = num + 1;
            }
            const taskNumber = `TSK-${String(nextNum).padStart(5, '0')}`;

            await prisma.task.create({
              data: {
                taskNumber,
                title: action.value || 'Workflow Auto-generated Task',
                assignedToId: lead.assignedToId || userId,
                priority: 'Medium',
                status: 'Pending',
                relatedModule: 'Leads',
                relatedRecordId: lead.id,
                leadId: lead.id,
                createdBy: userId,
              },
            });
          }
        }
      }
    }
  },
};
export default leadAutomationService;
