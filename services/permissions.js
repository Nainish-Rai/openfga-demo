import { fgaClient } from "../openfga.js";

export async function checkPermission(user, relation, object) {
  const result = await fgaClient.check({ user, relation, object });
  return result.allowed;
}

export async function listUserObjects(user, relation, type) {
  const result = await fgaClient.listObjects({ user, relation, type });
  return result.objects.map((obj) => obj.split(":")[1]);
}

export async function listUserRelations(user, object, relations) {
  const result = await fgaClient.listRelations({ user, object, relations });
  return result.relations;
}

export async function getUserCirculars(personId) {
  return await listUserObjects(`person:${personId}`, "can_read", "circular");
}

export async function getUserClauses(personId) {
  return await listUserObjects(`person:${personId}`, "can_read", "clause");
}

export async function getUserTasks(personId) {
  return await listUserObjects(`person:${personId}`, "can_read", "task");
}

export async function canManageCircular(personId, circularId) {
  return await checkPermission(
    `person:${personId}`,
    "can_update",
    `circular:${circularId}`
  );
}

export async function canDeleteCircular(personId, circularId) {
  return await checkPermission(
    `person:${personId}`,
    "can_delete",
    `circular:${circularId}`
  );
}

export async function isComplianceOfficer(personId, deptId) {
  return await checkPermission(
    `person:${personId}`,
    "can_crud_circulars",
    `department:${deptId}`
  );
}

export async function isDeptHead(personId, deptId) {
  return await checkPermission(
    `person:${personId}`,
    "can_read_dept_circulars",
    `department:${deptId}`
  );
}
