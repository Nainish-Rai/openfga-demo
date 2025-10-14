import { fgaClient } from "../openfga.js";

export async function upsertTuples(writes) {
  if (!writes.length) return;
  await fgaClient.write({ writes });
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
