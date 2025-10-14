import mongoose from "mongoose";

const PersonSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String },
    name: { type: String, required: true },
    deptId: { type: String, ref: "Department" },
    directManagerId: { type: String, ref: "Person" },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Person", PersonSchema);
