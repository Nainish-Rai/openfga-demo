import { fgaClient } from "./openfga.js";
import { connectMongo } from "./db.js";
import Department from "./models/Department.js";
import Person from "./models/Person.js";
import Circular from "./models/Circular.js";
import { map, upsertTuples } from "./services/tupleSync.js";

async function setupDemo() {
  await connectMongo();

  console.log("Setting up RBAC demo data...\n");

  const dept1 = await Department.findByIdAndUpdate(
    "dept1",
    { _id: "dept1", name: "Engineering", parentDeptId: null },
    { upsert: true, new: true }
  );

  const dept2 = await Department.findByIdAndUpdate(
    "dept2",
    { _id: "dept2", name: "Sales", parentDeptId: null },
    { upsert: true, new: true }
  );

  await Person.findByIdAndUpdate(
    "alice",
    {
      _id: "alice",
      userId: "user-alice",
      name: "Alice (Compliance)",
      deptId: "dept1",
    },
    { upsert: true, new: true }
  );

  await Person.findByIdAndUpdate(
    "bob",
    {
      _id: "bob",
      userId: "user-bob",
      name: "Bob (Dept Head)",
      deptId: "dept1",
    },
    { upsert: true, new: true }
  );

  await Person.findByIdAndUpdate(
    "charlie",
    {
      _id: "charlie",
      userId: "user-charlie",
      name: "Charlie (Manager)",
      deptId: "dept1",
    },
    { upsert: true, new: true }
  );

  await Person.findByIdAndUpdate(
    "dave",
    {
      _id: "dave",
      userId: "user-dave",
      name: "Dave (Employee)",
      deptId: "dept1",
      directManagerId: "charlie",
    },
    { upsert: true, new: true }
  );

  await Person.findByIdAndUpdate(
    "eve",
    { _id: "eve", userId: "user-eve", name: "Eve (Employee)", deptId: "dept1" },
    { upsert: true, new: true }
  );

  await Circular.findByIdAndUpdate(
    "circ1",
    {
      _id: "circ1",
      title: "Engineering Policy",
      creatorPersonId: "alice",
      assignedDeptId: "dept1",
    },
    { upsert: true, new: true }
  );

  await Circular.findByIdAndUpdate(
    "circ2",
    {
      _id: "circ2",
      title: "Team Guidelines",
      creatorPersonId: "alice",
      assignedDeptId: "dept1",
    },
    { upsert: true, new: true }
  );

  const writes = [
    map.deptMember({ deptId: "dept1", personId: "alice" }),
    map.deptMember({ deptId: "dept1", personId: "bob" }),
    map.deptMember({ deptId: "dept1", personId: "charlie" }),
    map.deptMember({ deptId: "dept1", personId: "dave" }),
    map.deptMember({ deptId: "dept1", personId: "eve" }),

    map.complianceOfficer({ deptId: "dept1", personId: "alice" }),
    map.deptHead({ deptId: "dept1", personId: "bob" }),
    map.deptManager({ deptId: "dept1", personId: "charlie" }),

    map.directManager({ subordinateId: "dave", managerId: "charlie" }),

    map.circularCreator({ circularId: "circ1", personId: "alice" }),
    map.circularAssignedDept({ circularId: "circ1", deptId: "dept1" }),

    map.circularCreator({ circularId: "circ2", personId: "alice" }),
    map.circularAssignedDept({ circularId: "circ2", deptId: "dept1" }),

    map.circularDirectViewer({ circularId: "circ2", personId: "eve" }),
  ];

  await upsertTuples(writes);

  console.log("Demo data created successfully!\n");
  console.log("Users:");
  console.log("  - Alice (person:alice): Compliance Officer");
  console.log("  - Bob (person:bob): Department Head");
  console.log("  - Charlie (person:charlie): Manager");
  console.log("  - Dave (person:dave): Employee (reports to Charlie)");
  console.log("  - Eve (person:eve): Employee (direct viewer of circ2)\n");

  console.log("Testing permissions...\n");

  const aliceCanCreate = await fgaClient.check({
    user: "person:alice",
    relation: "can_crud_circulars",
    object: "department:dept1",
  });
  console.log(`Alice can CRUD circulars: ${aliceCanCreate.allowed}`);

  const bobCanRead = await fgaClient.check({
    user: "person:bob",
    relation: "can_read",
    object: "circular:circ1",
  });
  console.log(`Bob can read circ1: ${bobCanRead.allowed}`);

  const charlieCanRead = await fgaClient.check({
    user: "person:charlie",
    relation: "can_read",
    object: "circular:circ1",
  });
  console.log(`Charlie can read circ1: ${charlieCanRead.allowed}`);

  const daveCanRead = await fgaClient.check({
    user: "person:dave",
    relation: "can_read",
    object: "circular:circ1",
  });
  console.log(`Dave can read circ1: ${daveCanRead.allowed}`);

  const eveCanReadCirc1 = await fgaClient.check({
    user: "person:eve",
    relation: "can_read",
    object: "circular:circ1",
  });
  console.log(`Eve can read circ1: ${eveCanReadCirc1.allowed}`);

  const eveCanReadCirc2 = await fgaClient.check({
    user: "person:eve",
    relation: "can_read",
    object: "circular:circ2",
  });
  console.log(`Eve can read circ2 (direct): ${eveCanReadCirc2.allowed}`);

  console.log("\n✓ Demo setup complete!");
  process.exit(0);
}

setupDemo().catch(console.error);
