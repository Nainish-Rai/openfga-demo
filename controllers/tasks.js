import express from "express";
import { connectMongo } from "../db.js";
import Task from "../models/Task.js";
import { map, upsertTuples } from "../services/tupleSync.js";
import { getUserTasks, checkPermission } from "../services/permissions.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const allowedIds = await getUserTasks(req.user.personId);
  const tasks = await Task.find({ _id: { $in: allowedIds } });

  return res.status(200).json({ tasks });
});

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id, title, assigneePersonId, relatedCircularId, relatedClauseId } =
    req.body;

  if (relatedCircularId) {
    const hasPermission = await checkPermission(
      `person:${req.user.personId}`,
      "can_update",
      `circular:${relatedCircularId}`
    );

    if (!hasPermission) {
      return res.status(403).json({ error: "Permission denied" });
    }
  }

  const existingTask = await Task.findById(id);
  if (existingTask) {
    return res.status(400).json({ error: `Task with id ${id} already exists` });
  }

  const task = await Task.create({
    _id: id,
    title,
    creatorPersonId: req.user.personId,
    assigneePersonId,
    relatedCircularId,
    relatedClauseId,
  });

  const writes = [map.taskCreator({ taskId: id, personId: req.user.personId })];

  if (assigneePersonId) {
    writes.push(map.taskAssignee({ taskId: id, personId: assigneePersonId }));
  }

  if (relatedCircularId) {
    writes.push(
      map.taskRelatedCircular({ taskId: id, circularId: relatedCircularId })
    );
  }

  if (relatedClauseId) {
    writes.push(
      map.taskRelatedClause({ taskId: id, clauseId: relatedClauseId })
    );
  }

  await upsertTuples(writes);

  return res.status(201).json({ task });
});

router.put("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;
  const { title } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_update",
    `task:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const task = await Task.findByIdAndUpdate(id, { title }, { new: true });

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.status(200).json({ task });
});

router.patch("/:id/complete", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_complete",
    `task:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const task = await Task.findByIdAndUpdate(
    id,
    { status: "completed", completedAt: new Date() },
    { new: true }
  );

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.status(200).json({ task });
});

router.delete("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_delete",
    `task:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  return res.status(200).json({ message: "Task deleted successfully" });
});

export default router;
