import express from "express";
import { connectMongo } from "../db.js";
import Circular from "../models/Circular.js";
import { map, upsertTuples } from "../services/tupleSync.js";
import { checkPermission } from "../services/permissions.js";
import { fgaClient } from "../openfga.js";

const router = express.Router();

router.post("/circulars/:id/share", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;
  const { personId } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_share",
    `circular:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const circular = await Circular.findById(id);
  if (!circular) {
    return res.status(404).json({ error: "Circular not found" });
  }

  await upsertTuples([map.circularDirectViewer({ circularId: id, personId })]);

  return res.status(200).json({ message: "Access granted successfully" });
});

router.post("/circulars/:id/assign-subordinate", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;
  const { personId } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_update",
    `circular:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  const circular = await Circular.findById(id);
  if (!circular) {
    return res.status(404).json({ error: "Circular not found" });
  }

  await fgaClient.write({
    writes: [
      {
        user: `person:${personId}`,
        relation: "subordinate_assigned",
        object: `circular:${id}`,
      },
    ],
  });

  return res.status(200).json({ message: "Subordinate assigned successfully" });
});

router.post("/tasks/:id/reassign", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Please login" });

  await connectMongo();

  const { id } = req.params;
  const { personId } = req.body;

  const hasPermission = await checkPermission(
    `person:${req.user.personId}`,
    "can_reassign",
    `task:${id}`
  );

  if (!hasPermission) {
    return res.status(403).json({ error: "Permission denied" });
  }

  await fgaClient.write({
    writes: [
      {
        user: `person:${personId}`,
        relation: "assignee",
        object: `task:${id}`,
      },
    ],
  });

  return res.status(200).json({ message: "Task reassigned successfully" });
});

export default router;
