import dotenv from "dotenv";
import { connectMongo, disconnectMongo } from "../db.js";
import Department from "../models/Department.js";
import Person from "../models/Person.js";
import ReportingMap from "../models/ReportingMap.js";
import DeptPrnMap from "../models/DeptPrnMap.js";
import Circular from "../models/Circular.js";
import Clause from "../models/Clause.js";
import Task from "../models/Task.js";

dotenv.config();

// Helpers
const upsertById = (Model, _id, doc) =>
  Model.findByIdAndUpdate(_id, { _id, ...doc }, { upsert: true, new: true });

const upsertUnique = (Model, filter, doc) =>
  Model.updateOne(filter, { $setOnInsert: doc }, { upsert: true });

// Very small slug util to create deterministic IDs
const slug = (s) =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function seed() {
  const reset = process.env.SEED_RESET === "1";

  await connectMongo();

  if (reset) {
    console.log("Clearing existing data (SEED_RESET=1)...");
    await Promise.all([
      Department.deleteMany({}),
      Person.deleteMany({}),
      ReportingMap.deleteMany({}),
      DeptPrnMap.deleteMany({}),
      Circular.deleteMany({}),
      Clause.deleteMany({}),
      Task.deleteMany({}),
    ]);
  }

  console.log("Seeding departments...");
  const departments = [
    { _id: "COM", name: "Compliance" },
    { _id: "FIN", name: "Finance" },
    { _id: "RISK", name: "Risk" },
    { _id: "LEGAL", name: "Legal" },
    { _id: "ENG", name: "Engineering" },
    { _id: "OPS", name: "Operations" },
    { _id: "SALES", name: "Sales" },
  ];

  await Promise.all(departments.map((d) => upsertById(Department, d._id, d)));

  // Optional parent relationships (for org tree style UIs)
  await Promise.all([
    upsertById(Department, "RISK", { parentDeptId: "COM", name: "Risk" }),
    upsertById(Department, "LEGAL", { parentDeptId: "COM", name: "Legal" }),
    upsertById(Department, "OPS", { parentDeptId: "ENG", name: "Operations" }),
  ]);

  console.log("Seeding people (Indian names incl. screenshot members)...");
  const people = [
    // From screenshot / team
    { _id: "priyesh", userId: "u-priyesh", name: "Priyesh", deptId: "COM" },
    {
      _id: "avantika-sharma",
      userId: "u-avantika",
      name: "Avantika Sharma",
      deptId: "COM",
    },
    {
      _id: "krishnatejaswi-s",
      userId: "u-krishnatejaswi",
      name: "Krishnatejaswi S",
      deptId: "COM",
    },
    {
      _id: "akshat-bhatia",
      userId: "u-akshat",
      name: "Akshat Bhatia",
      deptId: "ENG",
    },
    { _id: "anuj", userId: "u-anuj", name: "Anuj", deptId: "RISK" },
    { _id: "abhinav", userId: "u-abhinav", name: "Abhinav", deptId: "RISK" },
    {
      _id: "ayush-ratan",
      userId: "u-ayush",
      name: "Ayush Ratan",
      deptId: "RISK",
    },
    {
      _id: "bhoomika-masoor",
      userId: "u-bhoomika",
      name: "Bhoomika Masoor",
      deptId: "COM",
    },
    {
      _id: "nainish-rai",
      userId: "u-nainish",
      name: "Nainish Rai",
      deptId: "ENG",
    },

    // Additional realistic Indian context
    {
      _id: "rahul-verma",
      userId: "u-rahul",
      name: "Rahul Verma",
      deptId: "ENG",
    },
    { _id: "neha-gupta", userId: "u-neha", name: "Neha Gupta", deptId: "ENG" },
    {
      _id: "vikram-mehta",
      userId: "u-vikram",
      name: "Vikram Mehta",
      deptId: "FIN",
    },
    {
      _id: "meera-kulkarni",
      userId: "u-meera",
      name: "Meera Kulkarni",
      deptId: "FIN",
    },
    {
      _id: "pooja-patel",
      userId: "u-pooja",
      name: "Pooja Patel",
      deptId: "FIN",
    },
    {
      _id: "rohit-sharma",
      userId: "u-rohit",
      name: "Rohit Sharma",
      deptId: "OPS",
    },
    { _id: "arjun-nair", userId: "u-arjun", name: "Arjun Nair", deptId: "ENG" },
    {
      _id: "meera-iyer",
      userId: "u-meera-iyer",
      name: "Meera Iyer",
      deptId: "LEGAL",
    },
  ];

  await Promise.all(people.map((p) => upsertById(Person, p._id, p)));

  console.log("Seeding reporting lines (manager -> subordinate)...");
  const managers = {
    // Compliance
    priyesh: ["avantika-sharma", "bhoomika-masoor"],
    "avantika-sharma": ["krishnatejaswi-s"],
    // Risk
    abhinav: ["anuj", "ayush-ratan"],
    anuj: [],
    // Engineering
    "rahul-verma": ["neha-gupta", "akshat-bhatia", "arjun-nair", "nainish-rai"],
    "neha-gupta": [],
    // Finance
    "vikram-mehta": ["meera-kulkarni", "pooja-patel"],
  };

  const reportingOps = [];
  for (const [managerId, subs] of Object.entries(managers)) {
    for (const subordinateId of subs) {
      reportingOps.push(
        upsertUnique(
          ReportingMap,
          { managerId, subordinateId },
          { managerId, subordinateId }
        )
      );
    }
  }
  await Promise.all(reportingOps);

  console.log("Seeding department-role memberships...");
  const roleMaps = [
    // Compliance
    ["COM", "priyesh", "compliance_officer"],
    ["COM", "priyesh", "dept_head"],
    ["COM", "avantika-sharma", "manager"],
    ["COM", "krishnatejaswi-s", "member"],
    ["COM", "bhoomika-masoor", "member"],
    // Risk
    ["RISK", "abhinav", "dept_head"],
    ["RISK", "anuj", "manager"],
    ["RISK", "ayush-ratan", "member"],
    // Engineering
    ["ENG", "rahul-verma", "dept_head"],
    ["ENG", "neha-gupta", "manager"],
    ["ENG", "akshat-bhatia", "member"],
    ["ENG", "arjun-nair", "member"],
    ["ENG", "nainish-rai", "member"],
    // Finance
    ["FIN", "vikram-mehta", "dept_head"],
    ["FIN", "meera-kulkarni", "manager"],
    ["FIN", "pooja-patel", "member"],
    // Legal / Ops / Sales examples
    ["LEGAL", "meera-iyer", "dept_head"],
    ["OPS", "rohit-sharma", "manager"],
  ];

  await Promise.all(
    roleMaps.map(([deptId, personId, role]) =>
      upsertUnique(
        DeptPrnMap,
        { deptId, personId, role },
        { deptId, personId, role }
      )
    )
  );

  console.log("Seeding circulars and clauses (RBI/SEBI/DPDP context)...");
  // Circulars
  const circulars = [
    {
      _id: "rbi-kyc-2024",
      title: "RBI KYC Master Direction 2024 Update",
      creatorPersonId: "priyesh",
      assignedDeptId: "COM",
    },
    {
      _id: "sebi-insider-trading",
      title: "SEBI Insider Trading Prevention Guidelines",
      creatorPersonId: "priyesh",
      assignedDeptId: "RISK",
    },
    {
      _id: "dpdp-data-privacy",
      title: "Data Privacy Policy - DPDP Act 2023",
      creatorPersonId: "priyesh",
      assignedDeptId: "ENG",
    },
  ];

  await Promise.all(circulars.map((c) => upsertById(Circular, c._id, c)));

  // Clauses under each circular
  const clauses = [
    // RBI KYC
    {
      _id: "kyc-onboarding-48h",
      title: "Complete KYC verification within 48 hours of onboarding",
      creatorPersonId: "priyesh",
      parentCircularId: "rbi-kyc-2024",
      assignedDeptId: "COM",
    },
    {
      _id: "kyc-periodic-refresh",
      title: "Periodic KYC refresh every 24 months (Low/Medium Risk)",
      creatorPersonId: "avantika-sharma",
      parentCircularId: "rbi-kyc-2024",
      assignedDeptId: "RISK",
    },
    // SEBI
    {
      _id: "insider-window-closure",
      title: "Trading window closure during financial results preparation",
      creatorPersonId: "priyesh",
      parentCircularId: "sebi-insider-trading",
      assignedDeptId: "LEGAL",
    },
    {
      _id: "preclearance-threshold",
      title: "Pre-clearance requirement for trades above INR 10 lakhs",
      creatorPersonId: "abhinav",
      parentCircularId: "sebi-insider-trading",
      assignedDeptId: "RISK",
    },
    // DPDP
    {
      _id: "pii-encryption",
      title: "Encrypt PII at rest using AES-256; rotate keys every 180 days",
      creatorPersonId: "priyesh",
      parentCircularId: "dpdp-data-privacy",
      assignedDeptId: "ENG",
    },
    {
      _id: "data-retention-180d",
      title: "Retain access logs for 180 days; enable audit exports",
      creatorPersonId: "neha-gupta",
      parentCircularId: "dpdp-data-privacy",
      assignedDeptId: "OPS",
    },
  ];

  await Promise.all(clauses.map((cl) => upsertById(Clause, cl._id, cl)));

  console.log("Seeding tasks linked to clauses/circulars...");
  const tasks = [
    {
      _id: "task-kyc-checklist",
      title: "Build automated KYC checklist in onboarding flow",
      creatorPersonId: "priyesh",
      assigneePersonId: "nainish-rai",
      relatedCircularId: "rbi-kyc-2024",
      relatedClauseId: "kyc-onboarding-48h",
    },
    {
      _id: "task-kyc-refresh-cron",
      title: "Implement periodic KYC refresh reminders (24 months)",
      creatorPersonId: "avantika-sharma",
      assigneePersonId: "ayush-ratan",
      relatedCircularId: "rbi-kyc-2024",
      relatedClauseId: "kyc-periodic-refresh",
    },
    {
      _id: "task-insider-window",
      title: "Add insider trading window calendar & notifications",
      creatorPersonId: "abhinav",
      assigneePersonId: "meera-iyer",
      relatedCircularId: "sebi-insider-trading",
      relatedClauseId: "insider-window-closure",
    },
    {
      _id: "task-dpdp-encryption",
      title: "Encrypt user PII at rest with key rotation",
      creatorPersonId: "rahul-verma",
      assigneePersonId: "akshat-bhatia",
      relatedCircularId: "dpdp-data-privacy",
      relatedClauseId: "pii-encryption",
    },
    {
      _id: "task-log-retention",
      title: "Centralize access logs; 180-day retention and export",
      creatorPersonId: "neha-gupta",
      assigneePersonId: "rohit-sharma",
      relatedCircularId: "dpdp-data-privacy",
      relatedClauseId: "data-retention-180d",
    },
  ];

  await Promise.all(tasks.map((t) => upsertById(Task, t._id, t)));

  console.log("Seed complete. Summary:");
  const [deptCount, pplCount, rptCount, dpmCount, circCount, clCount, tCount] =
    await Promise.all([
      Department.countDocuments(),
      Person.countDocuments(),
      ReportingMap.countDocuments(),
      DeptPrnMap.countDocuments(),
      Circular.countDocuments(),
      Clause.countDocuments(),
      Task.countDocuments(),
    ]);

  console.log(`  Departments: ${deptCount}`);
  console.log(`  People: ${pplCount}`);
  console.log(`  Reporting links: ${rptCount}`);
  console.log(`  Dept memberships: ${dpmCount}`);
  console.log(`  Circulars: ${circCount}`);
  console.log(`  Clauses: ${clCount}`);
  console.log(`  Tasks: ${tCount}`);

  await disconnectMongo();
}

seed()
  .then(() => {
    console.log("\n✓ Mongo seeding finished.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
