import { Router } from "express";
import { db } from "@workspace/db";
import { staffTable } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import {
  ListStaffQueryParams,
  CreateStaffBody,
  GetStaffParams,
  UpdateStaffBody,
  UpdateStaffParams,
  DeleteStaffParams,
  IssueWarningParams,
  IssueWarningBody,
  UpdateStatsParams,
  UpdateStatsBody,
  UpdateStaffStatusParams,
  UpdateStaffStatusBody,
} from "@workspace/api-zod";

const router = Router();

function serializeStaff(member: typeof staffTable.$inferSelect) {
  return {
    ...member,
    suspendedAt: member.suspendedAt ? member.suspendedAt.toISOString() : null,
    terminatedAt: member.terminatedAt ? member.terminatedAt.toISOString() : null,
    createdAt: member.createdAt.toISOString(),
  };
}

// GET /api/staff
router.get("/staff", async (req, res) => {
  const query = ListStaffQueryParams.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }

  let qb = db.select().from(staffTable);
  const conditions = [];

  if (query.data.division) {
    conditions.push(eq(staffTable.division, query.data.division));
  }
  if (query.data.status) {
    conditions.push(eq(staffTable.status, query.data.status));
  }

  const members = await db
    .select()
    .from(staffTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(asc(staffTable.name));

  return res.json(members.map(serializeStaff));
});

// POST /api/staff
router.post("/staff", async (req, res) => {
  const body = CreateStaffBody.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const [created] = await db
    .insert(staffTable)
    .values({
      name: body.data.name,
      rank: body.data.rank,
      division: body.data.division,
      accessLevel: body.data.accessLevel,
      notes: body.data.notes ?? null,
    })
    .returning();

  return res.status(201).json(serializeStaff(created));
});

// GET /api/staff/:id
router.get("/staff/:id", async (req, res) => {
  const params = GetStaffParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [member] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, params.data.id));

  if (!member) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  return res.json(serializeStaff(member));
});

// PATCH /api/staff/:id
router.patch("/staff/:id", async (req, res) => {
  const params = UpdateStaffParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateStaffBody.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const updateData: Partial<typeof staffTable.$inferInsert> = {};
  if (body.data.name !== undefined) updateData.name = body.data.name;
  if (body.data.rank !== undefined) updateData.rank = body.data.rank;
  if (body.data.division !== undefined) updateData.division = body.data.division;
  if (body.data.accessLevel !== undefined) updateData.accessLevel = body.data.accessLevel;
  if (body.data.notes !== undefined) updateData.notes = body.data.notes;

  const [updated] = await db
    .update(staffTable)
    .set(updateData)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  return res.json(serializeStaff(updated));
});

// DELETE /api/staff/:id
router.delete("/staff/:id", async (req, res) => {
  const params = DeleteStaffParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    return res.status(400).json({ error: "Invalid id" });
  }

  const [deleted] = await db
    .delete(staffTable)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  if (!deleted) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  return res.status(204).send();
});

// POST /api/staff/:id/warnings
router.post("/staff/:id/warnings", async (req, res) => {
  const params = IssueWarningParams.safeParse({ id: Number(req.params.id) });
  const body = IssueWarningBody.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const [current] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, params.data.id));

  if (!current) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  const updateData: Partial<typeof staffTable.$inferInsert> = {};

  if (body.data.type === "written") {
    updateData.writtenWarnings = Math.min(current.writtenWarnings + 1, 3);
  } else if (body.data.type === "activityStrike") {
    const newCount = Math.min(current.activityStrikes + 1, 3);
    updateData.activityStrikes = newCount;
    if (newCount >= 3 && current.status === "Active") {
      updateData.status = "Suspended";
      updateData.suspendedAt = new Date();
    }
  } else if (body.data.type === "finalStrike") {
    const newCount = Math.min(current.finalStrikes + 1, 3);
    updateData.finalStrikes = newCount;
    if (newCount >= 3) {
      updateData.status = "Terminated";
      updateData.terminatedAt = new Date();
    }
  }

  const [updated] = await db
    .update(staffTable)
    .set(updateData)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  return res.json(serializeStaff(updated));
});

// POST /api/staff/:id/warnings/remove
router.post("/staff/:id/warnings/remove", async (req, res) => {
  const params = IssueWarningParams.safeParse({ id: Number(req.params.id) });
  const body = IssueWarningBody.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const [current] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, params.data.id));

  if (!current) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  const updateData: Partial<typeof staffTable.$inferInsert> = {};

  if (body.data.type === "written") {
    updateData.writtenWarnings = Math.max(current.writtenWarnings - 1, 0);
  } else if (body.data.type === "activityStrike") {
    updateData.activityStrikes = Math.max(current.activityStrikes - 1, 0);
  } else if (body.data.type === "finalStrike") {
    updateData.finalStrikes = Math.max(current.finalStrikes - 1, 0);
  }

  const [updated] = await db
    .update(staffTable)
    .set(updateData)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  return res.json(serializeStaff(updated));
});

