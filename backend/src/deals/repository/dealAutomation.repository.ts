import { prisma } from '../../database/db';

export const dealAutomationRepository = {
  // DEAL LIFECYCLE
  findLifecycleByDealId: async (dealId: string) => {
    let lifecycle = await prisma.dealLifecycle.findUnique({
      where: { dealId }
    });

    if (!lifecycle) {
      lifecycle = await prisma.dealLifecycle.create({
        data: {
          dealId,
          currentStage: 'Discovery',
          recommendedNextStage: 'Needs Analysis',
          previousStage: 'Qualified',
          durationInStage: 3600 * 24 * 3 // 3 days in seconds
        }
      });
    }
    return lifecycle;
  },

  updateLifecycle: async (dealId: string, data: any) => {
    return prisma.dealLifecycle.upsert({
      where: { dealId },
      update: data,
      create: { dealId, ...data }
    });
  },

  // DEAL SCORING
  findScoreByDealId: async (dealId: string) => {
    let score = await prisma.dealScore.findUnique({
      where: { dealId }
    });

    if (!score) {
      score = await prisma.dealScore.create({
        data: {
          dealId,
          score: 72,
          category: 'Strong',
          companyScore: 80,
          contactEngagement: 65,
          meetingCount: 3,
          activityCount: 8,
          taskCompletion: 70,
          dealValue: 45000.0,
          pipelineStage: 'Discovery',
          quoteStatus: 'draft',
          decisionMakerAvail: true,
          relationshipStrength: 'High'
        }
      });
    }
    return score;
  },

  updateScore: async (dealId: string, data: any) => {
    return prisma.dealScore.upsert({
      where: { dealId },
      update: data,
      create: { dealId, ...data }
    });
  },

  // WIN PROBABILITY
  findWinProbabilityByDealId: async (dealId: string) => {
    let prob = await prisma.dealWinProbability.findUnique({
      where: { dealId }
    });

    if (!prob) {
      prob = await prisma.dealWinProbability.create({
        data: {
          dealId,
          probability: 65,
          confidenceLevel: 'Medium',
          reasoningSummary: 'Decision maker has confirmed requirements and budget fits our pricing sheet. Awaiting quote confirmation.'
        }
      });
    }
    return prob;
  },

  updateWinProbability: async (dealId: string, data: any) => {
    return prisma.dealWinProbability.upsert({
      where: { dealId },
      update: data,
      create: { dealId, ...data }
    });
  },

  // DEAL HEALTH
  findHealthByDealId: async (dealId: string) => {
    let health = await prisma.dealHealth.findUnique({
      where: { dealId }
    });

    if (!health) {
      health = await prisma.dealHealth.create({
        data: {
          dealId,
          overallHealth: 'Good',
          communicationScore: 80,
          activityScore: 70,
          meetingsScore: 85,
          revenueScore: 90,
          tasksScore: 60,
          approvalsScore: 50,
          timelineProgress: 45,
          pipelineMovement: 75
        }
      });
    }
    return health;
  },

  updateHealth: async (dealId: string, data: any) => {
    return prisma.dealHealth.upsert({
      where: { dealId },
      update: data,
      create: { dealId, ...data }
    });
  },

  // DEAL RISK
  findRisksByDealId: async (dealId: string) => {
    const risks = await prisma.dealRisk.findMany({
      where: { dealId }
    });

    if (risks.length === 0) {
      const seedRisk = await prisma.dealRisk.create({
        data: {
          dealId,
          riskLevel: 'Medium',
          reasons: ['No communication logged in the last 7 days', 'Missing explicit contract review sign-off'],
          recommendedAction: 'Schedule an immediate follow-up status call and invite the primary technical consultant.'
        }
      });
      return [seedRisk];
    }
    return risks;
  },

  createRisk: async (data: any) => {
    return prisma.dealRisk.create({ data });
  },

  // SMART RECOMMENDATIONS
  findRecommendationsByDealId: async (dealId: string) => {
    const items = await prisma.dealRecommendation.findMany({
      where: { dealId, isCompleted: false }
    });

    if (items.length === 0) {
      await prisma.dealRecommendation.createMany({
        data: [
          { dealId, recommendation: 'Schedule Follow-up', reason: 'Keep customer engaged after discovery phase.' },
          { dealId, recommendation: 'Request Approval', reason: 'Quote discount exceeds 5% default delegation limit.' },
          { dealId, recommendation: 'Contact Decision Maker', reason: 'Ensure technical stakeholders approve custom terms.' }
        ]
      });
      return prisma.dealRecommendation.findMany({ where: { dealId, isCompleted: false } });
    }
    return items;
  },

  updateRecommendation: async (id: string, isCompleted: boolean) => {
    return prisma.dealRecommendation.update({
      where: { id },
      data: { isCompleted }
    });
  },

  // SLA MANAGEMENT
  findSLAByDealId: async (dealId: string) => {
    let sla = await prisma.dealSLA.findUnique({
      where: { dealId }
    });

    if (!sla) {
      sla = await prisma.dealSLA.create({
        data: {
          dealId,
          firstResponseStatus: 'Green',
          firstResponseTime: new Date(Date.now() - 3600000 * 2),
          proposalResponseStatus: 'Yellow',
          proposalResponseTime: new Date(Date.now() + 3600000 * 24),
          followUpStatus: 'Green',
          followUpTime: new Date(Date.now() + 3600000 * 48),
          negotiationStatus: 'Green',
          negotiationTime: new Date(Date.now() + 3600000 * 72),
          approvalStatus: 'Green',
          approvalTime: new Date(Date.now() + 3600000 * 12),
          expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 30),
          escalationTime: new Date(Date.now() + 3600000 * 24 * 10)
        }
      });
    }
    return sla;
  },

  updateSLA: async (dealId: string, data: any) => {
    return prisma.dealSLA.upsert({
      where: { dealId },
      update: data,
      create: { dealId, ...data }
    });
  },

  // PLAYBOOKS
  findPlaybooksByDealId: async (dealId: string) => {
    const playbooks = await prisma.dealPlaybook.findMany({
      where: { dealId }
    });

    if (playbooks.length === 0) {
      const seedPlaybook = await prisma.dealPlaybook.create({
        data: {
          dealId,
          name: 'Enterprise Sales Playbook',
          checklist: [
            { id: '1', task: 'Confirm executive sponsor', done: true },
            { id: '2', task: 'Log competitor details', done: false },
            { id: '3', task: 'Submit technical proposal', done: false }
          ],
          recommendedActivities: [
            { activity: 'Schedule technical discovery demo session', days: 5 },
            { activity: 'Conduct legal compliance validation review', days: 15 }
          ],
          documentsRequired: ['NDA Sign-off', 'Pricing proposal sheet', 'Technical SLA document'],
          milestones: ['Discovery Completed', 'Demo Sign-off', 'Contract Negotiation Started']
        }
      });
      return [seedPlaybook];
    }
    return playbooks;
  },

  createPlaybook: async (data: any) => {
    return prisma.dealPlaybook.create({ data });
  },

  // FOLLOW-UPS
  findFollowupsByDealId: async (dealId: string) => {
    const list = await prisma.dealFollowup.findMany({
      where: { dealId, deletedAt: null },
      orderBy: { scheduledDate: 'asc' }
    });

    if (list.length === 0) {
      await prisma.dealFollowup.createMany({
        data: [
          {
            dealId,
            channel: 'Phone Call',
            scheduledDate: new Date(Date.now() + 3600000 * 24),
            priority: 'High',
            reminderAlert: true,
            status: 'Scheduled',
            notes: 'Follow up regarding pricing quote approval.',
            createdBy: 'system'
          } as any,
          {
            dealId,
            channel: 'Email Placeholder',
            scheduledDate: new Date(Date.now() + 3600000 * 48),
            priority: 'Medium',
            reminderAlert: false,
            status: 'Scheduled',
            notes: 'Share case study files and SLA sheets.',
            createdBy: 'system'
          } as any
        ]
      });
      return prisma.dealFollowup.findMany({ where: { dealId, deletedAt: null } });
    }
    return list;
  },

  createFollowup: async (data: any) => {
    return prisma.dealFollowup.create({ data });
  },

  // WORKFLOW ENGINE
  findWorkflows: async (module?: string) => {
    const list = await prisma.cRMWorkflow.findMany({
      where: {
        deletedAt: null,
        ...(module && { module })
      },
      orderBy: { createdAt: 'desc' }
    });

    // Seed generic default CRM workflows if none exist
    if (list.length === 0) {
      await prisma.cRMWorkflow.createMany({
        data: [
          {
            name: 'Auto-escalate High-Value Enterprise Deals',
            module: 'Deal',
            trigger: 'Deal Created',
            conditions: { revenue: { gte: 50000 } },
            actions: [
              { type: 'Add Tag', value: 'High Value' },
              { type: 'Create Task', title: 'Schedule Discovery Call within 24 Hours' }
            ],
            isActive: true,
            createdBy: 'system'
          },
          {
            name: 'Automate Owner Task on Stage Change',
            module: 'Deal',
            trigger: 'Stage Changed',
            conditions: { stage: 'Proposal' },
            actions: [
              { type: 'Create Task', title: 'Compile Custom Pricing Sheet Proposal' }
            ],
            isActive: true,
            createdBy: 'system'
          }
        ]
      });
      return prisma.cRMWorkflow.findMany({ where: { deletedAt: null } });
    }
    return list;
  },

  createWorkflow: async (data: any) => {
    return prisma.cRMWorkflow.create({ data });
  },

  createWorkflowLog: async (data: any) => {
    return prisma.cRMWorkflowLog.create({ data });
  },

  findWorkflowLogs: async (workflowId?: string) => {
    return prisma.cRMWorkflowLog.findMany({
      where: {
        ...(workflowId && { workflowId })
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }
};
