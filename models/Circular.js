import mongoose from "mongoose";

const CircularSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: { type: String, required: true },
    creatorPersonId: { type: String, ref: "Person" },
    assignedDeptId: { type: String, ref: "Department" },
    parentCircularId: { type: String, ref: "Circular" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Circular", CircularSchema);