// PATCH /api/staff/:id/stats
router.patch("/staff/:id/stats", async (req, res) => {
  const params = UpdateStatsParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateStatsBody.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const [current] = await db
    .select()
    .from(staffTable)
    .where(eq(staffTable.id, params.data.id));

  if (!current) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  const period = body.data.period ?? "weekly";
  const updateData: Partial<typeof staffTable.$inferInsert> = {};

  if (period === "weekly") {
    if (body.data.voiceHours !== undefined) updateData.weeklyVoiceHours = body.data.voiceHours;
    if (body.data.messages !== undefined) updateData.weeklyMessages = body.data.messages;
    if (body.data.eventsHosted !== undefined) updateData.weeklyEventsHosted = body.data.eventsHosted;
    if (body.data.miniEventsHosted !== undefined) updateData.weeklyMiniEventsHosted = body.data.miniEventsHosted;
  } else {
    if (body.data.voiceHours !== undefined) updateData.monthlyVoiceHours = body.data.voiceHours;
    if (body.data.messages !== undefined) updateData.monthlyMessages = body.data.messages;
    if (body.data.eventsHosted !== undefined) updateData.monthlyEventsHosted = body.data.eventsHosted;
    if (body.data.miniEventsHosted !== undefined) updateData.monthlyMiniEventsHosted = body.data.miniEventsHosted;
  }

  const [updated] = await db
    .update(staffTable)
    .set(updateData)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  return res.json(serializeStaff(updated));
});

// PATCH /api/staff/:id/status
router.patch("/staff/:id/status", async (req, res) => {
  const params = UpdateStaffStatusParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateStaffStatusBody.safeParse(req.body);

  if (!params.success || !body.success) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const updateData: Partial<typeof staffTable.$inferInsert> = {
    status: body.data.status,
  };

  if (body.data.status === "Suspended") {
    updateData.suspendedAt = new Date();
  } else if (body.data.status === "Terminated") {
    updateData.terminatedAt = new Date();
  }

  const [updated] = await db
    .update(staffTable)
    .set(updateData)
    .where(eq(staffTable.id, params.data.id))
    .returning();

  if (!updated) {
    return res.status(404).json({ error: "Staff member not found" });
  }

  return res.json(serializeStaff(updated));
});

// GET /api/dashboard/summary
router.get("/dashboard/summary", async (_req, res) => {
  const allStaff = await db.select().from(staffTable);

  const active = allStaff.filter((s) => s.status === "Active");
  const loa = allStaff.filter((s) => s.status === "LOA");
  const suspended = allStaff.filter((s) => s.status === "Suspended");
  const terminated = allStaff.filter((s) => s.status === "Terminated");

  const eventDiv = allStaff.filter((s) => s.division === "Event");
  const trainingDiv = allStaff.filter((s) => s.division === "Training");

  const totalWritten = allStaff.reduce((sum, s) => sum + s.writtenWarnings, 0);
  const totalActivity = allStaff.reduce((sum, s) => sum + s.activityStrikes, 0);
  const totalFinal = allStaff.reduce((sum, s) => sum + s.finalStrikes, 0);

  const topByVoice = [...allStaff]
    .sort((a, b) => b.weeklyVoiceHours - a.weeklyVoiceHours)
    .slice(0, 3)
    .map(serializeStaff);

  const topByEvents = [...allStaff]
    .sort((a, b) => (b.weeklyEventsHosted + b.weeklyMiniEventsHosted) - (a.weeklyEventsHosted + a.weeklyMiniEventsHosted))
    .slice(0, 3)
    .map(serializeStaff);

  return res.json({
    totalStaff: allStaff.length,
    activeStaff: active.length,
    loaStaff: loa.length,
    suspendedStaff: suspended.length,
    terminatedStaff: terminated.length,
    eventDivisionCount: eventDiv.length,
    trainingDivisionCount: trainingDiv.length,
    totalWrittenWarnings: totalWritten,
    totalActivityStrikes: totalActivity,
    totalFinalStrikes: totalFinal,
    topPerformersByVoiceHours: topByVoice,
    topPerformersByEvents: topByEvents,
  });
});

export default router;
