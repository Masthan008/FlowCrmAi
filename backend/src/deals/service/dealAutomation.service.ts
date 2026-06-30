import { dealAutomationRepository } from '../repository/dealAutomation.repository';
import { dealRepository } from '../repository/deal.repository';
import { prisma } from '../../database/db';

export const dealAutomationService = {
  // DEAL LIFECYCLE
  getLifecycle: async (dealId: string) => {
    return dealAutomationRepository.findLifecycleByDealId(dealId);
  },

  updateLifecycle: async (dealId: string, data: any) => {
    return dealAutomationRepository.updateLifecycle(dealId, data);
  },

  // DEAL SCORING (RULE-BASED)
  getScore: async (dealId: string) => {
    const deal = await dealRepository.findByIdWithRelations(dealId);
    if (!deal) throw { statusCode: 404, message: 'Deal opportunity not found.' };

    // 1. Company Score (20 pts max)
    const companyScore = deal.companyId ? 20 : 0;

    // 2. Contact Engagement (20 pts max)
    const contactEngagement = deal.primaryContactId ? 20 : 0;

    // 3. Meeting Score (20 pts max)
    const meetingCount = await prisma.meeting.count({ where: { dealId } });
    const meetingsScore = Math.min(meetingCount * 5, 20);

    // 4. Activity Score (20 pts max)
    const activityCount = await prisma.dealActivity.count({ where: { dealId } });
    const activityScore = Math.min(activityCount * 3, 20);

    // 5. Task Completion Score (20 pts max)
    const totalTasks = await prisma.task.count({ where: { dealId } });
    const completedTasks = await prisma.task.count({ where: { dealId, status: 'Completed' } });
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 20) : 10;

    // Additional modifiers
    const dealValueMultiplier = deal.value >= 50000 ? 10 : 0;
    const hasDecisionMaker = deal.primaryContactId ? true : false;
    const decisionMakerBonus = hasDecisionMaker ? 10 : 0;

    const totalScore = Math.min(
      companyScore + contactEngagement + meetingsScore + activityScore + taskScore + dealValueMultiplier + decisionMakerBonus,
      100
    );

    let category = 'Weak';
    if (totalScore >= 85) category = 'Excellent';
    else if (totalScore >= 70) category = 'Strong';
    else if (totalScore >= 50) category = 'Average';
    else if (totalScore >= 30) category = 'Weak';
    else category = 'Critical';

    const scoreData = {
      score: totalScore,
      category,
      companyScore,
      contactEngagement,
      meetingCount,
      activityCount,
      taskCompletion: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      dealValue: deal.value,
      pipelineStage: deal.stage?.name || 'Discovery',
      quoteStatus: 'draft',
      decisionMakerAvail: hasDecisionMaker,
      relationshipStrength: totalScore >= 70 ? 'High' : totalScore >= 50 ? 'Medium' : 'Low'
    };

    await dealAutomationRepository.updateScore(dealId, scoreData);
    return scoreData;
  },

  // WIN PROBABILITY (RULE-BASED)
  getWinProbability: async (dealId: string) => {
    const deal = await dealRepository.findByIdWithRelations(dealId);
    if (!deal) throw { statusCode: 404, message: 'Deal opportunity not found.' };

    const stageName = deal.stage?.name || 'Discovery';
    let baseProb = 20;

    if (stageName.includes('Won')) baseProb = 100;
    else if (stageName.includes('Contract') || stageName.includes('Legal')) baseProb = 90;
    else if (stageName.includes('Negotiation')) baseProb = 80;
    else if (stageName.includes('Proposal')) baseProb = 60;
    else if (stageName.includes('Needs') || stageName.includes('Analysis')) baseProb = 40;
    else if (stageName.includes('Qualified')) baseProb = 30;
    else if (stageName.includes('Discovery')) baseProb = 20;
    else if (stageName.includes('Lost') || stageName.includes('Cancelled')) baseProb = 0;

    // Modify probability based on tasks, meetings, values
    const taskCount = await prisma.task.count({ where: { dealId } });
    const completedTaskCount = await prisma.task.count({ where: { dealId, status: 'Completed' } });
    const taskCompletionRate = taskCount > 0 ? completedTaskCount / taskCount : 0.5;

    let modifier = 0;
    if (taskCompletionRate > 0.8) modifier += 10;
    else if (taskCompletionRate < 0.3) modifier -= 10;

    const meetingCount = await prisma.meeting.count({ where: { dealId } });
    if (meetingCount >= 3) modifier += 5;

    const finalProbability = Math.max(0, Math.min(100, baseProb + modifier));

    let confidenceLevel = 'Medium';
    if (finalProbability >= 80) confidenceLevel = 'High';
    else if (finalProbability < 40) confidenceLevel = 'Low';

    const reasoningSummary = `Based on current pipeline stage "${stageName}" (base conversion rate ${baseProb}%) modified by client meeting indicators (+${meetingCount >= 3 ? 5 : 0}%) and task completion trends (+${taskCompletionRate > 0.8 ? 10 : taskCompletionRate < 0.3 ? -10 : 0}%).`;

    const probData = {
      probability: finalProbability,
      confidenceLevel,
      reasoningSummary
    };

    await dealAutomationRepository.updateWinProbability(dealId, probData);
    return probData;
  },

  // HEALTH TRACKER
  getHealth: async (dealId: string) => {
    const deal = await dealRepository.findByIdWithRelations(dealId);
    if (!deal) throw { statusCode: 404, message: 'Deal opportunity not found.' };

    const commCount = await prisma.dealActivity.count({ where: { dealId, type: 'email' } });
    const activityCount = await prisma.dealActivity.count({ where: { dealId } });
    const meetingCount = await prisma.meeting.count({ where: { dealId } });
    const taskCount = await prisma.task.count({ where: { dealId } });
    const completedTasks = await prisma.task.count({ where: { dealId, status: 'Completed' } });

    const commScore = Math.min(commCount * 25, 100);
    const actScore = Math.min(activityCount * 15, 100);
    const meetScore = Math.min(meetingCount * 25, 100);
    const taskScore = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 50;

    const avgScore = Math.round((commScore + actScore + meetScore + taskScore) / 4);

    let overallHealth = 'Average';
    if (avgScore >= 80) overallHealth = 'Excellent';
    else if (avgScore >= 65) overallHealth = 'Good';
    else if (avgScore >= 45) overallHealth = 'Average';
    else if (avgScore >= 25) overallHealth = 'Poor';
    else overallHealth = 'Critical';

    const healthData = {
      overallHealth,
      communicationScore: commScore,
      activityScore: actScore,
      meetingsScore: meetScore,
      revenueScore: deal.value >= 50000 ? 90 : 60,
      tasksScore: taskScore,
      approvalsScore: 80,
      timelineProgress: 50,
      pipelineMovement: 70
    };

    await dealAutomationRepository.updateHealth(dealId, healthData);
    return healthData;
  },

  // RISK ANALYSIS
  getRisk: async (dealId: string) => {
    const deal = await dealRepository.findByIdWithRelations(dealId);
    if (!deal) throw { statusCode: 404, message: 'Deal opportunity not found.' };

    const reasons: string[] = [];
    let riskLevel = 'Low';

    const lastActivity = await prisma.dealActivity.findFirst({
      where: { dealId },
      orderBy: { createdAt: 'desc' }
    });

    if (!lastActivity) {
      reasons.push('No activities or communication logs registered for this opportunity.');
      riskLevel = 'High';
    } else {
      const daysSinceActivity = (Date.now() - new Date(lastActivity.createdAt).getTime()) / (1000 * 3600 * 24);
      if (daysSinceActivity > 14) {
        reasons.push(`Stalled engagement: No communications logged in ${Math.round(daysSinceActivity)} days.`);
        riskLevel = 'Critical';
      }
    }

    if (!deal.primaryContactId) {
      reasons.push('Key stakeholder risk: No primary decision maker associated with deal.');
      if (riskLevel === 'Low') riskLevel = 'Medium';
    }

    if (deal.value >= 100000) {
      reasons.push('High value risk complexity: Size of opportunity exceeds $100K threshold, requiring multiple signoffs.');
    }

    const taskCount = await prisma.task.count({ where: { dealId, status: 'Overdue' } });
    if (taskCount > 0) {
      reasons.push(`${taskCount} action item tasks are currently overdue.`);
      riskLevel = 'High';
    }

    let recommendedAction = 'Schedule a check-in call with client team to re-qualify project scope.';
    if (riskLevel === 'Critical') {
      recommendedAction = 'ESCALATE: Reassign deal owner or invite super-admin sponsor to help remove project bottlenecks.';
    } else if (riskLevel === 'High') {
      recommendedAction = 'Send customized pricing sheet proposal copy and request feedback.';
    }

    return {
      dealId,
      riskLevel,
      reasons,
      recommendedAction
    };
  },

  // SMART RECOMMENDATIONS
  getRecommendations: async (dealId: string) => {
    return dealAutomationRepository.findRecommendationsByDealId(dealId);
  },

  // SLA STATUS
  getSLA: async (dealId: string) => {
    return dealAutomationRepository.findSLAByDealId(dealId);
  },

  // PLAYBOOKS
  getPlaybooks: async (dealId: string) => {
    return dealAutomationRepository.findPlaybooksByDealId(dealId);
  },

  // FOLLOW-UPS
  getFollowups: async (dealId: string) => {
    return dealAutomationRepository.findFollowupsByDealId(dealId);
  },

  createFollowup: async (dealId: string, data: any, createdBy?: string) => {
    return dealAutomationRepository.createFollowup({
      dealId,
      channel: data.channel,
      assignedToId: data.assignedToId,
      scheduledDate: new Date(data.scheduledDate),
      priority: data.priority || 'Medium',
      reminderAlert: data.reminderAlert || false,
      status: 'Scheduled',
      outcome: data.outcome || null,
      createdBy
    });
  },

  // EXECUTIVE SALES INSIGHTS
  getExecutiveInsights: async () => {
    const highestValueDeals = await prisma.deal.findMany({
      where: { deletedAt: null },
      orderBy: { value: 'desc' },
      take: 5,
      include: { company: true, stage: true }
    });

    const activeDeals = await prisma.deal.findMany({
      where: { deletedAt: null, status: 'Open' },
      include: { stage: true }
    });

    // Compute win rates and insights
    const wonCount = await prisma.deal.count({ where: { status: 'Won' } });
    const lostCount = await prisma.deal.count({ where: { status: 'Lost' } });
    const totalClosed = wonCount + lostCount;
    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 75;

    return {
      highestValueDeals: highestValueDeals.map(d => ({
        id: d.id,
        name: d.name,
        companyName: d.company?.name || 'Independent Client',
        value: d.value,
        stage: d.stage?.name || 'Discovery'
      })),
      dealsAtRisk: activeDeals.slice(0, 3).map(d => ({
        id: d.id,
        name: d.name,
        value: d.value,
        risk: 'High'
      })),
      insightsKPIs: {
        winRate,
        averageSalesCycle: 42, // Days
        forecastAccuracy: 88, // %
        fastestClosingDealsCount: wonCount,
        longestSalesCycleCount: lostCount
      }
    };
  },

  // WORKFLOWS MANAGEMENT
  getWorkflows: async (module?: string) => {
    return dealAutomationRepository.findWorkflows(module);
  },

  createWorkflow: async (data: any) => {
    return dealAutomationRepository.createWorkflow({
      name: data.name,
      module: data.module,
      trigger: data.trigger,
      conditions: data.conditions,
      actions: data.actions,
      isActive: data.isActive !== undefined ? data.isActive : true
    });
  },

  // RUN WORKFLOW ENGINE (REUSABLE PROCESSOR)
  triggerWorkflows: async (module: string, trigger: string, entity: any) => {
    const startTime = Date.now();
    const workflows = await prisma.cRMWorkflow.findMany({
      where: { module, trigger, isActive: true }
    });

    for (const flow of workflows) {
      try {
        let conditionsMet = true;
        const conditions = flow.conditions as any;

        // Evaluate conditions
        if (conditions && typeof conditions === 'object') {
          for (const [key, filter] of Object.entries(conditions)) {
            const val = entity[key];

            // Evaluate conditional operators (gte, lte, equals)
            if (filter && typeof filter === 'object') {
              const operatorFilter = filter as Record<string, any>;
              if (operatorFilter.gte !== undefined && val < operatorFilter.gte) conditionsMet = false;
              if (operatorFilter.lte !== undefined && val > operatorFilter.lte) conditionsMet = false;
              if (operatorFilter.equals !== undefined && val !== operatorFilter.equals) conditionsMet = false;
            } else {
              // Direct equality check
              if (val !== filter) conditionsMet = false;
            }
          }
        }

        if (conditionsMet) {
          // Execute Workflow Actions
          const actions = flow.actions as any[];
          for (const action of actions) {
            if (action.type === 'Create Task') {
              const fallbackEmployee = await prisma.employee.findFirst({ select: { id: true } });
              const assignedToId = entity.assignedToId || fallbackEmployee?.id;
              if (assignedToId) {
                await prisma.task.create({
                  data: {
                    taskNumber: 'TSK-' + Math.floor(100000 + Math.random() * 900000),
                    title: action.title || 'Workflow Action Task',
                    status: 'Pending',
                    priority: 'Medium',
                    dealId: entity.id,
                    assignedToId
                  }
                });
              }
            } else if (action.type === 'Add Tag') {
              const existingTags = entity.tags || [];
              if (!existingTags.includes(action.value)) {
                await prisma.deal.update({
                  where: { id: entity.id },
                  data: { tags: [...existingTags, action.value] }
                });
              }
            } else if (action.type === 'Create Notification') {
              await prisma.dealTimeline.create({
                data: {
                  dealId: entity.id,
                  type: 'NOTIFICATION',
                  title: `Automation Trigger: ${flow.name}`,
                  description: action.title || 'Workflow action triggered.',
                  icon: 'AlertCircle',
                  color: 'indigo'
                }
              });
            }
          }

          // Log workflow run
          await dealAutomationRepository.createWorkflowLog({
            workflowId: flow.id,
            entityId: entity.id,
            trigger,
            conditionPassed: true,
            executionTime: Date.now() - startTime,
            result: `Successfully matched conditions & executed ${actions.length} action items.`
          });
        } else {
          // Conditions did not match, log mismatch
          await dealAutomationRepository.createWorkflowLog({
            workflowId: flow.id,
            entityId: entity.id,
            trigger,
            conditionPassed: false,
            executionTime: Date.now() - startTime,
            result: 'Conditions checklist evaluation did not pass. Skipped actions execution.'
          });
        }
      } catch (err: any) {
        // Log workflow runner engine exceptions
        await dealAutomationRepository.createWorkflowLog({
          workflowId: flow.id,
          entityId: entity.id,
          trigger,
          conditionPassed: false,
          executionTime: Date.now() - startTime,
          error: err.message || 'Unknown automation execution error'
        });
      }
    }
  }
};
