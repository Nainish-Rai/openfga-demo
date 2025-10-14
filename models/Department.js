import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    parentDeptId: { type: String, ref: "Department" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Department", DepartmentSchema);
