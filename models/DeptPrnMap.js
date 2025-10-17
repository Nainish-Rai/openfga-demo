import mongoose from "mongoose";

const DeptPrnMapSchema = new mongoose.Schema(
  {
    deptId: { type: String, ref: "Department", required: true },
    personId: { type: String, ref: "Person", required: true },
    role: {
      type: String,
      enum: ["member", "manager", "dept_head", "compliance_officer"],
      required: true,
    },
  },
  { timestamps: true, versionKey: false, collection: "DeptPrnMap" }
);

DeptPrnMapSchema.index({ deptId: 1, personId: 1, role: 1 }, { unique: true });

export default mongoose.model("DeptPrnMap", DeptPrnMapSchema);
