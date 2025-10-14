import mongoose from "mongoose";

const ClauseSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: { type: String, required: true },
    creatorPersonId: { type: String, ref: "Person" },
    parentCircularId: { type: String, ref: "Circular" },
    assignedDeptId: { type: String, ref: "Department" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Clause", ClauseSchema);
