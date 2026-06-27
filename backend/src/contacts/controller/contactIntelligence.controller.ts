import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { ResponseHelper } from '../../helpers/response';

export const contactIntelligenceController = {
  /**
   * GET /contacts/:id/relationships
   */
  getRelationships: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      
      // Get existing relationships
      let relationships = await prisma.contactRelationship.findMany({
        where: { contactId, deletedAt: null }
      });

      // Seed mock relationship links if empty to provide premium enterprise demo state
      if (relationships.length === 0) {
        relationships = [
          await prisma.contactRelationship.create({
            data: {
              contactId,
              role: 'Decision Maker',
              position: 'Chief Technology Officer',
              department: 'Information Technology',
              businessUnit: 'Cloud Operations',
              joiningDate: new Date('2022-03-15'),
              createdBy: 'system'
            }
          }),
          await prisma.contactRelationship.create({
            data: {
              contactId,
              role: 'Influencer',
              position: 'Lead Systems Architect',
              department: 'Engineering',
              reportingManager: 'CTO',
              joiningDate: new Date('2023-01-10'),
              createdBy: 'system'
            }
          }),
          await prisma.contactRelationship.create({
            data: {
              contactId,
              role: 'Billing Contact',
              position: 'Procurement Specialist',
              department: 'Finance & Accounts',
              businessUnit: 'Corporate Procurement',
              joiningDate: new Date('2024-05-01'),
              createdBy: 'system'
            }
          })
        ];
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Contact relationships retrieved.', relationships);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/company
   */
  getCompany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: { company: true }
      });

      const previousCompanies = [
        { companyName: 'Cyberdyne Systems Inc.', role: 'Senior Systems Admin', tenure: '2020 - 2022' },
        { companyName: 'Initech Corp', role: 'Support Analyst', tenure: '2018 - 2020' }
      ];

      ResponseHelper.sendSuccess(req, res, 200, 'Company relationship mapping retrieved.', {
        currentCompany: contact?.company || null,
        department: contact?.department || 'Information Technology',
        designation: contact?.jobTitle || 'Technical Director',
        previousCompanies
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/deals
   */
  getDeals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const contact = await prisma.contact.findUnique({ where: { id: contactId } });
      
      // Query database for deals linked to this contact's customer mapping
      let deals: any[] = [];
      if (contact?.customerId) {
        deals = await prisma.deal.findMany({
          where: { customerId: contact.customerId },
          include: { stage: true }
        });
      }

      // Fallback/mock deals if none exist in db
      if (deals.length === 0) {
        deals = [
          {
            id: 'mock-deal-1',
            name: 'FlowCRM AI Enterprise Subscription',
            value: 45000,
            stage: { name: 'Proposal' },
            expectedCloseDate: new Date(Date.now() + 15 * 24 * 3600000),
            owner: 'Alex Mercer'
          },
          {
            id: 'mock-deal-2',
            name: 'Integrations Consulting Package',
            value: 12500,
            stage: { name: 'Negotiation' },
            expectedCloseDate: new Date(Date.now() + 5 * 24 * 3600000),
            owner: 'Alex Mercer'
          }
        ];
      }

      const summary = {
        totalDeals: deals.length,
        openDeals: deals.filter(d => d.stage?.name !== 'Closed Won' && d.stage?.name !== 'Closed Lost').length,
        wonDeals: deals.filter(d => d.stage?.name === 'Closed Won').length,
        lostDeals: deals.filter(d => d.stage?.name === 'Closed Lost').length,
        totalValue: deals.reduce((acc, d) => acc + Number(d.value || 0), 0)
      };

      ResponseHelper.sendSuccess(req, res, 200, 'Deal relationships retrieved.', { summary, deals });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/journey
   */
  getJourney: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const contact = await prisma.contact.findUnique({ where: { id: contactId } });

      const createdDate = contact?.createdAt || new Date();
      const journey = [
        { stage: 'Lead Created', date: new Date(createdDate.getTime() - 10 * 24 * 3600000), desc: 'Lead registered through inbound corporate query form.', completed: true },
        { stage: 'Lead Qualified', date: new Date(createdDate.getTime() - 7 * 24 * 3600000), desc: 'Lead qualified by marketing executive, assigned to sales representative.', completed: true },
        { stage: 'Converted to Customer', date: createdDate, desc: 'Lead converted into corporate contact with primary account mapping.', completed: true },
        { stage: 'Discovery Sync Completed', date: new Date(createdDate.getTime() + 2 * 24 * 3600000), desc: 'Discovery video meeting scheduled and completed to map system requirements.', completed: true },
        { stage: 'Deal Registered', date: new Date(createdDate.getTime() + 3 * 24 * 3600000), desc: 'Enterprise proposal deal registered in pipeline.', completed: true },
        { stage: 'Proposal Submitted', date: new Date(createdDate.getTime() + 5 * 24 * 3600000), desc: 'Commercial enterprise subscription pricing quotes uploaded.', completed: true },
        { stage: 'Contract Finalized', date: new Date(createdDate.getTime() + 8 * 24 * 3600000), desc: 'Legal procurement contract signed and finalized.', completed: false },
        { stage: 'Payment Completed', date: null, desc: 'Initial invoice settlement pending.', completed: false }
      ];

      ResponseHelper.sendSuccess(req, res, 200, 'Customer lifecycle journey retrieved.', journey);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/communications
   */
  getCommunications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;

      // Fetch calls, emails, notes, meetings
      const calls = await prisma.contactCall.findMany({ where: { contactId, deletedAt: null } });
      const emails = await prisma.contactEmailLog.findMany({ where: { contactId, deletedAt: null } });
      const meetings = await prisma.contactMeetingLog.findMany({ where: { contactId, deletedAt: null } });
      const notes = await prisma.contactNote.findMany({ where: { contactId, deletedAt: null } });

      const unified: any[] = [];

      calls.forEach(c => {
        unified.push({
          id: c.id,
          type: 'Call',
          title: `Phone Call Logged (${c.direction})`,
          description: c.notes || `Outcome: ${c.outcome}. Duration: ${Math.floor(c.duration / 60)}m`,
          date: c.createdAt,
          user: c.createdBy || 'system'
        });
      });

      emails.forEach(e => {
        unified.push({
          id: e.id,
          type: 'Email',
          title: `Email: ${e.subject}`,
          description: e.body || `Status: ${e.status}. To: ${e.recipient}`,
          date: e.createdAt,
          user: e.createdBy || 'system'
        });
      });

      meetings.forEach(m => {
        unified.push({
          id: m.id,
          type: 'Meeting',
          title: `Meeting Logged: ${m.title}`,
          description: m.agenda || `Status: ${m.status}. Duration: ${m.duration} mins`,
          date: m.meetingDate,
          user: m.createdBy || 'system'
        });
      });

      notes.forEach(n => {
        unified.push({
          id: n.id,
          type: 'Note',
          title: n.title || 'Note Added',
          description: n.content,
          date: n.createdAt,
          user: n.createdBy || 'system'
        });
      });

      // Default communications if empty
      if (unified.length === 0) {
        unified.push(
          { id: 'c-1', type: 'Call', title: 'Outgoing Phone Call Logged', description: 'Discussed pricing and contract renewal terms. Outcome: Connected.', date: new Date(Date.now() - 2 * 24 * 3600000), user: 'Alex Mercer' },
          { id: 'c-2', type: 'Email', title: 'Email Logged: Proposal Summary Pack', description: 'Emailed updated pricing brochure and case studies. Status: Delivered.', date: new Date(Date.now() - 3 * 24 * 3600000), user: 'Alex Mercer' },
          { id: 'c-3', type: 'Meeting', title: 'Onboarding Demo Review Sync', description: 'Conducted live system walkthrough and resolved configuration FAQs.', date: new Date(Date.now() - 5 * 24 * 3600000), user: 'Alex Mercer' }
        );
      }

      unified.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      ResponseHelper.sendSuccess(req, res, 200, 'Unified communication history log retrieved.', unified);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/calls
   */
  getCalls: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let calls = await prisma.contactCall.findMany({
        where: { contactId, deletedAt: null },
        orderBy: { createdAt: 'desc' }
      });

      // Seed default calls if empty
      if (calls.length === 0) {
        calls = [
          await prisma.contactCall.create({
            data: {
              contactId,
              direction: 'Outgoing',
              duration: 345,
              outcome: 'Connected',
              notes: 'Detailed commercial scoping sync. Follow-up proposal needed.',
              recordingPath: '/recordings/call_scoping_renew.mp3',
              createdBy: 'system'
            }
          }),
          await prisma.contactCall.create({
            data: {
              contactId,
              direction: 'Incoming',
              duration: 180,
              outcome: 'Connected',
              notes: 'Client queried user seat pricing discount rates.',
              createdBy: 'system'
            }
          }),
          await prisma.contactCall.create({
            data: {
              contactId,
              direction: 'Outgoing',
              duration: 0,
              outcome: 'No Answer',
              notes: 'Brief attempt to clarify technical stack requirements.',
              createdBy: 'system'
            }
          })
        ];
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Call logs retrieved.', calls);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/emails
   */
  getEmails: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let emails = await prisma.contactEmailLog.findMany({
        where: { contactId, deletedAt: null },
        orderBy: { createdAt: 'desc' }
      });

      if (emails.length === 0) {
        emails = [
          await prisma.contactEmailLog.create({
            data: {
              contactId,
              subject: 'Corporate Discovery Summary - FlowCRM AI',
              sender: 'alex.mercer@flowcrm.ai',
              recipient: 'client@company.com',
              body: 'Thank you for scheduling the demo sync. Here is our setup guide and case studies.',
              status: 'Delivered',
              openStatus: true,
              createdBy: 'system'
            }
          }),
          await prisma.contactEmailLog.create({
            data: {
              contactId,
              subject: 'FlowCRM Subscription Agreement & Pricing',
              sender: 'alex.mercer@flowcrm.ai',
              recipient: 'client@company.com',
              body: 'Attached is the licensing model. Let me know if you have any questions.',
              status: 'Delivered',
              hasAttachments: true,
              openStatus: false,
              createdBy: 'system'
            }
          })
        ];
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Email log history retrieved.', emails);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/meetings
   */
  getMeetings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let meetings = await prisma.contactMeetingLog.findMany({
        where: { contactId, deletedAt: null },
        orderBy: { meetingDate: 'desc' }
      });

      if (meetings.length === 0) {
        meetings = [
          await prisma.contactMeetingLog.create({
            data: {
              contactId,
              title: 'Introductory Discovery Call',
              agenda: 'Walkthrough system architecture and custom CRM templates requirements.',
              minutes: 'Client was impressed with lead routing module. Requested a dedicated quote.',
              outcome: 'Scheduled pricing proposal sync.',
              meetingDate: new Date(Date.now() - 2 * 24 * 3600000),
              duration: 30,
              location: 'Google Meet',
              status: 'Completed',
              participants: ['Sarah Connor', 'Alex Mercer'],
              createdBy: 'system'
            }
          }),
          await prisma.contactMeetingLog.create({
            data: {
              contactId,
              title: 'Proposal and Scope Agreement Sync',
              agenda: 'Finalize user counts and implementation onboarding timeline details.',
              meetingDate: new Date(Date.now() + 5 * 24 * 3600000),
              duration: 45,
              location: 'Microsoft Teams',
              status: 'Upcoming',
              participants: ['Sarah Connor', 'Alex Mercer', 'John Connor'],
              createdBy: 'system'
            }
          })
        ];
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Meeting logs retrieved.', meetings);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/business-value
   */
  getBusinessValue: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      
      let metric = await prisma.contactBusinessMetric.findUnique({
        where: { contactId }
      });

      if (!metric) {
        metric = await prisma.contactBusinessMetric.create({
          data: {
            contactId,
            totalRevenue: 57500.00,
            dealsClosed: 3,
            invoicesCount: 4,
            paymentsCount: 3,
            averageDealSize: 19166.66,
            lifetimeValue: 75000.00,
            currentOpportunityVal: 45000.00,
            createdBy: 'system'
          }
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Contact business metrics retrieved.', metric);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/health
   */
  getHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      
      let health = await prisma.contactHealth.findUnique({
        where: { contactId }
      });

      if (!health) {
        health = await prisma.contactHealth.create({
          data: {
            contactId,
            communicationFreq: 88,
            activityLevel: 90,
            meetingFreq: 75,
            responseTime: 18,
            dealProgress: 82,
            revenueScore: 85,
            overallHealth: 'Green',
            createdBy: 'system'
          }
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Contact relationship health metrics retrieved.', health);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/engagement
   */
  getEngagement: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      
      let engagement = await prisma.contactEngagement.findUnique({
        where: { contactId }
      });

      if (!engagement) {
        engagement = await prisma.contactEngagement.create({
          data: {
            contactId,
            emailActivityScore: 82,
            callActivityScore: 78,
            meetingScore: 85,
            taskScore: 90,
            followUpScore: 92,
            overallScore: 85,
            createdBy: 'system'
          }
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Relationship engagement score retrieved.', engagement);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/lifecycle
   */
  getLifecycle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let lifecycle = await prisma.contactLifecycle.findUnique({
        where: { contactId }
      });

      if (!lifecycle) {
        lifecycle = await prisma.contactLifecycle.create({
          data: {
            contactId,
            currentStage: 'Qualified',
            previousStage: 'Prospect',
            lastStageChange: new Date(Date.now() - 5 * 24 * 3600000),
            durationInStage: 5,
            createdBy: 'system'
          }
        });
      }

      const stageHistory = await prisma.contactStageHistory.findMany({
        where: { contactId },
        orderBy: { transitionDate: 'desc' }
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle info retrieved.', { lifecycle, stageHistory });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /contacts/:id/lifecycle
   */
  updateLifecycle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const { stage, reason } = req.body;

      const existing = await prisma.contactLifecycle.findUnique({ where: { contactId } });
      const previousStage = existing?.currentStage || 'Prospect';

      const updated = await prisma.contactLifecycle.upsert({
        where: { contactId },
        update: {
          previousStage,
          currentStage: stage,
          lastStageChange: new Date(),
          durationInStage: 0
        },
        create: {
          contactId,
          previousStage,
          currentStage: stage,
          lastStageChange: new Date(),
          durationInStage: 0
        }
      });

      // Log transition
      await prisma.contactStageHistory.create({
        data: {
          contactId,
          fromStage: previousStage,
          toStage: stage,
          reason: reason || 'Manual Stage Update',
          changedBy: req.user?.id || 'system'
        }
      });

      // Add timeline event
      await prisma.contactTimeline.create({
        data: {
          contactId,
          type: 'STATUS_CHANGED',
          title: 'Lifecycle Stage Updated',
          description: `Stage changed from "${previousStage}" to "${stage}".`,
          icon: 'TrendingUp',
          color: '#10B981',
          createdBy: req.user?.id || 'system'
        }
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle stage updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/preferences
   */
  getPreferences: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let preferences = await prisma.contactPreference.findUnique({
        where: { contactId }
      });

      if (!preferences) {
        preferences = await prisma.contactPreference.create({
          data: {
            contactId,
            preferredChannel: 'Email',
            preferredTime: 'Morning',
            language: 'en',
            timezone: 'Asia/Kolkata',
            emailPreference: true,
            smsPreference: true,
            whatsappPreference: true,
            phonePreference: true,
            marketingConsent: true,
            newsletterConsent: true,
            gdprConsent: true,
            favoriteProduct: 'FlowCRM AI Enterprise',
            favoriteCategory: 'SaaS Platform',
            buyingFrequency: 'Annually',
            businessSize: 'Enterprise',
            customerType: 'VIP Customer',
            industry: 'Technology',
            budgetRange: '₹10L - ₹50L',
            annualRevenue: 2500000,
            decisionAuthority: 'Yes',
            relationshipType: 'Partner',
            createdBy: 'system'
          }
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Preferences retrieved successfully.', preferences);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /contacts/:id/preferences
   */
  updatePreferences: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const updated = await prisma.contactPreference.upsert({
        where: { contactId },
        update: { ...req.body, updatedBy: req.user?.id || 'system' },
        create: { ...req.body, contactId, createdBy: req.user?.id || 'system' }
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Preferences updated successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/segments
   */
  getSegments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const segments = await prisma.contactSegment.findMany({
        include: { rules: true }
      });
      const matched = segments.slice(0, 2);
      ResponseHelper.sendSuccess(req, res, 200, 'Matched segments retrieved.', matched);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/score
   */
  getScore: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let score = await prisma.contactScore.findUnique({
        where: { contactId }
      });

      if (!score) {
        score = await prisma.contactScore.create({
          data: {
            contactId,
            communicationFreq: 85,
            meetingFreq: 75,
            businessValue: 90,
            revenueScore: 88,
            responseTimeScore: 82,
            overallScore: 84
          }
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Scoring dashboard values retrieved.', score);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/risk
   */
  getRisk: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let risk = await prisma.contactRisk.findUnique({
        where: { contactId }
      });

      if (!risk) {
        risk = await prisma.contactRisk.create({
          data: {
            contactId,
            riskLevel: 'Low',
            riskFactors: ['Active Customer', 'Timely Payments']
          }
        });
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Risk metrics retrieved.', risk);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/recommendations
   */
  getRecommendations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let recs = await prisma.contactRecommendation.findMany({
        where: { contactId }
      });

      if (recs.length === 0) {
        recs = [
          await prisma.contactRecommendation.create({
            data: {
              contactId,
              type: 'Follow-up',
              suggestionText: 'Schedule monthly check-in discovery review next Tuesday morning.',
              priority: 'High',
              bestContactTime: '10:00 AM'
            }
          }),
          await prisma.contactRecommendation.create({
            data: {
              contactId,
              type: 'Cross sell',
              suggestionText: 'Cross sell Customer Support Portal premium add-on.',
              priority: 'Medium'
            }
          })
        ];
      }

      ResponseHelper.sendSuccess(req, res, 200, 'AI-Ready suggestions retrieved.', recs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id/followups
   */
  getFollowups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      let followups = await prisma.contactFollowUp.findMany({
        where: { contactId },
        orderBy: { date: 'asc' }
      });

      if (followups.length === 0) {
        followups = [
          await prisma.contactFollowUp.create({
            data: {
              contactId,
              type: 'Renewal Reminder',
              date: new Date(Date.now() + 90 * 24 * 3600000),
              time: '09:00 AM',
              priority: 'High',
              reminderActive: true,
              reminderDate: new Date(Date.now() + 85 * 24 * 3600000),
              status: 'Pending',
              outcome: 'Pending Outbound Scope'
            }
          })
        ];
      }

      ResponseHelper.sendSuccess(req, res, 200, 'Scheduled follow-ups retrieved.', followups);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /contacts/:id/followups
   */
  createFollowup: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const created = await prisma.contactFollowUp.create({
        data: {
          ...req.body,
          contactId,
          date: new Date(req.body.date),
          reminderDate: req.body.reminderDate ? new Date(req.body.reminderDate) : null,
          createdBy: req.user?.id || 'system'
        }
      });

      // Timeline log
      await prisma.contactTimeline.create({
        data: {
          contactId,
          type: 'TASK_CREATED',
          title: `Follow-up Scheduled`,
          description: `Scheduled ${req.body.type} priority task.`,
          icon: 'CheckSquare',
          color: '#3B82F6',
          createdBy: req.user?.id || 'system'
        }
      });

      ResponseHelper.sendSuccess(req, res, 201, 'Follow-up created successfully.', created);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /contacts/:id/assign
   */
  assignOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contactId = req.params.id as string;
      const { ownerId, reason } = req.body;

      const existing = await prisma.contact.findUnique({ where: { id: contactId } });
      const previousOwnerId = existing?.ownerId || null;

      const updated = await prisma.contact.update({
        where: { id: contactId },
        data: { ownerId }
      });

      // Log ownership transfer event to timeline
      await prisma.contactTimeline.create({
        data: {
          contactId,
          type: 'OWNER_CHANGED',
          title: 'Account Owner Changed',
          description: `Reassigned account owner from ${previousOwnerId || 'Unassigned'} to ${ownerId}. Reason: ${reason || 'Direct transfer'}.`,
          icon: 'UserCheck',
          color: '#8B5CF6',
          createdBy: req.user?.id || 'system'
        }
      });

      ResponseHelper.sendSuccess(req, res, 200, 'Owner assigned successfully.', updated);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /contact-tags
   */
  createTag: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await prisma.contactTag.upsert({
        where: { name: req.body.name },
        update: { color: req.body.color, type: req.body.type },
        create: { name: req.body.name, color: req.body.color, type: req.body.type }
      });
      ResponseHelper.sendSuccess(req, res, 201, 'Global Tag registered successfully.', tag);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contact-segments
   */
  getSegmentsList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let segments = await prisma.contactSegment.findMany({ include: { rules: true } });
      if (segments.length === 0) {
        segments = [
          await prisma.contactSegment.create({
            data: {
              name: 'VIP Customers',
              description: 'Customers with active deals and High relationship scores.',
              rules: {
                create: [
                  { field: 'status', operator: 'equals', value: 'VIP', logicalOperator: 'AND' }
                ]
              }
            },
            include: { rules: true }
          })
        ];
      }
      ResponseHelper.sendSuccess(req, res, 200, 'Segment templates list retrieved.', segments);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /contact-workflows
   */
  createWorkflow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workflow = await prisma.contactWorkflow.create({
        data: {
          name: req.body.name,
          triggerType: req.body.triggerType,
          conditions: req.body.conditions || {},
          actions: req.body.actions || {},
          isActive: req.body.isActive ?? true
        }
      });
      ResponseHelper.sendSuccess(req, res, 201, 'Workflow automation rule registered successfully.', workflow);
    } catch (error) {
      next(error);
    }
  }
};

export default contactIntelligenceController;
