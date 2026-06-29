"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealPipelineRepository = exports.DealPipelineRepository = void 0;
const db_1 = require("../../database/db");
const dealIncludeKanban = {
    company: { select: { id: true, name: true } },
    primaryContact: { select: { id: true, firstName: true, lastName: true } },
    assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    stage: { select: { id: true, name: true, order: true, probability: true, color: true } },
    pipeline: { select: { id: true, name: true } },
    dealActivities: { select: { id: true }, take: 1, orderBy: { createdAt: 'desc' } },
    dealNotes: { select: { id: true }, take: 1 },
    tasks: { select: { id: true, status: true } },
    meetings: { select: { id: true }, take: 1 },
    dealQuotes: { select: { id: true }, take: 1 },
};
class DealPipelineRepository {
    // ─── PIPELINE CRUD ──────────────────────────────────────
    async getPipelines() {
        return db_1.prisma.pipeline.findMany({
            where: { deletedAt: null },
            include: {
                stages: { orderBy: { order: 'asc' }, where: { deletedAt: null } },
                _count: { select: { deals: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getPipelineById(id) {
        return db_1.prisma.pipeline.findFirst({
            where: { id, deletedAt: null },
            include: {
                stages: { orderBy: { order: 'asc' }, where: { deletedAt: null } },
                _count: { select: { deals: true } },
            },
        });
    }
    async createPipeline(data) {
        const { stages, ...pipelineData } = data;
        return db_1.prisma.pipeline.create({
            data: {
                ...pipelineData,
                stages: stages?.length ? {
                    create: stages.map((s, i) => ({
                        name: s.name,
                        order: s.order ?? i,
                        probability: s.probability ?? 0,
                        color: s.color ?? '#94a3b8',
                        stageLimit: s.stageLimit,
                        createdBy: pipelineData.createdBy,
                    })),
                } : undefined,
            },
            include: {
                stages: { orderBy: { order: 'asc' } },
            },
        });
    }
    async updatePipeline(id, data) {
        const { stages, ...pipelineData } = data;
        return db_1.prisma.pipeline.update({
            where: { id },
            data: pipelineData,
            include: {
                stages: { orderBy: { order: 'asc' } },
            },
        });
    }
    async deletePipeline(id, deletedBy) {
        return db_1.prisma.pipeline.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    }
    async duplicatePipeline(id, createdBy) {
        const source = await this.getPipelineById(id);
        if (!source)
            throw new Error('Pipeline not found');
        return this.createPipeline({
            name: `${source.name} (Copy)`,
            description: source.description,
            type: source.type,
            color: source.color,
            createdBy,
            stages: source.stages.map((s) => ({
                name: s.name,
                order: s.order,
                probability: s.probability,
                color: s.color,
                stageLimit: s.stageLimit,
            })),
        });
    }
    // ─── KANBAN DATA ────────────────────────────────────────
    async getKanbanData(pipelineId, filters) {
        const where = { deletedAt: null };
        if (pipelineId)
            where.pipelineId = pipelineId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.assignedToId)
            where.assignedToId = filters.assignedToId;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.industry)
            where.industry = filters.industry;
        if (filters?.companyId)
            where.companyId = filters.companyId;
        if (filters?.tags?.length)
            where.tags = { hasSome: filters.tags };
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { dealNumber: { contains: filters.search, mode: 'insensitive' } },
                { company: { name: { contains: filters.search, mode: 'insensitive' } } },
            ];
        }
        if (filters?.valueMin !== undefined) {
            where.value = { ...(where.value || {}), gte: filters.valueMin };
        }
        if (filters?.valueMax !== undefined) {
            where.value = { ...(where.value || {}), lte: filters.valueMax };
        }
        if (filters?.probabilityMin !== undefined) {
            where.probability = { ...(where.probability || {}), gte: filters.probabilityMin };
        }
        if (filters?.probabilityMax !== undefined) {
            where.probability = { ...(where.probability || {}), lte: filters.probabilityMax };
        }
        const deals = await db_1.prisma.deal.findMany({
            where,
            include: dealIncludeKanban,
            orderBy: { createdAt: 'desc' },
        });
        return deals;
    }
    // ─── MOVE STAGE ─────────────────────────────────────────
    async moveStage(dealId, toStageId, movedBy) {
        const deal = await db_1.prisma.deal.findFirst({
            where: { id: dealId, deletedAt: null },
            select: { stageId: true, createdAt: true },
        });
        if (!deal)
            throw new Error('Deal not found');
        const stage = await db_1.prisma.pipelineStage.findUnique({
            where: { id: toStageId },
            select: { probability: true },
        });
        // Calculate days in previous stage
        const lastHistory = await db_1.prisma.dealStageHistory.findFirst({
            where: { dealId },
            orderBy: { createdAt: 'desc' },
        });
        const enteredStageAt = lastHistory?.createdAt || deal.createdAt;
        const durationDays = Math.max(0, Math.floor((Date.now() - new Date(enteredStageAt).getTime()) / 86400000));
        // Create stage history
        await db_1.prisma.dealStageHistory.create({
            data: {
                dealId,
                fromStageId: deal.stageId,
                toStageId,
                durationDays,
                movedBy,
                createdBy: movedBy,
            },
        });
        // Update deal
        return db_1.prisma.deal.update({
            where: { id: dealId },
            data: {
                stageId: toStageId,
                probability: stage?.probability ?? 0,
                updatedBy: movedBy,
            },
            include: dealIncludeKanban,
        });
    }
    // ─── FORECAST ───────────────────────────────────────────
    async getForecastData(pipelineId) {
        const where = { deletedAt: null };
        if (pipelineId)
            where.pipelineId = pipelineId;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        // Get all active deals
        const deals = await db_1.prisma.deal.findMany({
            where: {
                ...where,
                status: { notIn: ['Cancelled', 'Archived'] },
            },
            select: {
                id: true, value: true, expectedRevenue: true, probability: true,
                status: true, expectedCloseDate: true, createdAt: true, actualCloseDate: true,
            },
        });
        const openDeals = deals.filter(d => !['Won', 'Lost', 'Cancelled', 'Archived'].includes(d.status));
        const wonDeals = deals.filter(d => d.status === 'Won');
        const lostDeals = deals.filter(d => d.status === 'Lost');
        const expectedRevenue = openDeals.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0);
        const weightedRevenue = openDeals.reduce((s, d) => s + ((d.expectedRevenue || d.value || 0) * (d.probability / 100)), 0);
        const wonRevenue = wonDeals.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0);
        const lostRevenue = lostDeals.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0);
        const pipelineValue = openDeals.reduce((s, d) => s + (d.value || 0), 0);
        // Monthly breakdown (next 6 months)
        const monthlyForecast = [];
        for (let m = 0; m < 6; m++) {
            const month = (currentMonth + m) % 12;
            const year = currentYear + Math.floor((currentMonth + m) / 12);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
            const label = `${year}-${String(month + 1).padStart(2, '0')}`;
            const monthDeals = openDeals.filter(d => d.expectedCloseDate && new Date(d.expectedCloseDate) >= monthStart && new Date(d.expectedCloseDate) <= monthEnd);
            const monthWon = wonDeals.filter(d => d.actualCloseDate && new Date(d.actualCloseDate) >= monthStart && new Date(d.actualCloseDate) <= monthEnd);
            monthlyForecast.push({
                label,
                expected: monthDeals.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0),
                weighted: monthDeals.reduce((s, d) => s + ((d.expectedRevenue || d.value || 0) * (d.probability / 100)), 0),
                won: monthWon.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0),
                count: monthDeals.length,
            });
        }
        // Quarterly breakdown
        const quarterlyForecast = [];
        for (let q = 0; q < 4; q++) {
            const qStart = new Date(currentYear, q * 3, 1);
            const qEnd = new Date(currentYear, (q + 1) * 3, 0, 23, 59, 59, 999);
            const label = `${currentYear}-Q${q + 1}`;
            const qDeals = openDeals.filter(d => d.expectedCloseDate && new Date(d.expectedCloseDate) >= qStart && new Date(d.expectedCloseDate) <= qEnd);
            const qWon = wonDeals.filter(d => d.actualCloseDate && new Date(d.actualCloseDate) >= qStart && new Date(d.actualCloseDate) <= qEnd);
            quarterlyForecast.push({
                label,
                expected: qDeals.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0),
                weighted: qDeals.reduce((s, d) => s + ((d.expectedRevenue || d.value || 0) * (d.probability / 100)), 0),
                won: qWon.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0),
                count: qDeals.length,
            });
        }
        // Averages
        const closedDeals = [...wonDeals, ...lostDeals];
        const avgDealSize = closedDeals.length > 0
            ? closedDeals.reduce((s, d) => s + (d.value || 0), 0) / closedDeals.length
            : 0;
        const winRate = closedDeals.length > 0 ? (wonDeals.length / closedDeals.length) * 100 : 0;
        const lossRate = closedDeals.length > 0 ? (lostDeals.length / closedDeals.length) * 100 : 0;
        // Sales cycle (Won deals only)
        let avgSalesCycle = 0;
        if (wonDeals.length > 0) {
            const totalDays = wonDeals.reduce((s, d) => {
                const created = new Date(d.createdAt);
                const closed = d.actualCloseDate ? new Date(d.actualCloseDate) : new Date();
                return s + Math.max(1, Math.floor((closed.getTime() - created.getTime()) / 86400000));
            }, 0);
            avgSalesCycle = Math.round(totalDays / wonDeals.length);
        }
        return {
            expectedRevenue,
            weightedRevenue,
            wonRevenue,
            lostRevenue,
            pipelineValue,
            avgDealSize,
            avgSalesCycle,
            winRate,
            lossRate,
            closeRate: winRate,
            totalDeals: deals.length,
            openCount: openDeals.length,
            wonCount: wonDeals.length,
            lostCount: lostDeals.length,
            monthlyForecast,
            quarterlyForecast,
        };
    }
    // ─── ANALYTICS ──────────────────────────────────────────
    async getAnalyticsData(pipelineId) {
        const where = { deletedAt: null };
        if (pipelineId)
            where.pipelineId = pipelineId;
        const deals = await db_1.prisma.deal.findMany({
            where,
            include: {
                stage: { select: { name: true, order: true } },
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                pipeline: { select: { name: true } },
            },
        });
        // Pipeline Distribution (by stage)
        const stageMap = new Map();
        deals.forEach(d => {
            const key = d.stage?.name || 'Unknown';
            const cur = stageMap.get(key) || { count: 0, value: 0 };
            stageMap.set(key, { count: cur.count + 1, value: cur.value + (d.value || 0) });
        });
        const pipelineDistribution = Array.from(stageMap.entries()).map(([name, data]) => ({
            name, ...data,
        }));
        // Won vs Lost
        const wonCount = deals.filter(d => d.status === 'Won').length;
        const lostCount = deals.filter(d => d.status === 'Lost').length;
        const openCount = deals.filter(d => !['Won', 'Lost', 'Cancelled', 'Archived'].includes(d.status)).length;
        const wonVsLost = [
            { name: 'Won', value: wonCount },
            { name: 'Lost', value: lostCount },
            { name: 'Open', value: openCount },
        ];
        // Owner Performance
        const ownerMap = new Map();
        deals.forEach(d => {
            if (!d.assignedTo)
                return;
            const key = d.assignedTo.id;
            const name = `${d.assignedTo.firstName} ${d.assignedTo.lastName}`;
            const cur = ownerMap.get(key) || { name, deals: 0, value: 0, won: 0 };
            cur.deals++;
            cur.value += d.value || 0;
            if (d.status === 'Won')
                cur.won++;
            ownerMap.set(key, cur);
        });
        const ownerPerformance = Array.from(ownerMap.values())
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
        // Industry Distribution
        const industryMap = new Map();
        deals.forEach(d => {
            const key = d.industry || 'Other';
            industryMap.set(key, (industryMap.get(key) || 0) + 1);
        });
        const industryDistribution = Array.from(industryMap.entries()).map(([name, value]) => ({ name, value }));
        // Monthly Performance (last 12 months)
        const monthlyPerformance = [];
        const now = new Date();
        for (let m = 11; m >= 0; m--) {
            const date = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
            const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            const monthDeals = deals.filter(d => {
                const cd = new Date(d.createdAt);
                return cd >= date && cd <= monthEnd;
            });
            const monthWon = deals.filter(d => {
                if (d.status !== 'Won')
                    return false;
                const cd = d.actualCloseDate ? new Date(d.actualCloseDate) : new Date(d.updatedAt);
                return cd >= date && cd <= monthEnd;
            });
            monthlyPerformance.push({
                label,
                created: monthDeals.length,
                won: monthWon.length,
                revenue: monthWon.reduce((s, d) => s + (d.value || 0), 0),
            });
        }
        // Stage Conversion
        const stageConversion = pipelineDistribution.map(s => ({
            name: s.name,
            count: s.count,
            rate: deals.length > 0 ? Math.round((s.count / deals.length) * 100) : 0,
        }));
        return {
            pipelineDistribution,
            wonVsLost,
            ownerPerformance,
            industryDistribution,
            monthlyPerformance,
            stageConversion,
        };
    }
    // ─── KPIs ──────────────────────────────────────────────
    async getKPIs(pipelineId) {
        const where = { deletedAt: null };
        if (pipelineId)
            where.pipelineId = pipelineId;
        const deals = await db_1.prisma.deal.findMany({
            where,
            select: {
                value: true, expectedRevenue: true, probability: true,
                status: true, createdAt: true, actualCloseDate: true, expectedCloseDate: true,
            },
        });
        const open = deals.filter(d => !['Won', 'Lost', 'Cancelled', 'Archived'].includes(d.status));
        const won = deals.filter(d => d.status === 'Won');
        const lost = deals.filter(d => d.status === 'Lost');
        const closed = [...won, ...lost];
        const pipelineValue = open.reduce((s, d) => s + (d.value || 0), 0);
        const expectedRevenue = open.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0);
        const weightedRevenue = open.reduce((s, d) => s + ((d.expectedRevenue || d.value || 0) * (d.probability / 100)), 0);
        const wonRevenue = won.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0);
        const lostRevenue = lost.reduce((s, d) => s + (d.expectedRevenue || d.value || 0), 0);
        const avgDealSize = closed.length > 0 ? closed.reduce((s, d) => s + (d.value || 0), 0) / closed.length : 0;
        const avgProbability = open.length > 0 ? open.reduce((s, d) => s + (d.probability || 0), 0) / open.length : 0;
        let avgSalesCycle = 0;
        if (won.length > 0) {
            avgSalesCycle = Math.round(won.reduce((s, d) => {
                const start = new Date(d.createdAt);
                const end = d.actualCloseDate ? new Date(d.actualCloseDate) : new Date();
                return s + Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86400000));
            }, 0) / won.length);
        }
        return {
            openDeals: open.length,
            pipelineValue,
            expectedRevenue,
            weightedRevenue,
            wonRevenue,
            lostRevenue,
            avgDealSize,
            avgProbability: Math.round(avgProbability),
            avgSalesCycle,
            winRate: closed.length > 0 ? Math.round((won.length / closed.length) * 100) : 0,
            totalDeals: deals.length,
            wonCount: won.length,
            lostCount: lost.length,
        };
    }
    // ─── FUNNEL ─────────────────────────────────────────────
    async getFunnelData(pipelineId) {
        const where = { deletedAt: null };
        if (pipelineId)
            where.pipelineId = pipelineId;
        const stages = pipelineId
            ? await db_1.prisma.pipelineStage.findMany({
                where: { pipelineId, deletedAt: null },
                orderBy: { order: 'asc' },
            })
            : [];
        const deals = await db_1.prisma.deal.findMany({
            where,
            select: { stageId: true, value: true, status: true },
        });
        const totalDeals = deals.length;
        const funnelStages = stages.length > 0
            ? stages.map((s, i) => {
                const stageDeals = deals.filter(d => d.stageId === s.id);
                const count = stageDeals.length;
                const revenue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                const prevCount = i === 0 ? totalDeals : stages.slice(0, i).reduce((sum, ps) => {
                    return sum + deals.filter(d => d.stageId === ps.id).length;
                }, 0);
                return {
                    name: s.name,
                    count,
                    revenue,
                    conversion: totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0,
                    dropOff: i > 0 && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0,
                };
            })
            : [
                { name: 'New', status: 'Open' },
                { name: 'Qualified', status: 'Qualified' },
                { name: 'Proposal', status: 'Proposal Sent' },
                { name: 'Negotiation', status: 'Negotiation' },
                { name: 'Won', status: 'Won' },
                { name: 'Lost', status: 'Lost' },
            ].map((s, i, arr) => {
                const stageDeals = deals.filter(d => d.status === s.status);
                const count = stageDeals.length;
                const revenue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
                const prevCount = i === 0 ? totalDeals : deals.filter(d => d.status === arr[i - 1].status).length;
                return {
                    name: s.name,
                    count,
                    revenue,
                    conversion: totalDeals > 0 ? Math.round((count / totalDeals) * 100) : 0,
                    dropOff: i > 0 && prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0,
                };
            });
        return { stages: funnelStages, totalDeals };
    }
    // ─── AGING ──────────────────────────────────────────────
    async getAgingData(pipelineId) {
        const where = {
            deletedAt: null,
            status: { notIn: ['Won', 'Lost', 'Cancelled', 'Archived'] },
        };
        if (pipelineId)
            where.pipelineId = pipelineId;
        const deals = await db_1.prisma.deal.findMany({
            where,
            include: {
                stage: { select: { name: true } },
                assignedTo: { select: { firstName: true, lastName: true } },
                company: { select: { name: true } },
            },
        });
        const now = Date.now();
        const agingDeals = deals.map(d => {
            const daysInStage = Math.floor((now - new Date(d.updatedAt).getTime()) / 86400000);
            const daysSinceCreated = Math.floor((now - new Date(d.createdAt).getTime()) / 86400000);
            const daysUntilClose = d.expectedCloseDate
                ? Math.floor((new Date(d.expectedCloseDate).getTime() - now) / 86400000)
                : null;
            return {
                id: d.id,
                name: d.name,
                dealNumber: d.dealNumber,
                stage: d.stage?.name || 'Unknown',
                owner: d.assignedTo ? `${d.assignedTo.firstName} ${d.assignedTo.lastName}` : 'Unassigned',
                company: d.company?.name || '-',
                value: d.value,
                probability: d.probability,
                daysInStage,
                daysSinceCreated,
                daysUntilClose,
                isOverdue: daysUntilClose !== null && daysUntilClose < 0,
                isAtRisk: daysInStage > 30 || (daysUntilClose !== null && daysUntilClose < 7 && daysUntilClose >= 0),
                isStalled: daysInStage > 14,
            };
        });
        const overdue = agingDeals.filter(d => d.isOverdue);
        const atRisk = agingDeals.filter(d => d.isAtRisk);
        const stalled = agingDeals.filter(d => d.isStalled);
        const avgStageAge = agingDeals.length > 0
            ? Math.round(agingDeals.reduce((s, d) => s + d.daysInStage, 0) / agingDeals.length)
            : 0;
        return {
            deals: agingDeals.sort((a, b) => b.daysInStage - a.daysInStage).slice(0, 50),
            overdue: overdue.length,
            atRisk: atRisk.length,
            stalled: stalled.length,
            avgStageAge,
            totalActive: agingDeals.length,
        };
    }
    // ─── PIPELINE HEALTH ───────────────────────────────────
    async getPipelineHealth(pipelineId) {
        const aging = await this.getAgingData(pipelineId);
        const kpis = await this.getKPIs(pipelineId);
        // Overall health score (0-100)
        let healthScore = 100;
        if (aging.stalled > 0)
            healthScore -= Math.min(25, aging.stalled * 5);
        if (aging.overdue > 0)
            healthScore -= Math.min(25, aging.overdue * 8);
        if (aging.atRisk > 0)
            healthScore -= Math.min(15, aging.atRisk * 3);
        if (kpis.winRate < 20)
            healthScore -= 15;
        if (kpis.avgSalesCycle > 90)
            healthScore -= 10;
        healthScore = Math.max(0, healthScore);
        let healthLabel = 'Excellent';
        if (healthScore < 30)
            healthLabel = 'Critical';
        else if (healthScore < 50)
            healthLabel = 'Poor';
        else if (healthScore < 70)
            healthLabel = 'Fair';
        else if (healthScore < 85)
            healthLabel = 'Good';
        return {
            score: healthScore,
            label: healthLabel,
            stageAging: aging.avgStageAge,
            stalledDeals: aging.stalled,
            overdueDe: aging.overdue,
            atRiskDeals: aging.atRisk,
            totalActive: aging.totalActive,
            winRate: kpis.winRate,
            avgCycle: kpis.avgSalesCycle,
            pipelineValue: kpis.pipelineValue,
            topAgingDeals: aging.deals.slice(0, 10),
        };
    }
    // ─── QUOTAS ─────────────────────────────────────────────
    async getQuotas(filters) {
        const where = { deletedAt: null };
        if (filters?.type)
            where.type = filters.type;
        if (filters?.period)
            where.period = filters.period;
        if (filters?.employeeId)
            where.employeeId = filters.employeeId;
        return db_1.prisma.dealQuota.findMany({
            where,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, department: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createQuota(data) {
        return db_1.prisma.dealQuota.create({ data });
    }
    async updateQuota(id, data) {
        return db_1.prisma.dealQuota.update({ where: { id }, data });
    }
    async deleteQuota(id) {
        return db_1.prisma.dealQuota.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    // ─── TEAM PERFORMANCE ──────────────────────────────────
    async getTeamPerformance(pipelineId) {
        const where = { deletedAt: null };
        if (pipelineId)
            where.pipelineId = pipelineId;
        const deals = await db_1.prisma.deal.findMany({
            where,
            select: {
                assignedToId: true,
                assignedTo: { select: { id: true, firstName: true, lastName: true, department: true } },
                value: true, expectedRevenue: true, probability: true,
                status: true, createdAt: true, actualCloseDate: true,
            },
        });
        const performanceMap = new Map();
        deals.forEach(d => {
            if (!d.assignedTo)
                return;
            const key = d.assignedTo.id;
            if (!performanceMap.has(key)) {
                performanceMap.set(key, {
                    id: key,
                    name: `${d.assignedTo.firstName} ${d.assignedTo.lastName}`,
                    department: d.assignedTo.department || '-',
                    totalDeals: 0,
                    wonDeals: 0,
                    lostDeals: 0,
                    totalRevenue: 0,
                    wonRevenue: 0,
                    pipelineValue: 0,
                    totalCycleDays: 0,
                });
            }
            const entry = performanceMap.get(key);
            entry.totalDeals++;
            entry.totalRevenue += d.value || 0;
            if (d.status === 'Won') {
                entry.wonDeals++;
                entry.wonRevenue += d.expectedRevenue || d.value || 0;
                if (d.actualCloseDate) {
                    entry.totalCycleDays += Math.max(1, Math.floor((new Date(d.actualCloseDate).getTime() - new Date(d.createdAt).getTime()) / 86400000));
                }
            }
            if (d.status === 'Lost')
                entry.lostDeals++;
            if (!['Won', 'Lost', 'Cancelled', 'Archived'].includes(d.status)) {
                entry.pipelineValue += d.value || 0;
            }
        });
        const leaderboard = Array.from(performanceMap.values()).map(e => ({
            ...e,
            winRate: (e.wonDeals + e.lostDeals) > 0 ? Math.round((e.wonDeals / (e.wonDeals + e.lostDeals)) * 100) : 0,
            avgDealValue: e.totalDeals > 0 ? Math.round(e.totalRevenue / e.totalDeals) : 0,
            avgSalesCycle: e.wonDeals > 0 ? Math.round(e.totalCycleDays / e.wonDeals) : 0,
        }));
        return {
            leaderboard: leaderboard.sort((a, b) => b.wonRevenue - a.wonRevenue),
            topRevenue: [...leaderboard].sort((a, b) => b.wonRevenue - a.wonRevenue).slice(0, 5),
            topWinRate: [...leaderboard].sort((a, b) => b.winRate - a.winRate).slice(0, 5),
            topDealsClosed: [...leaderboard].sort((a, b) => b.wonDeals - a.wonDeals).slice(0, 5),
            fastestCycle: [...leaderboard].filter(e => e.avgSalesCycle > 0).sort((a, b) => a.avgSalesCycle - b.avgSalesCycle).slice(0, 5),
            topPipeline: [...leaderboard].sort((a, b) => b.pipelineValue - a.pipelineValue).slice(0, 5),
        };
    }
    // ─── SAVED VIEWS ────────────────────────────────────────
    async getSavedViews(employeeId) {
        const where = { deletedAt: null };
        if (employeeId) {
            where.OR = [
                { employeeId },
                { isShared: true },
            ];
        }
        return db_1.prisma.dealPipelineView.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
    }
    async createView(data) {
        return db_1.prisma.dealPipelineView.create({ data });
    }
    async deleteView(id) {
        return db_1.prisma.dealPipelineView.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
exports.DealPipelineRepository = DealPipelineRepository;
exports.dealPipelineRepository = new DealPipelineRepository();
exports.default = exports.dealPipelineRepository;
