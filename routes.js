import express from "express";
import { connectMongo } from "./db.js";
import Department from "./models/Department.js";
import Person from "./models/Person.js";
import { map, upsertTuples } from "./services/tupleSync.js";
import { fgaClient } from "./openfga.js";

import circularsRouter from "./controllers/circulars.js";
import clausesRouter from "./controllers/clauses.js";
import tasksRouter from "./controllers/tasks.js";
import sharingRouter from "./controllers/sharing.js";

const router = express.Router();

router.use("/circulars", circularsRouter);
router.use("/clauses", clausesRouter);
router.use("/tasks", tasksRouter);
router.use("/share", sharingRouter);

router.post("/departments", async (req, res) => {
  await connectMongo();
  const { id, name, parentDeptId } = req.body;
  const doc = await Department.findByIdAndUpdate(
    id,
    { _id: id, name, parentDeptId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const writes = [];
  if (parentDeptId) writes.push(map.parentDept({ parentDeptId, deptId: id }));
  await upsertTuples(writes);
  res.status(201).json(doc);
});

router.post("/persons", async (req, res) => {
  await connectMongo();
  const { id, userId, name, deptId, directManagerId, roles } = req.body;
  const doc = await Person.findByIdAndUpdate(
    id,
    { _id: id, userId, name, deptId, directManagerId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const writes = [];
  if (deptId) writes.push(map.deptMember({ deptId, personId: id }));
  if (directManagerId)
    writes.push(
      map.directManager({ subordinateId: id, managerId: directManagerId })
    );
  if (roles?.includes("manager") && deptId)
    writes.push(map.deptManager({ deptId, personId: id }));
  if (roles?.includes("dept_head") && deptId)
    writes.push(map.deptHead({ deptId, personId: id }));
  if (roles?.includes("compliance_officer") && deptId)
    writes.push(map.complianceOfficer({ deptId, personId: id }));
  await upsertTuples(writes);
  res.status(201).json(doc);
});

router.post("/access/check", async (req, res) => {
  const { user, relation, object } = req.body;
  const r = await fgaClient.check({ user, relation, object });
  res.json(r);
});

export default router;
