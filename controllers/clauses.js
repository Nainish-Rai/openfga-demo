import express from "express";
import { connectMongo } from "../db.js";
import Clause from "../models/Clause.js";
import { map, upsertTuples } from "../services/tupleSync.js";
import { getUserClauses, checkPermission } from "../services/permissions.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const allowedIds = await getUserClauses(req.user.personId);
  const clauses = await Clause.find({ _id: { $in: allowedIds } });

  return res.status(200).json({ clauses });
});

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id, title, parentCircularId, assignedDeptId } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_update",
    `circular:${parentCircularId}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const existingClause = await Clause.findById(id);
  if (existingClause) {
    return res
      .status(400)
      .json({ error: `Clause with id ${id} already exists` });
  }

  const clause = await Clause.create({
    _id: id,
    title,
    creatorPersonId: req.user.personId,
    parentCircularId,
    assignedDeptId,
  });

  const writes = [
    map.clauseCreator({ clauseId: id, personId: req.user.personId }),
  ];

  if (parentCircularId) {
    writes.push(
      map.clauseParentCircular({ circularId: parentCircularId, clauseId: id })
    );
  }

  if (assignedDeptId) {
    writes.push(
      map.clauseAssignedDept({ clauseId: id, deptId: assignedDeptId })
    );
  }

  await upsertTuples(writes);

  return res.status(201).json({ clause });
});

router.put("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;
  const { title } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_update",
    `clause:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const clause = await Clause.findByIdAndUpdate(id, { title }, { new: true });

  if (!clause) {
    return res.status(404).json({ error: "Clause not found" });
  }

  return res.status(200).json({ clause });
});

router.delete("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_delete",
    `clause:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const clause = await Clause.findByIdAndDelete(id);

  if (!clause) {
    return res.status(404).json({ error: "Clause not found" });
  }

  return res.status(200).json({ message: "Clause deleted successfully" });
});

export default router;
