import { fgaClient } from "../openfga.js";
import { connectMongo } from "../db.js";
import DeptPrnMap from "../models/DeptPrnMap.js";
import ReportingMap from "../models/ReportingMap.js";
import CircularClauseMap from "../models/CircularClauseMap.js";
import Prsntaskmap from "../models/Prsntaskmap.js";
import Clausetaskmap from "../models/Clausetaskmap.js";

function parseEntity(str = "") {
  const [type, id] = String(str).split(":");
  return { type, id };
}

async function persistMappings(writes = []) {
  const ops = [];
  for (const t of writes) {
    const { user, relation, object } = t;
    const u = parseEntity(user);
    const o = parseEntity(object);

    // F: DeptPrnMap (B <-> F <-> A)
    if (
      o.type === "department" &&
      u.type === "person" &&
      ["member", "manager", "dept_head", "compliance_officer"].includes(
        relation
      )
    ) {
      ops.push(
        DeptPrnMap.updateOne(
          { deptId: o.id, personId: u.id, role: relation },
          { $setOnInsert: { deptId: o.id, personId: u.id, role: relation } },
          { upsert: true }
        )
      );
      continue;
    }

    // J: ReportingMap (B <-> J)
    if (
      o.type === "person" &&
      u.type === "person" &&
      relation === "direct_manager"
    ) {
      ops.push(
        ReportingMap.updateOne(
          { managerId: u.id, subordinateId: o.id },
          { $setOnInsert: { managerId: u.id, subordinateId: o.id } },
          { upsert: true }
        )
      );
      continue;
    }

    // I: CircularClauseMap (C <-> I <-> E)
    if (
      o.type === "clause" &&
      u.type === "circular" &&
      relation === "parent_circular"
    ) {
      ops.push(
        CircularClauseMap.updateOne(
          { circularId: u.id, clauseId: o.id },
          { $setOnInsert: { circularId: u.id, clauseId: o.id } },
          { upsert: true }
        )
      );
      continue;
    }

    // G: Prsntaskmap (B <-> G <-> D)
    if (
      o.type === "task" &&
      u.type === "person" &&
      ["creator", "assignee"].includes(relation)
    ) {
      ops.push(
        Prsntaskmap.updateOne(
          { taskId: o.id, personId: u.id, role: relation },
          { $setOnInsert: { taskId: o.id, personId: u.id, role: relation } },
          { upsert: true }
        )
      );
      continue;
    }

    // H: Clausetaskmap (E <-> H <-> D)
    if (
      o.type === "task" &&
      u.type === "clause" &&
      relation === "related_clause"
    ) {
      ops.push(
        Clausetaskmap.updateOne(
          { clauseId: u.id, taskId: o.id },
          { $setOnInsert: { clauseId: u.id, taskId: o.id } },
          { upsert: true }
        )
      );
      continue;
    }
  }
  if (ops.length) await Promise.all(ops);
}

export async function upsertTuples(writes) {
  if (!writes.length) return;
  await connectMongo();
  await Promise.all([fgaClient.write({ writes }), persistMappings(writes)]);
}

export const map = {
  deptMember: ({ deptId, personId }) => ({
    user: `person:${personId}`,
    relation: "member",
    object: `department:${deptId}`,
  }),
  deptManager: ({ deptId, personId }) => ({
    user: `person:${personId}`,
    relation: "manager",
    object: `department:${deptId}`,
  }),
  deptHead: ({ deptId, personId }) => ({
    user: `person:${personId}`,
    relation: "dept_head",
    object: `department:${deptId}`,
  }),
  complianceOfficer: ({ deptId, personId }) => ({
    user: `person:${personId}`,
    relation: "compliance_officer",
    object: `department:${deptId}`,
  }),
  parentDept: ({ parentDeptId, deptId }) => ({
    user: `department:${parentDeptId}`,
    relation: "parent_dept",
    object: `department:${deptId}`,
  }),
  directManager: ({ subordinateId, managerId }) => ({
    user: `person:${managerId}`,
    relation: "direct_manager",
    object: `person:${subordinateId}`,
  }),
  circularAssignedDept: ({ circularId, deptId }) => ({
    user: `department:${deptId}`,
    relation: "assigned_dept",
    object: `circular:${circularId}`,
  }),
  circularCreator: ({ circularId, personId }) => ({
    user: `person:${personId}`,
    relation: "creator",
    object: `circular:${circularId}`,
  }),
  circularDirectViewer: ({ circularId, personId }) => ({
    user: `person:${personId}`,
    relation: "direct_viewer",
    object: `circular:${circularId}`,
  }),
  circularParent: ({ parentCircularId, circularId }) => ({
    user: `circular:${parentCircularId}`,
    relation: "parent_circular",
    object: `circular:${circularId}`,
  }),
  clauseParentCircular: ({ circularId, clauseId }) => ({
    user: `circular:${circularId}`,
    relation: "parent_circular",
    object: `clause:${clauseId}`,
  }),
  clauseAssignedDept: ({ clauseId, deptId }) => ({
    user: `department:${deptId}`,
    relation: "assigned_dept",
    object: `clause:${clauseId}`,
  }),
  clauseCreator: ({ clauseId, personId }) => ({
    user: `person:${personId}`,
    relation: "creator",
    object: `clause:${clauseId}`,
  }),
  taskCreator: ({ taskId, personId }) => ({
    user: `person:${personId}`,
    relation: "creator",
    object: `task:${taskId}`,
  }),
  taskAssignee: ({ taskId, personId }) => ({
    user: `person:${personId}`,
    relation: "assignee",
    object: `task:${taskId}`,
  }),
  taskRelatedCircular: ({ taskId, circularId }) => ({
    user: `circular:${circularId}`,
    relation: "related_circular",
    object: `task:${taskId}`,
  }),
  taskRelatedClause: ({ taskId, clauseId }) => ({
    user: `clause:${clauseId}`,
    relation: "related_clause",
    object: `task:${taskId}`,
  }),
};
