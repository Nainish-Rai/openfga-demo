import express from "express";
import { connectMongo } from "../db.js";
import Circular from "../models/Circular.js";
import { map, upsertTuples } from "../services/tupleSync.js";
import { getUserCirculars, checkPermission } from "../services/permissions.js";

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const allowedIds = await getUserCirculars(req.user.personId);
  const circulars = await Circular.find({ _id: { $in: allowedIds } });

  return res.status(200).json({ circulars });
});

router.post("/", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id, title, assignedDeptId, parentCircularId } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_create",
    `department:${assignedDeptId}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const existingCircular = await Circular.findById(id);
  if (existingCircular) {
    return res
      .status(400)
      .json({ error: `Circular with id ${id} already exists` });
  }

  const circular = await Circular.create({
    _id: id,
    title,
    creatorPersonId: req.user.personId,
    assignedDeptId,
    parentCircularId,
  });

  const writes = [
    map.circularCreator({ circularId: id, personId: req.user.personId }),
  ];

  if (assignedDeptId) {
    writes.push(
      map.circularAssignedDept({ circularId: id, deptId: assignedDeptId })
    );
  }

  if (parentCircularId) {
    writes.push(map.circularParent({ parentCircularId, circularId: id }));
  }

  await upsertTuples(writes);

  return res.status(201).json({ circular });
});

router.put("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;
  const { title } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_update",
    `circular:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const circular = await Circular.findByIdAndUpdate(
    id,
    { title },
    { new: true }
  );

  if (!circular) {
    return res.status(404).json({ error: "Circular not found" });
  }

  return res.status(200).json({ circular });
});

router.delete("/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_delete",
    `circular:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const circular = await Circular.findByIdAndDelete(id);

  if (!circular) {
    return res.status(404).json({ error: "Circular not found" });
  }

  return res.status(200).json({ message: "Circular deleted successfully" });
});

export default router;
