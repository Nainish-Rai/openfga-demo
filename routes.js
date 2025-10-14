import express from "express";
import { connectMongo } from "./db.js";
import Department from "./models/Department.js";
import Person from "./models/Person.js";
import Circular from "./models/Circular.js";
import Clause from "./models/Clause.js";
import Task from "./models/Task.js";
import { map, upsertTuples } from "./services/tupleSync.js";

const router = express.Router();

router.post("/department", async (req, res) => {
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

router.post("/person", async (req, res) => {
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

router.post("/circular", async (req, res) => {
  await connectMongo();
  const {
    id,
    title,
    creatorPersonId,
    assignedDeptId,
    parentCircularId,
    viewers,
  } = req.body;
  const doc = await Circular.findByIdAndUpdate(
    id,
    { _id: id, title, creatorPersonId, assignedDeptId, parentCircularId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const writes = [];
  if (creatorPersonId)
    writes.push(
      map.circularCreator({ circularId: id, personId: creatorPersonId })
    );
  if (assignedDeptId)
    writes.push(
      map.circularAssignedDept({ circularId: id, deptId: assignedDeptId })
    );
  if (parentCircularId)
    writes.push(map.circularParent({ parentCircularId, circularId: id }));
  for (const v of viewers || [])
    writes.push(map.circularDirectViewer({ circularId: id, personId: v }));
  await upsertTuples(writes);
  res.status(201).json(doc);
});

router.post("/clause", async (req, res) => {
  await connectMongo();
  const { id, title, creatorPersonId, parentCircularId, assignedDeptId } =
    req.body;
  const doc = await Clause.findByIdAndUpdate(
    id,
    { _id: id, title, creatorPersonId, parentCircularId, assignedDeptId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const writes = [];
  if (creatorPersonId)
    writes.push(map.clauseCreator({ clauseId: id, personId: creatorPersonId }));
  if (parentCircularId)
    writes.push(
      map.clauseParentCircular({ circularId: parentCircularId, clauseId: id })
    );
  if (assignedDeptId)
    writes.push(
      map.clauseAssignedDept({ clauseId: id, deptId: assignedDeptId })
    );
  await upsertTuples(writes);
  res.status(201).json(doc);
});

router.post("/task", async (req, res) => {
  await connectMongo();
  const {
    id,
    title,
    creatorPersonId,
    assigneePersonId,
    relatedCircularId,
    relatedClauseId,
  } = req.body;
  const doc = await Task.findByIdAndUpdate(
    id,
    {
      _id: id,
      title,
      creatorPersonId,
      assigneePersonId,
      relatedCircularId,
      relatedClauseId,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const writes = [];
  if (creatorPersonId)
    writes.push(map.taskCreator({ taskId: id, personId: creatorPersonId }));
  if (assigneePersonId)
    writes.push(map.taskAssignee({ taskId: id, personId: assigneePersonId }));
  if (relatedCircularId)
    writes.push(
      map.taskRelatedCircular({ taskId: id, circularId: relatedCircularId })
    );
  if (relatedClauseId)
    writes.push(
      map.taskRelatedClause({ taskId: id, clauseId: relatedClauseId })
    );
  await upsertTuples(writes);
  res.status(201).json(doc);
});

router.post("/access/check", async (req, res) => {
  const { user, relation, object } = req.body;
  const r = await (
    await import("./openfga.js")
  ).fgaClient.check({ user, relation, object });
  res.json(r);
});

export default router;
